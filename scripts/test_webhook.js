const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const SECRET = process.env.DIDIT_WEBHOOK_SECRET;
const WEBHOOK_URL = 'http://localhost:5000/api/kyc/webhook';

const payload = {
  status: 'Approved',
  vendor_data: 'dev-user-123',
  webhook_type: 'status.updated',
  session_id: 'test-session-' + Date.now(),
  workflow_id: process.env.DIDIT_WORKFLOW_ID || 'test-workflow'
};

async function sendTestWebhook() {
  if (!SECRET || SECRET === '...') {
    console.error('❌ ERROR: DIDIT_WEBHOOK_SECRET is not set in your .env file.');
    return;
  }

  console.log('🚀 Sending manual KYC webhook simulation...');

  const bodyStr = JSON.stringify(payload);
  console.log('HMAC Source String:', bodyStr);
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(bodyStr)
    .digest('hex');

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'x-didit-signature': signature,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Server Response:', response.data);
    console.log('\nResult: If you see "Webhook processed", go check your Dashboard!');
  } catch (error) {
    console.error('❌ Webhook failed:', error.response?.data || error.message);
  }
}

sendTestWebhook();
