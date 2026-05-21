import api from '../lib/api';

export const paymentService = {
  createPaymentIntent: async (data: { type: string; ideaId?: string; amount: string }) => {
    return api.post('/payment/create-payment-intent', data).then((res: any) => res);
  },
};
