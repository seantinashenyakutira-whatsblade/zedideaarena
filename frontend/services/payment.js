import api from '../lib/api';

export const paymentService = {
  enterCompetition: async (competitionId, ideaId) => {
    const payload = {};
    if (ideaId) payload.ideaId = ideaId;
    return api.post(`/competitions/${competitionId}/enter`, payload).then((res) => res);
  },
  registerVoter: async (competitionId) => {
    return api.post('/voter/register', { competitionId }).then((res) => res);
  },
  getPayments: async () => {
    return api.get('/payments').then((res) => res);
  },
};
