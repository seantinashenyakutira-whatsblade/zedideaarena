const PaymentProvider = require('../PaymentProvider');

describe('PaymentProvider (abstract)', () => {
  it('throws when accessing name on base class', () => {
    const provider = new PaymentProvider();
    expect(() => provider.name).toThrow('must implement get name()');
  });

  it('requires subclass to implement createPayment', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.createPayment({})).rejects.toThrow('createPayment() not implemented');
  });

  it('requires subclass to implement verifyPayment', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.verifyPayment({})).rejects.toThrow('verifyPayment() not implemented');
  });

  it('requires subclass to implement refundPayment', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.refundPayment({})).rejects.toThrow('refundPayment() not implemented');
  });

  it('requires subclass to implement getPaymentStatus', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.getPaymentStatus({})).rejects.toThrow('getPaymentStatus() not implemented');
  });

  it('requires subclass to implement handleWebhook', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.handleWebhook({})).rejects.toThrow('handleWebhook() not implemented');
  });

  it('requires subclass to implement getSupportedMethods', async () => {
    class PartialProvider extends PaymentProvider {
      get name() { return 'partial'; }
    }
    const provider = new PartialProvider();
    await expect(provider.getSupportedMethods('ZM')).rejects.toThrow('getSupportedMethods() not implemented');
  });

  it('allows valid subclass to override methods', () => {
    class MockProvider extends PaymentProvider {
      get name() { return 'mock'; }
      async createPayment(p) { return { success: true }; }
    }
    const mock = new MockProvider();
    expect(mock.name).toBe('mock');
  });
});
