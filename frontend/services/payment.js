import api from '../lib/api';

export const paymentService = {
  enterCompetition: async (competitionId: string) => {
    return api.post(`/competitions/${competitionId}/enter`).then((res: any) => res);
  },
  registerVoter: async (competitionId: string) => {
    return api.post('/voter/register', { competitionId }).then((res: any) => res);
  },
  getPayments: async () => {
    return api.get('/payments').then((res: any) => res);
  },
};
