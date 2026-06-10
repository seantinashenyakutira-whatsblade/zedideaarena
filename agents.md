# ZedIdeaArena — Project Agents Guide

## PURPOSE
ZedIdeaArena is a fintech-style idea competition platform where users pitch ideas, compete for funding, and vote on submissions. Think "Shark Tank meets hackathon platform."

## TECH STACK
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Express.js 5 (CommonJS) + Supabase (auth, DB, storage)
- **Payments**: Stripe (entry fees, voter fees, prize pools)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Hosting**: Vercel (frontend) + Render (backend)

## TOP-LEVEL FOLDER INDEX
| Folder | Purpose | Child Doc |
|--------|---------|-----------|
| `/frontend` | Next.js app — all UI, pages, components | [frontend/agents.md](frontend/agents.md) |
| `/backend` | Express.js API — controllers, routes, middleware | [backend/agents.md](backend/agents.md) |
| `/scripts` | SQL migrations for Supabase DB | [scripts/agents.md](scripts/agents.md) |

## RECENT CHANGES (June 2026)
- **Login redirect blink fix**: replaced `router.push()` with `window.location.replace()` in auth flow to let middleware handle routing. Removed auth layout redirect. Added auth callback bypass in middleware.
- **Success pages**: created `/onboarding/success`, `/dashboard/ideas/success`, `/dashboard/vote/success` with shared `SuccessPage` component.
- **Mode switching**: added password confirmation modal before role switch in sidebar and header.
- **Leaderboard**: created `/dashboard/competitions/[id]/leaderboard` with live polling every 30s.
- **Database**: added `v8-notifications-comments.sql` migration for notifications, comments, reactions tables and platform_stats view.

## GLOBAL RULES
1. Read agents.md chain before any edit — start here, drill into subfolder docs
2. Update agents.md files after every edit (PURPOSE, KEY FILES, NOTES)
3. No hardcoded URLs — always use env vars (NEXT_PUBLIC_*, process.env.*)
4. All API responses follow `{ status: 'success'|'error', data?, message? }` pattern
5. Auth: Bearer token in Authorization header, verified via Supabase getUser()
6. Every form/action must show loading state + error state + success feedback
7. Types in frontend, no types in backend (CommonJS)
8. Prefer supabase SSR client in middleware, browser client in pages
