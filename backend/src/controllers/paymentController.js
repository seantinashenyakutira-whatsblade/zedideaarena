const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const enterCompetition = async (req, res) => {
  const { uid } = req.user;
  const { id: competitionId } = req.params;

  if (!stripe) {
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

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competitionId)
      .eq('type', 'contestant')
      .eq('status', 'completed')
      .maybeSingle();

    if (existingPayment) {
      return res.status(409).json({ status: 'error', message: 'You have already paid the entry fee for this competition' });
    }

    const { data: userIdea } = await supabase
      .from('ideas')
      .select('id')
      .eq('user_id', uid)
      .eq('competition_id', competitionId)
      .maybeSingle();

    if (!userIdea) {
      return res.status(400).json({ status: 'error', message: 'You must create an idea before paying the entry fee' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Entry Fee: ${competition.title}`,
              description: 'Competition contestant entry fee',
            },
            unit_amount: competition.entry_fee_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/competitions/${competitionId}/submit?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/competitions/${competitionId}`,
      metadata: {
        user_id: uid,
        competition_id: competitionId,
        type: 'contestant',
      },
    });

    res.json({ status: 'success', checkoutUrl: session.url });
  } catch (error) {
    console.error('Enter Competition Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const registerVoter = async (req, res) => {
  const { uid } = req.user;
  const { competitionId } = req.body;

  if (!stripe) {
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
      .select('voter_competitions_paid')
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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Voter Fee: ${competition.title}`,
              description: 'Competition voter registration fee',
            },
            unit_amount: competition.voter_fee_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/success?type=voter&competitionId=${competitionId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/voter`,
      metadata: {
        user_id: uid,
        competition_id: competitionId,
        type: 'voter',
      },
    });

    res.json({ status: 'success', checkoutUrl: session.url });
  } catch (error) {
    console.error('Register Voter Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const handleStripeWebhook = async (req, res) => {
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
    const { user_id, competition_id, type } = session.metadata;
    const amount_cents = session.amount_total;

    if (!user_id || !competition_id || !type) {
      console.error('Missing metadata in checkout session:', session.id);
      return res.status(200).send('Missing metadata');
    }

    if (type !== 'contestant' && type !== 'voter') {
      console.error('Invalid payment type:', type);
      return res.status(200).send('Invalid type');
    }

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id,
        competition_id,
        type,
        stripe_session_id: session.id,
        amount_cents,
        status: 'completed',
      });

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(200).send('Payment already processed');
      }
      console.error('Error inserting payment:', insertError);
      return res.status(200).send('Insert error');
    }

    try {
      if (type === 'contestant') {
        await supabase
          .from('ideas')
          .update({ is_public: true, updated_at: new Date().toISOString() })
          .eq('user_id', user_id)
          .eq('competition_id', competition_id);

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

  res.status(200).send('Webhook Received');
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

  try {
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

    const { data, error } = await supabase
      .from('payments')
      .select('id, status')
      .eq('user_id', uid)
      .eq('competition_id', competition_id)
      .eq('type', type)
      .eq('status', 'completed')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ alreadyPaid: !!data });
  } catch (err) {
    console.error('Payment check error:', err);
    res.status(500).json({ error: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { session_id, competition_id, type } = req.query;
    const { uid } = req.user;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session_id' });
    }

    const query = supabase
      .from('payments')
      .select('*')
      .eq('stripe_session_id', session_id)
      .eq('status', 'completed');

    if (uid) query.eq('user_id', uid);

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({ error: 'Verification failed' });
    }

    if (!data) {
      return res.json({ verified: false, payment: null });
    }

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

    res.json(result);
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { enterCompetition, registerVoter, handleStripeWebhook, getPaymentHistory, checkEntryPayment, checkPayment, verifyPayment };
