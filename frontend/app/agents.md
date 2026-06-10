# Frontend App — Agent Docs

## Purpose
All Next.js App Router pages, layouts, and route groups.

## Key Files
### Root Layout & Global
- `layout.tsx` — Root layout with theme provider, font, metadata
- `page.tsx` — Landing page (hero, features, CTA)
- `loading.tsx` — Global loading fallback
- `error.tsx` — Global error boundary
- `not-found.tsx` — 404 page
- `globals.css` — Global Tailwind imports and custom CSS
- `robots.ts` — SEO robots configuration
- `sitemap.ts` — SEO sitemap generation

### Auth
- `auth/login/page.tsx` — Email/password + Google OAuth login
- `auth/signup/page.tsx` — Registration form
- `auth/callback/page.tsx` — OAuth callback handler (excluded from middleware)
- `auth/verify-otp/page.tsx` — OTP verification
- `auth/layout.tsx` — Auth pages layout wrapper

### Dashboard (authenticated)
- `dashboard/layout.tsx` — Sidebar + header + KYC banner
- `dashboard/page.tsx` — User dashboard overview
- `dashboard/competitions/page.tsx` — Competition listing
- `dashboard/competitions/[id]/page.tsx` — Competition detail
- `dashboard/competitions/[id]/submit/page.tsx` — Idea submission
- `dashboard/competitions/[id]/leaderboard/page.tsx` — Competition leaderboard
- `dashboard/ideas/page.tsx` — User's ideas list
- `dashboard/ideas/[id]/page.tsx` — Idea detail/edit
- `dashboard/ideas/new/page.tsx` — Create new idea (5-step wizard: identity, concept, YouTube pitch link, guidelines, commit)
- `dashboard/ideas/success/page.tsx` — Idea submission success
- `dashboard/payment/page.tsx` — Payment history
- `dashboard/payment/success/page.tsx` — Stripe checkout success verification
- `dashboard/voting/page.tsx` — Active voting interface
- `dashboard/voter/page.tsx` — Voter registration/dashboard
- `dashboard/vote/success/page.tsx` — Vote submission success
- `dashboard/admin/page.tsx` — Admin overview (stats, audit log)
- `dashboard/admin/users/page.tsx` — Admin user management
- `dashboard/admin/ideas/page.tsx` — Admin idea moderation
- `dashboard/admin/competitions/page.tsx` — Admin competition management
- `dashboard/admin/analytics/page.tsx` — Platform analytics
- `dashboard/earnings/page.tsx` — Earnings and withdrawals
- `dashboard/settings/page.tsx` — Profile settings
- `dashboard/kyc/page.tsx` — KYC document upload
- `dashboard/loading.tsx` — Dashboard loading state

### Onboarding
- `onboarding/layout.tsx` — Onboarding flow layout
- `onboarding/personal/page.tsx` — Personal info step
- `onboarding/documents/page.tsx` — Document upload step
- `onboarding/location/page.tsx` — Location step
- `onboarding/review/page.tsx` — Review step
- `onboarding/success/page.tsx` — Onboarding complete

### Competition & Voting (public or limited)
- `competitions/page.tsx` — Public competition listing
- `competitions/[id]/page.tsx` — Public competition detail
- `competitions/[id]/results/page.tsx` — Competition results
- `vote/[competitionId]/page.tsx` — Voting page
- `contestant/[[...slug]]/page.tsx` — Contestant area
- `voter/[[...slug]]/page.tsx` — Voter area

### Admin Catch-All
- `admin/[[...slug]]/page.tsx` — Legacy admin fallback route

### Docs & Legal
- `docs/page.tsx` — Documentation hub
- `docs/privacy/page.tsx` — Privacy policy
- `docs/terms/page.tsx` — Terms of service
- `docs/rules/page.tsx` — Competition rules
- `docs/video-guidelines/page.tsx` — Video submission guidelines

## Rules
- Auth callback page is excluded from middleware redirect to prevent loops
- All dashboard pages check authentication via useAuth hook + middleware
- Payment success page verifies with backend before showing success
- Admin pages check `profile.is_admin` on mount
- Onboarding flow is sequential (personal → documents → location → review)
- Use `window.location.replace()` for post-auth redirects, not `router.replace()`

## Child Docs
(none — leaf node)
