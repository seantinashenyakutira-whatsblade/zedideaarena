import api from '../lib/api';

export const paymentService = {
  createPaymentIntent: async (ideaId) => {
    return api.post('/payment/create-payment-intent', { ideaId }).then(res => res.data);
  }
};
