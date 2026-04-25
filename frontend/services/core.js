import api from '../lib/api';

export const mediaService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const voteService = {
  castVote: (ideaId, competitionId) => api.post('/votes/cast', { ideaId, competitionId }),
};

export const adminService = {
  createCompetition: (data) => api.post('/admin/competitions', data),
  getCompetitions: () => api.get('/admin/competitions'),
};
