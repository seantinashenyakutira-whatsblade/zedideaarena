const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { db } = require('../config/firebase');

const PARTICIPATION_FEE = 10000; // in cents (e.g., $100.00)
const CURRENCY = 'usd';

/**
 * Create Payment Intent
 */
const createPaymentIntent = async (req, res) => {
  const { uid } = req.user;
  const { ideaId, type, amount } = req.body;

  if (!type || !amount) {
    return res.status(400).json({ status: 'error', message: 'Type and amount are required' });
  }

  if (!stripe) {
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        status: 'success',
        clientSecret: 'manual_payment_intent_secret_' + Math.random().toString(36).substr(2, 9)
      });
    }
    return res.status(503).json({ status: 'error', message: 'Payment service unavailable' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount) * 100, // convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId: uid,
        type: type,
        ideaId: ideaId || 'none'
      }
    });

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe Intent Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to initialize payment' });
  }
};

/**
 * Handle Stripe Webhook
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId, type, ideaId } = paymentIntent.metadata;

    console.log(`Payment succeeded for user ${userId}, type ${type}`);

    try {
      if (type === 'contestant' && ideaId !== 'none') {
        await db.collection('ideas').doc(ideaId).update({
          payment_status: 'paid',
          updatedAt: new Date().toISOString()
        });
        // Also mark user as participant
        await db.collection('users').doc(userId).update({
          competition_participant: true,
          updatedAt: new Date().toISOString()
        });
      } else if (type === 'voter') {
        await db.collection('users').doc(userId).update({
          voter_payment_status: 'paid',
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error updating status after payment:', err);
    }
  }

  res.status(200).send('Webhook Received');
};

module.exports = { createPaymentIntent, handleWebhook };
