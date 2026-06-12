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
  castVoteV2: (idea_id: string, competition_id: string, ratings?: any) => api.post('/voter/vote', { idea_id, competition_id, ...ratings }),
  getUserVotes: () => api.get('/votes/user'),
  getLeaderboard: (competitionId: string) => api.get(`/votes/${competitionId}/leaderboard`),
  getIdeaRatings: (ideaId: string) => api.get(`/votes/ratings/${ideaId}`),
};

export const ideaService = {
  getIdeas: () => api.get('/ideas/user'),
  getIdeaById: (id: string) => api.get(`/ideas/${id}`),
  getPublicIdeaById: (id: string) => api.get(`/ideas/public/${id}`),
  deleteIdea: (id: string) => api.delete(`/ideas/${id}`),
  getIdeaInsights: (id: string) => api.get(`/ideas/${id}/insights`),
  updateIdeaSettings: (id: string, data: any) => api.patch(`/ideas/${id}/settings`, data),
};

export const adminService = {
  createCompetition: (data: any) => api.post('/competitions', data),
  updateCompetition: (id: string, data: any) => api.put(`/competitions/${id}`, data),
  deleteCompetition: (id: string) => api.delete(`/admin/competitions/${id}`),
  getCompetitions: () => api.get('/competitions'),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (unverified?: boolean) => api.get(`/admin/users${unverified ? '?unverified=true' : ''}`),
  verifyUser: (id: string, isVerified: boolean) => api.post(`/admin/users/${id}/verify`, { is_verified: isVerified }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAllIdeas: (filters?: { competition_id?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.competition_id) params.set('competition_id', filters.competition_id);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return api.get(`/admin/ideas${qs ? `?${qs}` : ''}`);
  },
  updateIdeaStatus: (id: string, status: string, note?: string) => api.post(`/admin/ideas/${id}/status`, { status, note }),
  deleteIdea: (id: string) => api.delete(`/admin/ideas/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLog: () => api.get('/admin/audit-log'),
};
