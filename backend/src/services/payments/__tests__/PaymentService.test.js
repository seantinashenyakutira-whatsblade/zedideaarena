let mockDbData = null;
let mockDbError = null;
let mockInsertError = null;

function mockBuildQuery() {
  const q = {
    eq: jest.fn(() => q),
    neq: jest.fn(() => q),
    in: jest.fn(() => q),
    or: jest.fn(() => q),
    not: jest.fn(() => q),
    gte: jest.fn(() => q),
    lte: jest.fn(() => q),
    order: jest.fn(() => q),
    limit: jest.fn(() => q),
    range: jest.fn(() => q),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: mockDbData, error: mockDbError })),
    maybeSingle: jest.fn().mockImplementation(() => Promise.resolve({ data: mockDbData, error: mockDbError })),
  };
  return q;
}

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockImplementation(() => Promise.resolve({ error: mockInsertError, data: null })),
      select: jest.fn(() => mockBuildQuery()),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null, data: null }),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null, data: null }),
      })),
    })),
  },
}));

const { supabase } = require('../../../config/supabase');
const PaymentService = require('../PaymentService');
const PaymentProvider = require('../PaymentProvider');

class MockProvider extends PaymentProvider {
  get name() { return 'mock'; }
  get isConfigured() { return true; }

  async createPayment({ amount, currency, paymentMethod, customer, metadata, description, idempotencyKey }) {
    return {
      success: true,
      transactionRef: idempotencyKey || 'mock-tx',
      provider: 'mock',
      status: 'pending',
    };
  }

  async verifyPayment({ transactionRef }) {
    return { success: true, status: 'completed', amount: 500 };
  }

  async refundPayment({ transactionRef, amount, reason }) {
    return { success: true, refundRef: 'ref-' + transactionRef };
  }

  async handleWebhook(payload, headers, rawBody) {
    return {
      success: true,
      transactionRef: payload.depositId,
      status: payload.status || 'completed',
      amount: payload.amount,
    };
  }

  async getSupportedMethods(countryCode) {
    return [{ provider: 'mock', id: 'card', name: 'Card', icon: 'card', networks: ['visa'] }];
  }
}

describe('PaymentService', () => {
  let service;
  let provider;

  beforeEach(() => {
    mockDbData = null;
    mockDbError = null;
    mockInsertError = null;
    service = new PaymentService();
    provider = new MockProvider();
    service.registerProvider(provider);
  });

  describe('constructor', () => {
    it('creates an empty provider map', () => {
      const s = new PaymentService();
      expect(s.isReady).toBe(false);
    });

    it('supabase mock works', () => {
      const result = supabase.from('payments');
      expect(typeof result.select).toBe('function');
    });
  });

  describe('registerProvider', () => {
    it('registers a provider by name', () => {
      expect(service.getAvailableProviders()).toEqual(['mock']);
    });

    it('throws if provider has no name', () => {
      expect(() => service.registerProvider({})).toThrow('must have a name');
    });
  });

  describe('createPayment', () => {
    it('creates payment via provider and inserts DB record', async () => {
      const result = await service.createPayment({
        paymentMethod: 'mtn',
        amount: 500,
        metadata: { userId: 'user-1', competitionId: 'comp-1', ideaId: 'idea-1', type: 'contestant' },
      });

      expect(result.success).toBe(true);
      expect(result.transactionRef).toBeTruthy();

      expect(supabase.from).toHaveBeenCalledWith('payments');
    });

    it('returns error when no provider available', async () => {
      const emptyService = new PaymentService();
      const result = await emptyService.createPayment({ paymentMethod: 'mtn' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('No provider available');
    });

    it('handles DB insert error gracefully', async () => {
      mockInsertError = new Error('DB error');

      const result = await service.createPayment({
        paymentMethod: 'mtn',
        amount: 500,
        metadata: { userId: 'user-1' },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('verifyPayment', () => {
    it('returns verified if payment is already completed in DB', async () => {
      mockDbData = { id: 'pay-1', status: 'completed' };
      const result = await service.verifyPayment({ transactionRef: 'tx-001' });
      expect(result.verified).toBe(true);
    });

    it('returns not verified if payment not found', async () => {
      const result = await service.verifyPayment({ transactionRef: 'nonexistent' });
      expect(result.verified).toBe(false);
    });
  });

  describe('refundPayment', () => {
    it('returns error when payment not found', async () => {
      const result = await service.refundPayment({ transactionRef: 'nonexistent' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });

    it('refunds via provider and updates DB', async () => {
      mockDbData = { id: 'pay-1', transaction_ref: 'tx-001', provider: 'mock', amount_cents: 500, status: 'completed' };
      const result = await service.refundPayment({ transactionRef: 'tx-001', amount: 500 });
      expect(result.success).toBe(true);
    });
  });

  describe('getPaymentStatus', () => {
    it('gets status from provider when specified', async () => {
      const spy = jest.spyOn(provider, 'getPaymentStatus').mockResolvedValue({ success: true, status: 'completed' });

      const result = await service.getPaymentStatus({ transactionRef: 'tx-001', provider: 'mock' });
      expect(result.success).toBe(true);
      expect(spy).toHaveBeenCalledWith({ transactionRef: 'tx-001' });
    });

    it('gets status from DB when no provider specified', async () => {
      mockDbData = { id: 'pay-1', status: 'pending' };
      const result = await service.getPaymentStatus({ transactionRef: 'tx-001' });
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
    });
  });

  describe('handleWebhook', () => {
    it('delegates to provider and processes result', async () => {
      mockDbData = { id: 'pay-1', transaction_ref: 'dep-001', status: 'completed' };
      const result = await service.handleWebhook({
        provider: 'mock',
        payload: { depositId: 'dep-001', status: 'completed', amount: 500 },
        headers: {},
        rawBody: Buffer.from('{}'),
      });

      expect(result.success).toBe(true);
    });

    it('returns error for unknown provider', async () => {
      const result = await service.handleWebhook({
        provider: 'unknown',
        payload: {},
        headers: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown provider');
    });
  });

  describe('getPaymentStatusPoll', () => {
    it('returns completed from DB without calling provider', async () => {
      mockDbData = { id: 'pay-1', status: 'completed' };
      const result = await service.getPaymentStatusPoll({ transactionRef: 'tx-001' });
      expect(result.status).toBe('completed');
    });

    it('falls back to provider if pending in DB', async () => {
      mockDbData = { id: 'pay-1', status: 'pending' };
      const result = await service.getPaymentStatusPoll({ transactionRef: 'tx-001', provider: 'mock' });
      expect(result.status).toBe('completed');
    });
  });

  describe('getSupportedMethods', () => {
    it('aggregates methods from all providers', async () => {
      const methods = await service.getSupportedMethods('ZM');
      expect(methods.length).toBeGreaterThan(0);
      expect(methods[0].provider).toBe('mock');
    });
  });
});
