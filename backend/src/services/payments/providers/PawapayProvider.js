const crypto = require('crypto');
const PaymentProvider = require('../PaymentProvider');
const { getAllowedMethods, getCorrespondent, CARD_METHODS } = require('../../../config/paymentMethodsResolver');

const PAWAPAY_API_BASE = process.env.PAWAPAY_API_URL || 'https://api.pawapay.com/v1';
const PAWAPAY_API_KEY = process.env.PAWAPAY_API_KEY || '';
const PAWAPAY_CALLBACK_URL = process.env.PAWAPAY_CALLBACK_URL || '';
const PAWAPAY_WEBHOOK_SECRET = process.env.PAWAPAY_WEBHOOK_SECRET || '';

class PawapayProvider extends PaymentProvider {
  get name() {
    return 'pawapay';
  }

  get isConfigured() {
    return !!PAWAPAY_API_KEY;
  }

  async getSupportedMethods(countryCode) {
    const allowed = getAllowedMethods(countryCode);
    return [...allowed.mobile, ...allowed.card];
  }

  async createPayment({ amount, currency, paymentMethod, customer, metadata, description, idempotencyKey }) {
    if (!this.isConfigured) {
      return { success: false, error: 'PawaPay is not configured' };
    }

    const correspondent = getCorrespondent(paymentMethod);
    if (!correspondent) {
      return { success: false, error: `Unsupported payment method: ${paymentMethod}` };
    }

    try {
      const body = {
        depositId: idempotencyKey,
        amount: { currency: currency || 'USD', amount: String(amount) },
        correspondent,
        customer: {
          email: customer?.email,
          name: customer?.name,
          phone: customer?.phone?.replace(/[^0-9]/g, ''),
        },
        statementDescription: description || 'ZedIdeaArena payment',
        callbackUrl: PAWAPAY_CALLBACK_URL,
        metadata: {
          userId: metadata?.userId,
          competitionId: metadata?.competitionId,
          ideaId: metadata?.ideaId,
          type: metadata?.type,
        },
      };

      const response = await fetch(`${PAWAPAY_API_BASE}/deposits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAWAPAY_API_KEY}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('PawaPay createPayment error:', response.status, errorBody);
        return { success: false, error: `PawaPay API error: ${response.status}` };
      }

      const data = await response.json();

      return {
        success: true,
        transactionRef: idempotencyKey,
        depositId: data.depositId,
        provider: 'pawapay',
        status: data.status || 'pending',
      };
    } catch (err) {
      console.error('PawaPay createPayment exception:', err);
      return { success: false, error: err.message };
    }
  }

  async verifyPayment({ transactionRef }) {
    if (!this.isConfigured) {
      return { success: false, error: 'PawaPay is not configured' };
    }

    try {
      const response = await fetch(`${PAWAPAY_API_BASE}/deposits/${transactionRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAWAPAY_API_KEY}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: `PawaPay API error: ${response.status}` };
      }

      const data = await response.json();

      const statusMap = {
        'completed': 'completed',
        'failed': 'failed',
        'pending': 'pending',
        'expired': 'expired',
        'cancelled': 'cancelled',
      };

      return {
        success: true,
        status: statusMap[data.status] || 'pending',
        amount: data.amount?.amount ? parseInt(data.amount.amount, 10) : null,
        currency: data.amount?.currency,
        customer: data.customer,
        metadata: data.metadata,
      };
    } catch (err) {
      console.error('PawaPay verifyPayment exception:', err);
      return { success: false, error: err.message };
    }
  }

  async refundPayment({ transactionRef, amount, reason }) {
    if (!this.isConfigured) {
      return { success: false, error: 'PawaPay is not configured' };
    }

    try {
      const body = {
        amount: { amount: String(amount) },
        reason: reason || 'Refund requested',
      };

      const response = await fetch(`${PAWAPAY_API_BASE}/deposits/${transactionRef}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAWAPAY_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('PawaPay refundPayment error:', response.status, errorBody);
        return { success: false, error: `PawaPay refund error: ${response.status}` };
      }

      const data = await response.json();

      return {
        success: true,
        refundRef: data.refundId || transactionRef,
      };
    } catch (err) {
      console.error('PawaPay refundPayment exception:', err);
      return { success: false, error: err.message };
    }
  }

  async getPaymentStatus({ transactionRef }) {
    return this.verifyPayment({ transactionRef });
  }

  async handleWebhook(payload, headers, rawBody) {
    try {
      if (!this._verifySignature(rawBody, headers)) {
        return { success: false, error: 'Invalid webhook signature' };
      }

      const event = payload;

      if (!event || !event.depositId) {
        return { success: false, error: 'Invalid webhook payload' };
      }

      const statusMap = {
        'deposit.completed': 'completed',
        'deposit.failed': 'failed',
        'deposit.expired': 'expired',
        'deposit.cancelled': 'cancelled',
      };

      const eventType = event.type || event.eventType;
      const status = statusMap[eventType] || event.status || 'pending';

      return {
        success: true,
        event: eventType,
        transactionRef: event.depositId,
        status,
        amount: event.amount?.amount ? parseInt(event.amount.amount, 10) : null,
        currency: event.amount?.currency,
        metadata: event.metadata,
      };
    } catch (err) {
      console.error('PawaPay handleWebhook exception:', err);
      return { success: false, error: err.message };
    }
  }

  _verifySignature(rawBody, headers) {
    if (!PAWAPAY_WEBHOOK_SECRET) {
      return true;
    }

    if (!rawBody) {
      return false;
    }

    const signature = headers['x-signature'] || headers['X-Signature'];
    if (!signature) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', PAWAPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    try {
      const sigBuf = Buffer.from(signature, 'hex');
      const expBuf = Buffer.from(expected, 'hex');
      if (sigBuf.length !== expBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }
}

module.exports = PawapayProvider;
