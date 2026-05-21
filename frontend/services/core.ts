import api from '../lib/api';

export const mediaService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const voteService = {
  castVote: (ideaId: string, competitionId: string) => api.post('/votes/cast', { ideaId, competitionId }),
  getUserVotes: () => api.get('/votes/user'),
};

export const adminService = {
  createCompetition: (data: any) => api.post('/competitions', data),
  getCompetitions: () => api.get('/competitions'),
  getAllUsers: () => api.get('/admin/users'),
  verifyUser: (id: string, isVerified: boolean) => api.post(`/admin/users/${id}/verify`, { is_verified: isVerified }),
};
