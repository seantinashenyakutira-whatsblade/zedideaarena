import api from '../lib/api';

export const ideaService = {
  getUserIdeas: async () => api.get('/ideas/user'),
  saveDraft: async (data) => api.post('/ideas/save', data),
  submitIdea: async (id) => api.post('/ideas/submit', { id }),
};
