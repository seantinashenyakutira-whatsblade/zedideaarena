# App Pages & Routes — Subdomain Architecture

## Subdomain → Route Mapping
- **Main domain (zedideaarena.com)** — Marketing pages: `/`, `/about`, `/how-it-works`, `/pricing`, `/competitions`, `/docs/*`
- **login.*** → `/auth/*` (login, signup, onboarding, auth callback)
- **hub.*** → `/dashboard/*` (contestant dashboard, competitions, ideas, profile, payment)
- **vote.*** → `/voter/*` (voter pages, competition listing, idea cards, voting)
- **admin.*** → `/admin/*` (admin panel, users, ideas, competitions, stats)

## Marketing Pages
- `page.tsx` — Landing page. Hero with CSS gradient bg (no Unsplash). Live stats from `/api/stats/global`. Horizontal scroll How It Works (6 steps, drag + wheel). Team from `lib/team.ts`. Live competitions from `/api/competitions`. Empty state: "First competition launching soon". Social links from `lib/social.ts`. Nav: About, How It Works, Pricing, Competitions, Rules.
- `about/page.tsx` — Mission, story section, values grid (4 values), team grid (5 members from lib/team.ts).
- `how-it-works/page.tsx` — Contestant flow (6 steps), Voter flow (6 steps), FAQ accordion (10 questions).
- `pricing/page.tsx` — Two tier cards (Contestant $5/comp, Voter $15/once), prize breakdown table (1st 25%, 2nd 10%, 3rd 5%), pricing FAQ (5 questions).

## Docs Pages
- `docs/rules/page.tsx` — Competition rules (eligibility, submission guidelines, voting & conduct)
- `docs/terms/page.tsx` — Terms of Service (agreement, IP, fees)
- `docs/privacy/page.tsx` — Privacy Policy (data collection, data protection)
- `docs/video-guidelines/page.tsx` — Video submission guidelines
- `docs/page.tsx` — Docs index/landing

## Auth Pages (login.* subdomain)
- `auth/login/page.tsx` — Split-panel login
- `auth/signup/page.tsx` — Split-panel signup with role toggle
- `auth/callback/page.tsx` — OAuth callback handler
- `onboarding/personal/page.tsx` — Personal info form
- `onboarding/verify/page.tsx` — KYC/identity verification
- `onboarding/review/page.tsx` — Review & submit
- `onboarding/layout.tsx` — Onboarding flow layout (redirects to hub if complete)

## Dashboard Pages (hub.* subdomain)
- `dashboard/page.tsx` — Dashboard homepage/overview
- `dashboard/competitions/page.tsx` — Competition listing
- `dashboard/competitions/[id]/page.tsx` — Competition detail + submitted ideas
- `dashboard/ideas/new/page.tsx` — New idea submission form
- `dashboard/ideas/page.tsx` — My ideas listing
- `dashboard/payment/success/page.tsx` — Payment success page
- `dashboard/profile/page.tsx` — Profile settings

## Voter Pages (vote.* subdomain)
- `voter/page.tsx` — Voter home
- `voter/competition/[id]/page.tsx` — Idea cards with staggered animation, vote count, checkmark

## Admin Pages (admin.* subdomain)
- (Routes defined in admin dashboard components)

## Cross-Subdomain Redirects
- All redirects that cross subdomains use `window.location.href` (client-side) or `window.location.replace()`
- `routes.ts` provides all subdomain URLs with dev/prod awareness
- Same-subdomain navigation uses `router.push()`
- Auth redirects: login → hub.href, logout → login.href, mode switch → hub.href or vote.href
