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

## Voting System (v2)
- Ratings use 4 criteria on 1-10 scale: Innovation, Feasibility, Impact, Presentation
- `votes` table generates `total_score` automatically as average of 4 scores
- Unique constraint: `UNIQUE(user_id, idea_id)` — voter can rate multiple ideas in one comp
- Each vote awards +10 bonus cents to `voter_earnings` via `add_voter_vote_bonus()` RPC
- `voter_earnings` tracks base + bonus + ad revenue per voter per competition
- `ad_impressions` tracks ad watch time for future ad-revenue sharing
- Frontend: `RatingModal` component with progress bar, 1-10 grid, comment, confirm steps

## Arena Social Hub
- Public social feed at `/arena` — accessible to all users including guests
- `arena_posts` table: content (max 500), post_type, optional linked_idea/competition
- `arena_comments` table: content (max 300) per post
- `arena_likes` table: unique per post+user, toggle like/unlike
- Post types: discussion, question, announcement, idea_highlight
- Backend: `GET /api/arena/posts`, `POST /api/arena/posts`, `POST /api/arena/posts/:id/like`, `GET/POST /api/arena/posts/:id/comments`
- RLS: public SELECT, auth-only INSERT
- AdUnit component with IntersectionObserver: tracks 3s+ visibility, calls `POST /api/ads/impression`, credits voter earnings
- Arena link added to all sidebar roles (contestant, voter, admin)
