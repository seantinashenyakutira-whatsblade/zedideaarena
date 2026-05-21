const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { supabase } = require('../config/supabase');

const createPaymentIntent = async (req, res) => {
  const { uid } = req.user;
  const { ideaId, type, amount } = req.body;

  if (!type || !amount) {
    return res.status(400).json({ status: 'error', message: 'Type and amount are required' });
  }

  if (!stripe) {
    return res.status(503).json({ status: 'error', message: 'Payment service unavailable' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount) * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId: uid,
        type: type,
        ideaId: ideaId || 'none',
      },
    });

    await supabase.from('payments').insert({
      user_id: uid,
      idea_id: ideaId !== 'none' ? ideaId : null,
      type,
      amount: parseInt(amount),
      status: 'pending',
      stripe_payment_intent_id: paymentIntent.id,
    });

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Intent Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to initialize payment' });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, type, ideaId } = paymentIntent.metadata;

    try {
      await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (type === 'contestant' && ideaId !== 'none') {
        await supabase
          .from('ideas')
          .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', ideaId);

        await supabase
          .from('users')
          .update({ competition_participant: true, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } else if (type === 'voter') {
        await supabase
          .from('users')
          .update({ voter_payment_status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (err) {
      console.error('Error updating status after payment:', err);
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    try {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    } catch (err) {
      console.error('Error logging failed payment:', err);
    }
  } else if (event.type === 'payment_intent.canceled') {
    const paymentIntent = event.data.object;

    try {
      await supabase
        .from('payments')
        .update({ status: 'canceled' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    } catch (err) {
      console.error('Error logging canceled payment:', err);
    }
  }

  res.status(200).send('Webhook Received');
};

module.exports = { createPaymentIntent, handleWebhook };
