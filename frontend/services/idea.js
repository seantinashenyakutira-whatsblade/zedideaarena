import api from '../lib/api';

export const ideaService = {
  getUserIdeas: async () => api.get('/ideas/user'),
  saveDraft: async (data: any) => api.post('/ideas/save', data),
  submitIdea: async (id: string) => api.post('/ideas/submit', { id }),
  getPublicIdeas: async () => api.get('/ideas/public'),
  getIdeaById: async (id: string) => api.get(`/ideas/${id}`),
};
