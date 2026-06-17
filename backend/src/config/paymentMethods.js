const PAYMENT_METHODS = {
  groups: [
    {
      id: 'cards',
      name: 'Credit / Debit Cards',
      methods: [
        { id: 'card', name: 'Visa / Mastercard', icon: 'CreditCard', provider: 'stripe', serviceId: null },
      ],
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      methods: [
        { id: 'airtel', name: 'Airtel Money', icon: 'Smartphone', provider: 'dpo', serviceId: 'airtel' },
        { id: 'mtn', name: 'MTN Mobile Money', icon: 'Smartphone', provider: 'dpo', serviceId: 'mtn' },
        { id: 'm-pesa', name: 'M-Pesa', icon: 'Smartphone', provider: 'dpo', serviceId: 'mpesa' },
        { id: 'zamtel', name: 'Zamtel', icon: 'Smartphone', provider: 'dpo', serviceId: 'zamtel' },
      ],
    },
  ],
  all() {
    return this.groups.flatMap(g => g.methods);
  },
  getProvider(methodId) {
    const method = this.all().find(m => m.id === methodId);
    return method ? method.provider : 'stripe';
  },
  getServiceId(methodId) {
    const method = this.all().find(m => m.id === methodId);
    return method ? method.serviceId : null;
  },
};

module.exports = PAYMENT_METHODS;
