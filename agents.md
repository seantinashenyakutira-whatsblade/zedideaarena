# ZedIdeaArena — Agent Documentation Root

## Project Overview
ZedIdeaArena is a monetized idea competition platform.
Users enter as Contestant (submit ideas) or Voter (vote + earn).
Revenue model: 40% of total pool goes to winners, 60% to business.

## Tech Stack
- Frontend: Next.js 15, Tailwind, Framer Motion (Vercel)
- Backend: Express.js, Node.js (Render)
- Database: Supabase (PostgreSQL + Auth + Storage)
- Payments: Stripe
- Notifications: OneSignal (to be integrated)

## Global Rules
- Never hardcode API keys or secrets
- Always read agents.md before editing any folder
- Always update agents.md after any edit
- All auth checks server-side only
- No mock data in production

## Child Docs Index
- /frontend/agents.md — Next.js app
- /backend/agents.md — Express API
- /scripts/agents.md — Database migrations
