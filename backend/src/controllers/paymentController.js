const { supabase } = require('../config/supabase');
const { notifyPaymentInline } = require('./notificationController');

const paymentService = global.__paymentService;

const getPaymentMethods = async (req, res) => {
  let countryCode = req.query.country;

  if (!countryCode && req.user) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('country')
        .eq('id', req.user.uid)
        .maybeSingle();

      if (profile?.country) {
        countryCode = profile.country;
      }
    } catch {
      // fall through to default
    }
  }

  countryCode = countryCode || 'US';

  if (!paymentService) {
    return res.json({
      status: 'success',
      data: [
        { id: 'mobile_money', name: 'Mobile Money', methods: [] },
      ],
    });
  }

  const methodsByProvider = await paymentService.getSupportedMethods(countryCode);
  const allMethods = methodsByProvider.flatMap(p => p.methods);
  const mobileMethods = allMethods.filter(m => m.id !== 'card');
  const cardMethods = allMethods.filter(m => m.id === 'card');

  const groups = [];
  if (cardMethods.length > 0) {
    groups.push({ id: 'cards', name: 'Cards', methods: cardMethods });
  }
  if (mobileMethods.length > 0) {
    groups.push({ id: 'mobile_money', name: 'Mobile Money', methods: mobileMethods });
  }

  res.json({ status: 'success', data: groups, country: countryCode });
};

const enterCompetition = async (req, res) => {
  const { uid } = req.user;
  const { id: competitionId } = req.params;
  const { ideaId, network } = req.body;

  const paymentMethod = network || 'card';

  if (!paymentService) {
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

    const result = await paymentService.createPayment({
      paymentMethod,
      amount: competition.entry_fee_cents,
      currency: 'USD',
      customer: {
        email: profile?.email,
        name: profile?.full_name,
        phone: profile?.phone,
      },
      metadata: {
        userId: uid,
        competitionId,
        ideaId: userIdea.id,
        type: 'contestant',
      },
      description: `Entry Fee: ${competition.title}`,
    });

    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.error || 'Failed to create payment' });
    }

    res.json({
      status: 'success',
      checkoutUrl: result.checkoutUrl || null,
      transactionRef: result.transactionRef,
      provider: result.provider || 'pawapay',
    });
  } catch (error) {
    console.error('Enter Competition Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const registerVoter = async (req, res) => {
  const { uid } = req.user;
  const { competitionId, network } = req.body;

  const paymentMethod = network || 'card';

  if (!paymentService) {
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

    const result = await paymentService.createPayment({
      paymentMethod,
      amount: competition.voter_fee_cents,
      currency: 'USD',
      customer: {
        email: profile?.email,
        name: profile?.full_name,
        phone: profile?.phone,
      },
      metadata: {
        userId: uid,
        competitionId,
        type: 'voter',
      },
      description: `Voter Fee: ${competition.title}`,
    });

    if (!result.success) {
      return res.status(500).json({ status: 'error', message: result.error || 'Failed to create payment' });
    }

    res.json({
      status: 'success',
      checkoutUrl: result.checkoutUrl || null,
      transactionRef: result.transactionRef,
      provider: result.provider || 'pawapay',
    });
  } catch (error) {
    console.error('Register Voter Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create checkout session' });
  }
};

const handlePawapayWebhook = async (req, res) => {
  if (!paymentService) {
    return res.status(503).send('Payment service unavailable');
  }

  try {
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf-8'));
    } catch {
      payload = req.body;
    }

    const result = await paymentService.handleWebhook({
      provider: 'pawapay',
      payload,
      headers: req.headers,
      rawBody,
    });

    if (!result.success) {
      console.error('Pawapay webhook processing error:', result.error);
      return res.status(200).send('Webhook processed with errors');
    }

    if (result.payment) {
      const { user_id, type, competition_id, idea_id, amount_cents } = result.payment;

      try {
        if (user_id) {
          notifyPaymentInline(user_id, amount_cents, type === 'contestant' ? 'competition entry' : 'voter verification');
        }
      } catch (err) {
        console.error('Notification error in webhook:', err);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Pawapay webhook error:', err);
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
    const { transaction_ref, competition_id, type } = req.query;
    const { uid } = req.user;

    if (!transaction_ref) {
      return res.status(400).json({ error: 'Missing transaction_ref' });
    }

    if (!paymentService) {
      return res.json({ verified: false, payment: null });
    }

    const result = await paymentService.verifyPayment({
      transactionRef: transaction_ref,
      provider: 'pawapay',
    });

    if (result.verified && result.payment) {
      const response = {
        verified: true,
        payment: {
          id: result.payment.id,
          type: result.payment.type,
          competition_id: result.payment.competition_id,
          amount_cents: result.payment.amount_cents,
          status: result.payment.status,
          created_at: result.payment.created_at,
        },
      };

      if (competition_id && result.payment.competition_id !== competition_id) {
        response.verified = false;
      }
      if (type && result.payment.type !== type) {
        response.verified = false;
      }

      return res.json(response);
    }

    res.json({
      verified: false,
      payment: null,
      gateway_status: result.gateway_status || null,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { transaction_ref } = req.query;
    const { uid } = req.user;

    if (!transaction_ref) {
      return res.status(400).json({ error: 'Missing transaction_ref' });
    }

    if (!paymentService) {
      return res.json({ status: 'unknown' });
    }

    const result = await paymentService.getPaymentStatusPoll({
      transactionRef: transaction_ref,
      provider: 'pawapay',
    });

    return res.json({
      status: result.status,
      payment: result.payment ? {
        id: result.payment.id,
        type: result.payment.type,
        competition_id: result.payment.competition_id,
        amount_cents: result.payment.amount_cents,
        created_at: result.payment.created_at,
      } : null,
    });
  } catch (err) {
    console.error('Payment status poll error:', err);
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

module.exports = { getPaymentMethods, enterCompetition, registerVoter, handlePawapayWebhook, getPaymentHistory, checkEntryPayment, checkPayment, verifyPayment, checkPaymentStatus, getMyCompetitions };
