const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { notifyPaymentInline } = require('./notificationController');
const PAYMENT_METHODS = require('../config/paymentMethods');
const dpoService = require('../services/dpoService');

const CARD_NETWORKS = ['card'];

function isCardNetwork(networkId) {
  return CARD_NETWORKS.includes(networkId);
}

function calculateLocalAmount(amountCents, countryCode) {
  if (countryCode === 'ZMW') return Math.round(amountCents * 0.26);
  if (countryCode === 'MWK') return Math.round(amountCents * 1.7);
  return amountCents;
}

function getCurrency(countryCode) {
  if (countryCode === 'ZMW') return 'ZMW';
  if (countryCode === 'MWK') return 'MWK';
  return 'USD';
}

const getPaymentMethods = async (req, res) => {
  res.json({ status: 'success', data: PAYMENT_METHODS.groups });
};

const enterCompetition = async (req, res) => {
  const { uid } = req.user;
  const { id: competitionId } = req.params;
  const { ideaId, network } = req.body;

  const selectedNetwork = network || 'card';

  if (!stripe && isCardNetwork(selectedNetwork)) {
    return res.status(503).json({ status: 'error', message: 'Payment service unavailable' });
  }

  try {
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) {
      return res.status(404).json({ status: 'error', message: 'Competition not found' });
    }

    const now = new Date();
    const startDate = new Date(competition.start_date);
    const deadline = new Date(competition.submission_deadline);
    if (now < startDate || now > deadline) {
      return res.status(400).json({ status: 'error', message: 'Competition is not currently accepting entries' });
    }

    const { data: paidIdeas } = await supabase
      .from('ideas')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competitionId)
      .eq('payment_status', 'paid');

    if (paidIdeas && paidIdeas.length >= 5) {
      return res.status(409).json({ status: 'error', message: 'Maximum of 5 entries reached for this competition' });
    }

    let userIdea;
    if (ideaId) {
      const { data } = await supabase
        .from('ideas')
        .select('id, payment_status')
        .eq('id', ideaId)
        .eq('user_id', uid)
        .maybeSingle();
      userIdea = data;
    } else {
      const { data } = await supabase
        .from('ideas')
        .select('id, payment_status')
        .eq('user_id', uid)
        .eq('competition_id', competitionId)
        .in('status', ['draft', 'submitted', 'pending'])
        .limit(1);
      userIdea = data && data.length > 0 ? data[0] : null;
    }

    if (!userIdea) {
      return res.status(400).json({ status: 'error', message: 'You must create an idea before paying the entry fee' });
    }

    if (userIdea.payment_status === 'paid') {
      return res.status(409).json({ status: 'error', message: 'This idea has already been paid for' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('email, full_name, phone, country')
      .eq('id', uid)
      .single();

    const country = profile?.country || 'US';

    if (isCardNetwork(selectedNetwork)) {
      if (!stripe) {
        return res.status(500).json({ status: 'error', message: 'Stripe is not configured' });
      }

      const localAmount = calculateLocalAmount(competition.entry_fee_cents, country);
      const currency = getCurrency(country);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Entry Fee: ${competition.title}`,
                description: 'Competition contestant entry fee',
              },
              unit_amount: localAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/success?type=contestant&competitionId=${competitionId}&ideaId=${userIdea.id}&session_id={CHECKOUT_SESSION_ID}&network=stripe`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/error?type=contestant&competitionId=${competitionId}&reason=cancelled`,
        metadata: {
          user_id: uid,
          competition_id: competitionId,
          type: 'contestant',
          idea_id: userIdea.id,
        },
      });

      return res.json({ status: 'success', checkoutUrl: session.url, provider: 'stripe' });
    }

    const localAmount = calculateLocalAmount(competition.entry_fee_cents, country);
    const result = await dpoService.createPaymentSession({
      amount: localAmount,
      countryCode: country,
      networkId: selectedNetwork,
      customerEmail: profile?.email,
      customerName: profile?.full_name,
      customerPhone: profile?.phone || '',
      orderId: uuidv4(),
      paymentType: 'contestant',
      competitionId,
    });

    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.error || 'Failed to create payment session' });
    }

    res.json({ status: 'success', checkoutUrl: result.checkoutUrl, transactionRef: result.transactionRef, provider: 'dpo' });
  } catch (error) {
    console.error('Enter Competition Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const registerVoter = async (req, res) => {
  const { uid } = req.user;
  const { competitionId, network } = req.body;

  const selectedNetwork = network || 'card';

  if (!stripe && isCardNetwork(selectedNetwork)) {
    return res.status(503).json({ status: 'error', message: 'Payment service unavailable' });
  }

  if (!competitionId) {
    return res.status(400).json({ status: 'error', message: 'competitionId is required' });
  }

  try {
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('id, title, voter_fee_cents')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) {
      return res.status(404).json({ status: 'error', message: 'Competition not found' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('voter_competitions_paid, email, full_name, phone, country')
      .eq('id', uid)
      .single();

    const paidCompetitions = profile?.voter_competitions_paid || [];
    if (paidCompetitions.includes(competitionId)) {
      return res.status(409).json({ status: 'error', message: 'You have already paid the voter fee for this competition' });
    }

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competitionId)
      .eq('type', 'voter')
      .eq('status', 'completed')
      .maybeSingle();

    if (existingPayment) {
      return res.status(409).json({ status: 'error', message: 'You have already paid the voter fee for this competition' });
    }

    const country = profile?.country || 'US';

    if (isCardNetwork(selectedNetwork)) {
      if (!stripe) {
        return res.status(500).json({ status: 'error', message: 'Stripe is not configured' });
      }

      const localAmount = calculateLocalAmount(competition.voter_fee_cents, country);
      const currency = getCurrency(country);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Voter Fee: ${competition.title}`,
                description: 'Competition voter registration fee',
              },
              unit_amount: localAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/success?type=voter&competitionId=${competitionId}&session_id={CHECKOUT_SESSION_ID}&network=stripe`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/error?type=voter&competitionId=${competitionId}&reason=cancelled`,
        metadata: {
          user_id: uid,
          competition_id: competitionId,
          type: 'voter',
        },
      });

      return res.json({ status: 'success', checkoutUrl: session.url, provider: 'stripe' });
    }

    const localAmount = calculateLocalAmount(competition.voter_fee_cents, country);
    const result = await dpoService.createPaymentSession({
      amount: localAmount,
      countryCode: country,
      networkId: selectedNetwork,
      customerEmail: profile?.email,
      customerName: profile?.full_name,
      customerPhone: profile?.phone || '',
      orderId: uuidv4(),
      paymentType: 'voter',
      competitionId,
    });

    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.error || 'Failed to create payment session' });
    }

    res.json({ status: 'success', checkoutUrl: result.checkoutUrl, transactionRef: result.transactionRef, provider: 'dpo' });
  } catch (error) {
    console.error('Register Voter Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).send('Payment service unavailable');
  }

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, competition_id, type, idea_id } = session.metadata;
    const amount_cents = session.amount_total;

    if (!user_id || !competition_id || !type) {
      console.error('Missing metadata in checkout session:', session.id);
      return res.status(200).send('Missing metadata');
    }

    if (type !== 'contestant' && type !== 'voter') {
      console.error('Invalid payment type:', type);
      return res.status(200).send('Invalid type');
    }

    const amount = (amount_cents / 100).toFixed(2);

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id,
        competition_id,
        type,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_cents,
        amount,
        status: 'completed',
        network_id: 'card',
        ...(type === 'contestant' && idea_id ? { idea_id } : {}),
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(200).send('Payment already processed');
      }
      console.error('Error inserting payment (side effects will still run):', insertError);
    }

    try {
      if (type === 'contestant') {
        const ideaIdToUpdate = idea_id;

        if (ideaIdToUpdate) {
          const { data: ideaToCheck } = await supabase
            .from('ideas')
            .select('status')
            .eq('id', ideaIdToUpdate)
            .single();

          const paymentUpdate = { payment_status: 'paid', updated_at: new Date().toISOString() };
          if (ideaToCheck && ideaToCheck.status === 'approved') {
            paymentUpdate.is_public = true;
          }

          await supabase
            .from('ideas')
            .update(paymentUpdate)
            .eq('id', ideaIdToUpdate);
        } else {
          const { data: ideasArr } = await supabase
            .from('ideas')
            .select('id, status')
            .eq('user_id', user_id)
            .eq('competition_id', competition_id)
            .eq('payment_status', 'unpaid')
            .limit(1);
          const fallbackIdea = ideasArr && ideasArr.length > 0 ? ideasArr[0] : null;

          if (fallbackIdea) {
            const paymentUpdate = { payment_status: 'paid', updated_at: new Date().toISOString() };
            if (fallbackIdea.status === 'approved') {
              paymentUpdate.is_public = true;
            }
            await supabase
              .from('ideas')
              .update(paymentUpdate)
              .eq('id', fallbackIdea.id);
          }
        }

        await supabase.rpc('increment_prize_pool', {
          comp_id: competition_id,
          amount: amount_cents,
        });
      } else if (type === 'voter') {
        const { data: userData } = await supabase
          .from('users')
          .select('voter_competitions_paid')
          .eq('id', user_id)
          .single();

        const currentPaid = userData?.voter_competitions_paid || [];
        if (!currentPaid.includes(competition_id)) {
          currentPaid.push(competition_id);
        }

        await supabase
          .from('users')
          .update({
            voter_payment_status: 'paid',
            voter_competitions_paid: currentPaid,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);

        await supabase.rpc('increment_prize_pool', {
          comp_id: competition_id,
          amount: amount_cents,
        });
      }
    } catch (err) {
      console.error('Error processing payment side effects:', err);
    }
  }

  notifyPaymentInline(userId, amount_cents, type === 'contestant' ? 'competition entry' : 'voter verification');

  res.status(200).send('Webhook Received');
};

const handleDpoWebhook = async (req, res) => {
  const { TransactionToken, CompanyRef, Result } = req.body;

  if (!TransactionToken) {
    return res.status(400).send('Missing TransactionToken');
  }

  if (Result !== '000') {
    return res.status(200).send('Payment not completed');
  }

  try {
    const parts = (CompanyRef || '').split('_');
    const type = parts[0];
    const competitionId = parts[1];

    if (!type || !competitionId) {
      console.error('Invalid CompanyRef format:', CompanyRef);
      return res.status(200).send('Invalid ref');
    }

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('transaction_ref', TransactionToken)
      .maybeSingle();

    if (existingPayment) {
      return res.status(200).send('Payment already processed');
    }

    const verification = await dpoService.verifyPayment(TransactionToken);

    if (!verification.success || verification.status !== 'Completed') {
      return res.status(200).send('Payment not confirmed');
    }

    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: req.body?.user_id || null,
        competition_id: competitionId,
        type,
        transaction_ref: TransactionToken,
        amount_cents: Math.round(parseFloat(verification.amount || '0') * 100),
        status: 'completed',
        network_id: 'dpo',
      })
      .select()
      .single();

    if (insertError) {
      console.error('DPO webhook insert error:', insertError);
      return res.status(200).send('Insert error');
    }

    if (type === 'contestant') {
      const { data: ideasArr } = await supabase
        .from('ideas')
        .select('id, status')
        .eq('user_id', payment.user_id)
        .eq('competition_id', competitionId)
        .eq('payment_status', 'unpaid')
        .limit(1);
      const idea = ideasArr && ideasArr.length > 0 ? ideasArr[0] : null;

      if (idea) {
        const update = { payment_status: 'paid', updated_at: new Date().toISOString() };
        if (idea.status === 'approved') {
          update.is_public = true;
        }
        await supabase.from('ideas').update(update).eq('id', idea.id);
      }

      await supabase.rpc('increment_prize_pool', {
        comp_id: competitionId,
        amount: payment.amount_cents,
      });
    } else if (type === 'voter') {
      const { data: userData } = await supabase
        .from('users')
        .select('voter_competitions_paid')
        .eq('id', payment.user_id)
        .single();

      const currentPaid = userData?.voter_competitions_paid || [];
      if (!currentPaid.includes(competitionId)) {
        currentPaid.push(competitionId);
      }

      await supabase
        .from('users')
        .update({
          voter_payment_status: 'paid',
          voter_competitions_paid: currentPaid,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      await supabase.rpc('increment_prize_pool', {
        comp_id: competitionId,
        amount: payment.amount_cents,
      });
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('DPO webhook error:', err);
    res.status(200).send('Error');
  }
};

const getPaymentHistory = async (req, res) => {
  const { uid } = req.user;

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payment history' });
  }
};

const checkEntryPayment = async (req, res) => {
  const { uid } = req.user;
  const { competitionId } = req.params;
  const { ideaId } = req.query;

  try {
    if (ideaId) {
      const { data: idea } = await supabase
        .from('ideas')
        .select('payment_status')
        .eq('id', ideaId)
        .eq('user_id', uid)
        .maybeSingle();

      return res.json({ status: 'success', paid: idea?.payment_status === 'paid' });
    }

    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competitionId)
      .eq('type', 'contestant')
      .eq('status', 'completed')
      .maybeSingle();

    if (error) throw error;

    res.json({ status: 'success', paid: !!data });
  } catch (error) {
    console.error('Error checking entry payment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify payment' });
  }
};

const checkPayment = async (req, res) => {
  try {
    const { competition_id, type } = req.query;
    const { uid } = req.user;

    if (!competition_id || !type) {
      return res.status(400).json({ error: 'Missing params' });
    }

    const { data: paymentRecord, error } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competition_id)
      .eq('type', type)
      .eq('status', 'completed')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (paymentRecord) {
      return res.json({ alreadyPaid: true });
    }

    if (type === 'voter') {
      const { data: userData } = await supabase
        .from('users')
        .select('voter_competitions_paid')
        .eq('id', uid)
        .single();

      const paidCompetitions = userData?.voter_competitions_paid || [];
      if (paidCompetitions.includes(competition_id)) {
        return res.json({ alreadyPaid: true });
      }
    }

    if (type === 'contestant') {
      const ideaId = req.query.ideaId;

      if (ideaId) {
        const { data: ideaData } = await supabase
          .from('ideas')
          .select('payment_status')
          .eq('id', ideaId)
          .eq('user_id', uid)
          .maybeSingle();

        if (ideaData?.payment_status === 'paid') {
          return res.json({ alreadyPaid: true });
        }
      } else {
        const { data: ideasArr } = await supabase
          .from('ideas')
          .select('payment_status')
          .eq('user_id', uid)
          .eq('competition_id', competition_id)
          .eq('payment_status', 'paid')
          .limit(1);

        if (ideasArr && ideasArr.length > 0) {
          return res.json({ alreadyPaid: true });
        }
      }
    }

    res.json({ alreadyPaid: false });
  } catch (err) {
    console.error('Payment check error:', err);
    res.status(500).json({ error: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { session_id, transaction_ref, competition_id, type } = req.query;
    const { uid } = req.user;

    if (!session_id && !transaction_ref) {
      return res.status(400).json({ error: 'Missing session_id or transaction_ref' });
    }

    if (transaction_ref) {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_ref', transaction_ref)
        .eq('status', 'completed')
        .maybeSingle();

      if (payment) {
        return res.json({
          verified: true,
          payment: {
            id: payment.id,
            type: payment.type,
            competition_id: payment.competition_id,
            amount_cents: payment.amount_cents,
            status: payment.status,
            created_at: payment.created_at,
          },
        });
      }

      const verification = await dpoService.verifyPayment(transaction_ref);
      if (verification.success && verification.status === 'Completed') {
        return res.json({ verified: true, pendingDb: true, provider: 'dpo' });
      }

      return res.json({ verified: false });
    }

    if (session_id) {
      let query = supabase
        .from('payments')
        .select('*')
        .eq('stripe_session_id', session_id)
        .eq('status', 'completed');

      if (uid) query = query.eq('user_id', uid);

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Payment verification query error:', error);
      }

      if (data) {
        const result = {
          verified: true,
          payment: {
            id: data.id,
            type: data.type,
            competition_id: data.competition_id,
            amount_cents: data.amount_cents,
            status: data.status,
            created_at: data.created_at,
          },
        };

        if (competition_id && data.competition_id !== competition_id) {
          result.verified = false;
        }
        if (type && data.type !== type) {
          result.verified = false;
        }

        return res.json(result);
      }

      if (!stripe) {
        return res.json({ verified: false, payment: null });
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
          const metaCompetitionId = competition_id || session.metadata?.competition_id;
          const metaType = type || session.metadata?.type || 'contestant';
          const metaIdeaId = session.metadata?.idea_id;
          const amount_cents = session.amount_total;
          const amount = (amount_cents / 100).toFixed(2);

          const { data: newPayment, error: insertError } = await supabase
            .from('payments')
            .upsert({
              user_id: uid,
              competition_id: metaCompetitionId,
              type: metaType,
              stripe_session_id: session_id,
              stripe_payment_intent_id: session.payment_intent,
              amount_cents,
              amount,
              status: 'completed',
              network_id: 'card',
              created_at: new Date().toISOString(),
              ...(metaType === 'contestant' && metaIdeaId ? { idea_id: metaIdeaId } : {}),
            }, { onConflict: 'stripe_session_id' })
            .select()
            .single();

          if (insertError && insertError.code !== '23505') {
            console.error('Error inserting fallback payment (side effects will still run):', insertError);
          }

          try {
            if (metaType === 'contestant') {
              const ideaToUpdate = metaIdeaId;

              if (ideaToUpdate) {
                const { data: ideaToCheck } = await supabase
                  .from('ideas')
                  .select('status')
                  .eq('id', ideaToUpdate)
                  .single();

                const fallbackUpdate = { payment_status: 'paid', updated_at: new Date().toISOString() };
                if (ideaToCheck && ideaToCheck.status === 'approved') {
                  fallbackUpdate.is_public = true;
                }

                await supabase
                  .from('ideas')
                  .update(fallbackUpdate)
                  .eq('id', ideaToUpdate);
              } else {
                const { data: ideasArr } = await supabase
                  .from('ideas')
                  .select('id, status')
                  .eq('user_id', uid)
                  .eq('competition_id', metaCompetitionId)
                  .eq('payment_status', 'unpaid')
                  .limit(1);
                const fallbackIdea = ideasArr && ideasArr.length > 0 ? ideasArr[0] : null;

                if (fallbackIdea) {
                  const fbUpdate = { payment_status: 'paid', updated_at: new Date().toISOString() };
                  if (fallbackIdea.status === 'approved') {
                    fbUpdate.is_public = true;
                  }
                  await supabase
                    .from('ideas')
                    .update(fbUpdate)
                    .eq('id', fallbackIdea.id);
                }
              }

              await supabase.rpc('increment_prize_pool', {
                comp_id: metaCompetitionId,
                amount: amount_cents,
              });
            } else if (metaType === 'voter') {
              const { data: userData } = await supabase
                .from('users')
                .select('voter_competitions_paid')
                .eq('id', uid)
                .single();

              const currentPaid = userData?.voter_competitions_paid || [];
              if (!currentPaid.includes(metaCompetitionId)) {
                currentPaid.push(metaCompetitionId);
              }

              await supabase
                .from('users')
                .update({
                  voter_payment_status: 'paid',
                  voter_competitions_paid: currentPaid,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', uid);

              await supabase.rpc('increment_prize_pool', {
                comp_id: metaCompetitionId,
                amount: amount_cents,
              });
            }
          } catch (sideEffectErr) {
            console.error('Fallback side effects error:', sideEffectErr);
          }

          return res.json({ verified: true, payment: newPayment || { id: session_id, type: metaType, competition_id: metaCompetitionId, amount_cents: session.amount_total } });
        }
      } catch (stripeErr) {
        console.error('Stripe fallback check error:', stripeErr);
      }

      return res.json({ verified: false, payment: null });
    }

    res.json({ verified: false, payment: null });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

const getMyCompetitions = async (req, res) => {
  const { uid } = req.user;

  try {
    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select('competition_id, type')
      .eq('user_id', uid)
      .eq('status', 'completed');

    if (payError) throw payError;

    const competitionIds = new Set();
    const joinedRoles = {};

    if (payments) {
      for (const p of payments) {
        if (p.competition_id) {
          competitionIds.add(p.competition_id);
          if (!joinedRoles[p.competition_id]) joinedRoles[p.competition_id] = [];
          if (!joinedRoles[p.competition_id].includes(p.type)) {
            joinedRoles[p.competition_id].push(p.type);
          }
        }
      }
    }

    const { data: ideas, error: ideaError } = await supabase
      .from('ideas')
      .select('competition_id')
      .eq('user_id', uid)
      .eq('payment_status', 'paid')
      .not('competition_id', 'is', null);

    if (!ideaError && ideas) {
      for (const idea of ideas) {
        if (idea.competition_id) {
          competitionIds.add(idea.competition_id);
          if (!joinedRoles[idea.competition_id]) joinedRoles[idea.competition_id] = [];
          if (!joinedRoles[idea.competition_id].includes('contestant')) {
            joinedRoles[idea.competition_id].push('contestant');
          }
        }
      }
    }

    if (competitionIds.size === 0) {
      return res.json({ status: 'success', data: [] });
    }

    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .in('id', Array.from(competitionIds))
      .not('is_deleted', 'eq', true)
      .order('created_at', { ascending: false });

    if (compError) throw compError;

    const now = new Date();
    const enriched = (competitions || []).map(c => {
      const startDate = new Date(c.start_date);
      const deadline = new Date(c.submission_deadline);
      let calculatedStatus = 'closed';
      if (now < startDate) calculatedStatus = 'upcoming';
      else if (now <= deadline) calculatedStatus = 'active';
      return {
        ...c,
        calculatedStatus,
        joined_as: joinedRoles[c.id] || [],
      };
    });

    res.json({ status: 'success', data: enriched });
  } catch (error) {
    console.error('Error fetching my competitions:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch your competitions' });
  }
};

module.exports = { getPaymentMethods, enterCompetition, registerVoter, handleStripeWebhook, handleDpoWebhook, getPaymentHistory, checkEntryPayment, checkPayment, verifyPayment, getMyCompetitions };
