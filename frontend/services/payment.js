import api from '../lib/api';

export const paymentService = {
  enterCompetition: async (competitionId) => {
    return api.post(`/competitions/${competitionId}/enter`).then((res) => res);
  },
  registerVoter: async (competitionId) => {
    return api.post('/voter/register', { competitionId }).then((res) => res);
  },
  getPayments: async () => {
    return api.get('/payments').then((res) => res);
  },
};
