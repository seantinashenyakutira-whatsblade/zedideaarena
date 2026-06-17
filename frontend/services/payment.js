import api from '../lib/api';

export const paymentService = {
  enterCompetition: async (competitionId, ideaId, network = 'card') => {
    const payload = { network };
    if (ideaId) payload.ideaId = ideaId;
    return api.post(`/competitions/${competitionId}/enter`, payload).then((res) => res);
  },
  registerVoter: async (competitionId, network = 'card') => {
    return api.post('/voter/register', { competitionId, network }).then((res) => res);
  },
  getPayments: async () => {
    return api.get('/payments').then((res) => res);
  },
};
