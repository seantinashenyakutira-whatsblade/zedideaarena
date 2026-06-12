# Frontend — Agent Docs

## Purpose
Next.js 16 App Router application — all user-facing UI, pages, components, and client-side logic.

## Key Files
- `middleware.ts` — Subdomain-based routing via `@supabase/auth-helpers-nextjs` `createMiddlewareClient`. Detects subdomain from host header, rewrites paths: hub.* → /dashboard/*, vote.* → /voter/*, admin.* → /admin/*, login.* → /auth/*. Auth-protected subdomains check session and redirect to login.*. Onboarding gate for incomplete profiles. No Vercel project splitting.
- `lib/api.js` — Axios instance with localStorage token interceptor
- `lib/routes.ts` — Single source of truth for all subdomain URLs (hub, vote, admin, login). Dev-aware: uses localhost with `.localhost` suffix in development, `.zedideaarena.com` in production.
- `lib/supabase-browser.ts` — Browser-side Supabase client (anon key)
- `lib/supabase-server.ts` — Server-side Supabase client (service role)
- `lib/utils.ts` — Tailwind CSS class merge utility
- `lib/team.ts` — Team member data (name, role, bio, image, social links)
- `lib/social.ts` — Social media URLs (tiktok, instagram, twitter, email)
- `lib/validators/` — Zod schemas for login, signup, profile, idea forms
- `hooks/useAuth.ts` — Auth context provider + session/profile state
- `hooks/use-toast.ts` — Sonner toast notification hook
- `services/auth.js` — Auth service (login, signup, logout, OAuth, sync)
- `services/core.ts` — Admin API service (stats, users, ideas, audit)
- `services/idea.ts` — Idea CRUD API service
- `services/payment.js` — Payment API service (Stripe checkout, verify)
- `app/page.tsx` — Landing page (hero-bg gradient, live stats from /api/stats/global, horizontal scroll How It Works, team from lib/team, real competitions, social links from lib/social, nav links to all pages)
- `app/about/page.tsx` — About page (mission, story, values grid, full team)
- `app/how-it-works/page.tsx` — How It Works page (contestant/voter flows, 10-question FAQ accordion)
- `app/pricing/page.tsx` — Pricing page (tier cards, prize breakdown table, pricing FAQ)
- `app/docs/rules/page.tsx` — Competition rules (eligibility, submission, voting)
- `app/docs/terms/page.tsx` — Terms of Service
- `app/docs/privacy/page.tsx` — Privacy Policy
- `components/` — Reusable UI and business components
- `public/` — Static assets (logos, images, icons)
- `next.config.mjs` — Next.js configuration
- `tailwind.config.ts` — Tailwind theme and custom tokens
- `tsconfig.json` — TypeScript configuration

## Rules
- All auth checks server-side via middleware.ts; never trust client-side state for guarding routes
- Use `window.location.replace()` instead of `router.replace()` for auth redirects to let middleware handle routing
- API calls go through `lib/api.js` (handles token injection and error formatting)
- Form validation uses Zod schemas in `lib/validators/`
- shadcn/ui components go in `components/ui/`; business components go in their own folders
- Environment variables prefixed with `NEXT_PUBLIC_` are client-safe; secrets go only to backend
- Landing page stats fetch from `/api/stats/global` (returns activeIdeas, communityMembers, fundingDistributed, countries)
- Landing page competitions fetch from `/api/competitions` (filter by calculatedStatus: 'active' | 'upcoming')
- Nav includes: About, How It Works, Pricing, Competitions, Rules, Sign In, Join Now

## Child Docs
- /frontend/app/agents.md — Pages and routes
- /frontend/components/agents.md — UI component library

## Voting System
- `components/voter/RatingModal.tsx` — 4-criteria 1-10 rating modal with comment and confirm steps
- `app/vote/[competitionId]/page.tsx` — voting arena page, uses `RatingModal` on Vote button click
- Rating scores sent as `innovation_score, feasibility_score, impact_score, presentation_score` + `comment` + `time_spent_seconds`
