const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN 
  || 'zedideaarena.com'

const isDev = process.env.NODE_ENV === 'development'
const protocol = isDev ? 'http' : 'https'
const port = isDev ? ':3000' : ''
const localSuffix = isDev ? `.localhost${port}` : `.${ROOT}`

export const routes = {
  // Marketing (main domain)
  home: isDev ? `http://localhost${port}` : `https://${ROOT}`,
  about: isDev ? `http://localhost${port}/about` : `https://${ROOT}/about`,
  howItWorks: isDev ? `http://localhost${port}/how-it-works` : `https://${ROOT}/how-it-works`,
  pricing: isDev ? `http://localhost${port}/pricing` : `https://${ROOT}/pricing`,

  // Auth
  login: `${protocol}://login${localSuffix}`,
  signup: `${protocol}://login${localSuffix}/signup`,
  onboarding: `${protocol}://login${localSuffix}/onboarding/personal`,

  // Hub — contestant
  hub: `${protocol}://hub${localSuffix}`,
  hubCompetitions: `${protocol}://hub${localSuffix}/competitions`,
  hubIdeas: `${protocol}://hub${localSuffix}/ideas`,
  hubNewIdea: (competitionId?: string) =>
    `${protocol}://hub${localSuffix}/ideas/new${competitionId ? `?competition=${competitionId}` : ''}`,
  hubProfile: `${protocol}://hub${localSuffix}/profile`,
  hubPayment: (competitionId: string, type: 'contestant' | 'voter') =>
    `${protocol}://hub${localSuffix}/payment?competition=${competitionId}&type=${type}`,

  // Vote — voter
  vote: `${protocol}://vote${localSuffix}`,
  voteCompetition: (id: string) =>
    `${protocol}://vote${localSuffix}/competition/${id}`,

  // Admin
  admin: `${protocol}://admin${localSuffix}`,
  adminUsers: `${protocol}://admin${localSuffix}/users`,
  adminIdeas: `${protocol}://admin${localSuffix}/ideas`,
  adminCompetitions: `${protocol}://admin${localSuffix}/competitions`,
}
