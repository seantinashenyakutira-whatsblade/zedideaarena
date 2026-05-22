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
  castVoteV2: (idea_id: string, competition_id: string) => api.post('/voter/vote', { idea_id, competition_id }),
  getUserVotes: () => api.get('/votes/user'),
  getLeaderboard: (competitionId: string) => api.get(`/votes/${competitionId}/leaderboard`),
};

export const adminService = {
  createCompetition: (data: any) => api.post('/competitions', data),
  getCompetitions: () => api.get('/competitions'),
  getAllUsers: () => api.get('/admin/users'),
  verifyUser: (id: string, isVerified: boolean) => api.post(`/admin/users/${id}/verify`, { is_verified: isVerified }),
};
