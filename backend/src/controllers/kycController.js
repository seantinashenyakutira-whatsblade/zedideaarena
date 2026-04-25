const axios = require('axios');
const crypto = require('crypto');
const { db } = require('../config/firebase');

/**
 * Submit KYC - Initiate Didit.me Session
 */
const submitKYC = async (req, res) => {
  const { uid } = req.user;
  const workflowId = process.env.DIDIT_WORKFLOW_ID;
  const apiKey = process.env.DIDIT_API_KEY;

  if (!workflowId || !apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'Didit.me configuration missing on server.'
    });
  }

  try {
    const response = await axios.post(
      'https://verification.didit.me/v3/session/',
      {
        workflow_id: workflowId,
        vendor_data: uid,
        callback: process.env.DIDIT_CALLBACK_URL || 'http://localhost:5173/kyc/callback'
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const sessionData = response.data;

    // Track the session ID in Firestore
    await db.collection('users').doc(uid).update({
      didit_session_id: sessionData.id,
      kyc_status: 'pending',
      updatedAt: new Date().toISOString()
    });

    res.json({
      status: 'success',
      message: 'Verification session created',
      url: sessionData.url,
      sessionId: sessionData.id
    });
  } catch (error) {
    console.error('Error initiating KYC session:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate verification session'
    });
  }
};

/**
 * KYC Webhook - Update User Status from Didit.me
 */
const handleWebhook = async (req, res) => {
  const signature = req.headers['x-didit-signature'] || req.headers['x-didit-hmac-sha256'];
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  const payload = req.body;

  if (!secret) {
    console.error('KYC Webhook error: DIDIT_WEBHOOK_SECRET not configured.');
    return res.status(500).send('Webhook secret missing');
  }

  // Verify Webhook Signature
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const bodyStr = JSON.stringify(payload);
    console.log('HMAC Source String:', bodyStr);
    const calculatedSignature = hmac.update(bodyStr).digest('hex');

    if (calculatedSignature !== signature) {
      console.warn('KYC Webhook: Invalid signature received.');
      console.log('Expected:', calculatedSignature);
      console.log('Received:', signature);
      return res.status(401).send('Invalid signature');
    }

    const { vendor_data, status, webhook_type } = payload;
    const uid = vendor_data; 

    if (!uid) {
      console.warn('KYC Webhook: No vendor_data (uid) found in payload.');
      return res.status(400).send('No user ID in payload');
    }

    // Map Didit.me status to our internal system
    // Approved -> verified
    // Rejected/Failed -> rejected
    // Pending/Review -> pending/review
    let kycStatus = 'review';
    let isVerified = false;

    if (status === 'Approved') {
      kycStatus = 'verified';
      isVerified = true;
    } else if (status === 'Rejected' || status === 'Failed') {
      kycStatus = 'rejected';
      isVerified = false;
    }

    await db.collection('users').doc(uid).set({
      kyc_status: kycStatus,
      is_verified: isVerified,
      kyc_last_webhook_type: webhook_type,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`KYC Status updated for user ${uid}: ${kycStatus} (Source: ${status})`);
    res.status(200).send('Webhook processed');

  } catch (error) {
    console.error('Error processing KYC webhook:', error.message);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
};

module.exports = {
  submitKYC,
  handleWebhook
};
