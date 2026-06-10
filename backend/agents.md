# Backend — Agents Guide

## PURPOSE
Express.js 5 REST API — handles business logic, payments, media uploads, and Supabase integration.

## OWNERSHIP
- Controllers (`src/controllers/`) — request handlers
- Routes (`src/routes/`) — URL routing and middleware wiring
- Middleware (`src/middleware/`) — auth, rate limiting
- Services (`src/services/`) — email notifications
- Config (`src/config/`) — Supabase client setup

## RULES
- CommonJS (`require`/`module.exports`) — no ES modules
- All responses: `{ status: 'success'|'error', data?, message?, error? }`
- Auth via Bearer token → `supabase.auth.getUser(token)` in middleware
- Admin routes protected by `verifyToken` + `isAdmin` middleware
- Rate limiting on auth, vote, and idea creation endpoints
- Stripe webhook uses `express.raw()` body parser (not JSON)

## KEY FILES
| File | Purpose |
|------|---------|
| `src/index.js` | Express app setup, CORS, route mounting |
| `src/config/supabase.js` | Supabase admin client with WebSocket transport |
| `src/middleware/authMiddleware.js` | Token verification + admin check |
| `src/middleware/rateLimiter.js` | Rate limiting for votes, ideas, auth |

## CHILD DOCS
- `src/controllers/agents.md` — controller functions
- `src/routes/agents.md` — route definitions
