const getRoot = () => process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'zedideaarena.com'
const getProtocol = () => (typeof window !== 'undefined' && window.location.protocol) || 'https'

export const routes = {
  get root() { return `${getProtocol()}://${getRoot()}` },

  get login() { return `${getProtocol()}://login.${getRoot()}` },
  get signup() { return `${getProtocol()}://login.${getRoot()}/signup` },
  get onboarding() { return `${getProtocol()}://login.${getRoot()}/onboarding/personal` },

  get hub() { return `${getProtocol()}://hub.${getRoot()}` },
  hubCompetition: (id: string) => `${getProtocol()}://hub.${getRoot()}/competitions/${id}`,
  hubNewIdea: (competitionId?: string) =>
    competitionId
      ? `${getProtocol()}://hub.${getRoot()}/ideas/new?competitionId=${competitionId}`
      : `${getProtocol()}://hub.${getRoot()}/ideas/new`,
  hubPayment: (competitionId: string, type: string) =>
    `${getProtocol()}://hub.${getRoot()}/payment?competition=${competitionId}&type=${type}`,
  hubSettings: `${getProtocol()}://hub.${getRoot()}/settings`,
  get hubIdeas() { return `${getProtocol()}://hub.${getRoot()}/ideas` },
  get hubCompetitions() { return `${getProtocol()}://hub.${getRoot()}/competitions` },

  get vote() { return `${getProtocol()}://vote.${getRoot()}` },
  voteCompetition: (id: string) => `${getProtocol()}://vote.${getRoot()}/competition/${id}`,

  get admin() { return `${getProtocol()}://admin.${getRoot()}` },
  get adminUsers() { return `${getProtocol()}://admin.${getRoot()}/users` },
  get adminIdeas() { return `${getProtocol()}://admin.${getRoot()}/ideas` },
  get adminAnalytics() { return `${getProtocol()}://admin.${getRoot()}/analytics` },
}
