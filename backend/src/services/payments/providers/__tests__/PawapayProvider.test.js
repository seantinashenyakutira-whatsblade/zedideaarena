const mockFetch = jest.fn();
global.fetch = mockFetch;

const PawapayProvider = require('../PawapayProvider');

function createConfiguredProvider() {
  process.env.PAWAPAY_API_KEY = 'test-key';
  jest.resetModules();
  const FreshPawapay = require('../PawapayProvider');
  return new FreshPawapay();
}

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  delete process.env.PAWAPAY_API_KEY;
  delete process.env.PAWAPAY_WEBHOOK_SECRET;
});

describe('PawapayProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new PawapayProvider();
  });

  describe('name', () => {
    it('returns pawapay', () => {
      expect(provider.name).toBe('pawapay');
    });
  });

  describe('isConfigured', () => {
    it('returns false when API key is not set', () => {
      expect(provider.isConfigured).toBe(false);
    });

    it('returns true when API key is set', () => {
      const fresh = createConfiguredProvider();
      expect(fresh.isConfigured).toBe(true);
    });
  });

  describe('getSupportedMethods', () => {
    it('returns mobile and card methods for ZM', async () => {
      const methods = await provider.getSupportedMethods('ZM');
      const ids = methods.map(m => m.id);
      expect(ids).toContain('mtn-zm');
      expect(ids).toContain('airtel-zm');
      expect(ids).toContain('card');
    });

    it('returns mobile and card methods for TZ', async () => {
      const methods = await provider.getSupportedMethods('TZ');
      const ids = methods.map(m => m.id);
      expect(ids).toContain('m-pesa-tz');
      expect(ids).toContain('airtel-tz');
      expect(ids).toContain('tigo-tz');
      expect(ids).toContain('card');
    });

    it('returns mobile and card methods for UG', async () => {
      const methods = await provider.getSupportedMethods('UG');
      const ids = methods.map(m => m.id);
      expect(ids).toContain('airtel-ug');
      expect(ids).toContain('mtn-ug');
      expect(ids).toContain('card');
    });

    it('returns only card for unknown country', async () => {
      const methods = await provider.getSupportedMethods('US');
      expect(methods).toHaveLength(1);
      expect(methods[0].id).toBe('card');
    });
  });

  describe('createPayment', () => {
    const methodId = 'mtn-zm';

    it('returns error when not configured', async () => {
      const result = await provider.createPayment({ amount: 500, paymentMethod: methodId });
      expect(result.success).toBe(false);
      expect(result.error).toBe('PawaPay is not configured');
    });

    it('returns error for unsupported payment method', async () => {
      const fresh = createConfiguredProvider();
      const result = await fresh.createPayment({ amount: 500, paymentMethod: 'unsupported' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported payment method');
    });

    it('successfully creates a deposit', async () => {
      const fresh = createConfiguredProvider();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ depositId: 'dep-123', status: 'pending' }),
      });

      const result = await fresh.createPayment({
        amount: 500,
        currency: 'USD',
        paymentMethod: methodId,
        customer: { email: 'test@test.com', phone: '+260971234567' },
        idempotencyKey: 'idem-001',
      });

      expect(result.success).toBe(true);
      expect(result.transactionRef).toBe('idem-001');
      expect(result.depositId).toBe('dep-123');
      expect(result.status).toBe('pending');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawapay.com/v1/deposits',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('handles API error response', async () => {
      const fresh = createConfiguredProvider();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      const result = await fresh.createPayment({
        amount: 500,
        paymentMethod: methodId,
        idempotencyKey: 'idem-002',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('400');
    });

    it('handles network error', async () => {
      const fresh = createConfiguredProvider();

      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await fresh.createPayment({
        amount: 500,
        paymentMethod: methodId,
        idempotencyKey: 'idem-003',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
    });
  });

  describe('verifyPayment', () => {
    it('returns error when not configured', async () => {
      const result = await provider.verifyPayment({ transactionRef: 'tx-001' });
      expect(result.success).toBe(false);
    });

    it('returns completed status for a verified deposit', async () => {
      const fresh = createConfiguredProvider();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          amount: { amount: '500', currency: 'USD' },
          customer: { email: 'test@test.com' },
        }),
      });

      const result = await fresh.verifyPayment({ transactionRef: 'tx-001' });
      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(500);
    });
  });

  describe('refundPayment', () => {
    it('returns error when not configured', async () => {
      const result = await provider.refundPayment({ transactionRef: 'tx-001' });
      expect(result.success).toBe(false);
    });

    it('successfully processes a refund', async () => {
      const fresh = createConfiguredProvider();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ refundId: 'ref-001' }),
      });

      const result = await fresh.refundPayment({ transactionRef: 'tx-001', amount: 500 });
      expect(result.success).toBe(true);
      expect(result.refundRef).toBe('ref-001');
    });
  });

  describe('getPaymentStatus', () => {
    it('delegates to verifyPayment', async () => {
      const fresh = createConfiguredProvider();
      const spy = jest.spyOn(fresh, 'verifyPayment').mockResolvedValue({ success: true, status: 'completed' });

      const result = await fresh.getPaymentStatus({ transactionRef: 'tx-001' });
      expect(result.success).toBe(true);
      expect(spy).toHaveBeenCalledWith({ transactionRef: 'tx-001' });
    });
  });

  describe('handleWebhook', () => {
    it('rejects request with invalid signature when secret is set', async () => {
      process.env.PAWAPAY_WEBHOOK_SECRET = 'secret-123';
      const fresh = createConfiguredProvider();
      const payload = Buffer.from(JSON.stringify({ depositId: 'dep-001', type: 'deposit.completed' }));

      const result = await fresh.handleWebhook(
        JSON.parse(payload.toString()),
        { 'x-signature': 'invalid' },
        payload
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('accepts request when webhook secret is not set', async () => {
      const payload = Buffer.from(JSON.stringify({ depositId: 'dep-001', type: 'deposit.completed' }));

      const result = await provider.handleWebhook(
        JSON.parse(payload.toString()),
        { 'x-signature': 'whatever' },
        payload
      );

      expect(result.success).toBe(true);
    });

    it('processes deposit.completed event', async () => {
      const payload = {
        depositId: 'dep-001',
        type: 'deposit.completed',
        amount: { amount: '1000', currency: 'USD' },
        metadata: { userId: 'user-1' },
      };

      const result = await provider.handleWebhook(payload, {}, Buffer.from(JSON.stringify(payload)));

      expect(result.success).toBe(true);
      expect(result.event).toBe('deposit.completed');
      expect(result.transactionRef).toBe('dep-001');
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(1000);
    });

    it('processes deposit.failed event', async () => {
      const payload = {
        depositId: 'dep-002',
        type: 'deposit.failed',
      };

      const result = await provider.handleWebhook(payload, {}, Buffer.from(JSON.stringify(payload)));

      expect(result.success).toBe(true);
      expect(result.status).toBe('failed');
    });

    it('rejects payload without depositId', async () => {
      const result = await provider.handleWebhook({}, {}, Buffer.from('{}'));
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook payload');
    });
  });
});
