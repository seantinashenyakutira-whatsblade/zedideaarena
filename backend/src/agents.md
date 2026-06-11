# Backend Source — Agent Docs

## Purpose
Core backend source code — controllers handle business logic, routes define endpoints, middleware provides cross-cutting concerns, and services handle external integrations.

## Key Files
- `index.js` — App entry: middleware registration, route mounting, error handler, server start
- `config/supabase.js` — Supabase client initialization (service_role key + WebSocket transport)

### Middleware
- `middleware/authMiddleware.js` — verifyToken (JWT check via Supabase Auth), isAdmin (admin role gate)
- `middleware/rateLimiter.js` — Rate limiters for auth, voting, and idea submission endpoints

### Routes
- `routes/userRoutes.js` — /api/user/* (profile, login, signup, mode switch)
- `routes/ideaRoutes.js` — /api/ideas/* (CRUD, media, status)
- `routes/competitionRoutes.js` — /api/competitions/* (list, detail, results)
- `routes/voteRoutes.js` — /api/votes/* (cast vote, results)
- `routes/paymentRoutes.js` — /api/payments/* (checkout, verify, history)
- `routes/voterRoutes.js` — /api/voter/* (voter registration)
- `routes/adminRoutes.js` — /api/admin/* (stats, users, ideas, analytics)
- `routes/mediaRoutes.js` — /api/media/* (upload, serve)
- `routes/statsRoutes.js` — /api/stats/* (global stats, leaderboard)
- `routes/withdrawalRoutes.js` — /api/withdrawals/* (withdrawal requests)
- `routes/webhookRoutes.js` — /api/webhooks/* (Stripe webhook handler)

### Controllers
- `controllers/userController.js` — Login, signup, profile CRUD, mode switching
- `controllers/ideaController.js` — Idea CRUD, submission, media handling
- `controllers/paymentController.js` — Stripe checkout sessions, webhook processing, payment verification
- `controllers/voteController.js` — Vote casting, results, eligibility
- `controllers/adminController.js` — Admin panel: stats, user mgmt, idea moderation
- `controllers/mediaController.js` — File uploads to Supabase Storage
- `controllers/withdrawalController.js` — Withdrawal request processing

### Services
- `services/emailService.js` — Resend-based email notifications

## Rules
- Controllers never access request/response directly except through req.params, req.query, req.body, req.user
- All authenticated routes use verifyToken middleware which sets req.user = { uid, email, name, picture }
- Admin routes additionally use isAdmin middleware which checks users.is_admin column
- Error handling: controllers use try/catch + return res.status(500).json(...); unhandled errors fall to global handler
- Rate limiters use in-memory store by default; max 10 auth/min, 10 votes/min, 5 ideas/hour
- Supabase client created once at module load with service_role key for full DB access
- Stripe webhook handler verifies signature with STRIPE_WEBHOOK_SECRET before processing

## Payment Flow
1. **Contestant**: Create idea (POST /api/ideas) → redirect to Stripe checkout → user pays → webhook marks idea as submitted/paid/public → OR fallback: success page retries 10 times then checks Stripe directly
2. **Voter**: Register voter (POST /api/voter/register) → Stripe checkout → webhook marks voter_competitions_paid → OR fallback in verifyPayment
3. `GET /api/payment/verify?session_id=...` — First checks payments table, then falls back to Stripe API if webhook delayed. Inline creates payment record + applies side effects on fallback.
4. Webhook route (`POST /api/webhooks/stripe`) uses `express.raw()` and is mounted before `express.json()` in index.js to preserve raw body for signature verification

## Idea Visibility
- `status='submitted' AND payment_status='paid' AND is_public=true` for voter panel display
- `GET /api/ideas/public` accepts `?status=` and `?competition_id=` query params
- Webhook sets all three flags on contestant payment completion

## SQL Function Required (run in Supabase SQL Editor)
```sql
CREATE OR REPLACE FUNCTION increment_prize_pool(comp_id uuid, amount int)
RETURNS void AS $$
  UPDATE competitions 
  SET prize_pool_cents = prize_pool_cents + amount
  WHERE id = comp_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

## Child Docs
- /backend/src/controllers/agents.md — Business logic controllers
