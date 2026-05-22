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
  updateCompetition: (id: string, data: any) => api.put(`/competitions/${id}`, data),
  deleteCompetition: (id: string) => api.delete(`/admin/competitions/${id}`),
  getCompetitions: () => api.get('/competitions'),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (unverified?: boolean) => api.get(`/admin/users${unverified ? '?unverified=true' : ''}`),
  verifyUser: (id: string, isVerified: boolean) => api.post(`/admin/users/${id}/verify`, { is_verified: isVerified }),
  getAllIdeas: (filters?: { competition_id?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.competition_id) params.set('competition_id', filters.competition_id);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return api.get(`/admin/ideas${qs ? `?${qs}` : ''}`);
  },
  updateIdeaStatus: (id: string, status: string, note?: string) => api.post(`/admin/ideas/${id}/status`, { status, note }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLog: () => api.get('/admin/audit-log'),
};
