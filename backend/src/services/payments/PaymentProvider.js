class PaymentProvider {
  get name() {
    throw new Error('PaymentProvider subclass must implement get name()');
  }

  async createPayment(params) {
    throw new Error(`PaymentProvider (${this.name}): createPayment() not implemented`);
  }

  async verifyPayment(params) {
    throw new Error(`PaymentProvider (${this.name}): verifyPayment() not implemented`);
  }

  async refundPayment(params) {
    throw new Error(`PaymentProvider (${this.name}): refundPayment() not implemented`);
  }

  async getPaymentStatus(params) {
    throw new Error(`PaymentProvider (${this.name}): getPaymentStatus() not implemented`);
  }

  async handleWebhook(payload, headers) {
    throw new Error(`PaymentProvider (${this.name}): handleWebhook() not implemented`);
  }

  async getSupportedMethods(countryCode) {
    throw new Error(`PaymentProvider (${this.name}): getSupportedMethods() not implemented`);
  }
}

module.exports = PaymentProvider;
