export const routes = {
  home: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  pricing: '/pricing',
  arena: '/arena',
  login: '/auth/login',
  signup: '/auth/signup',
  onboarding: '/onboarding/personal',
  hub: '/dashboard',
  hubCompetitions: '/dashboard/competitions',
  hubIdeas: '/dashboard/ideas',
  hubNewIdea: (competitionId?: string) =>
    `/dashboard/ideas/new${competitionId ? `?competition=${competitionId}` : ''}`,
  hubProfile: '/dashboard/settings',
  hubPayment: (competitionId: string, type: 'contestant' | 'voter') =>
    `/dashboard/payment?competition=${competitionId}&type=${type}`,
  vote: '/dashboard/voting',
  voteCompetition: (id: string) => `/vote/${id}`,
  admin: '/admin',
  adminUsers: '/admin/users',
  adminIdeas: '/admin/ideas',
  adminCompetitions: '/admin/competitions',
}
