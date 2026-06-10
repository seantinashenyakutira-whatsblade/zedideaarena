# Routes — API Endpoint Definitions

## PURPOSE
Route definitions that map HTTP methods + paths to controller functions, with middleware applied.

## ROUTE FILES
| File | Base Path | Endpoints |
|------|-----------|-----------|
| `userRoutes.js` | `/api/user` | profile, login, signup, updateMode |
| `ideaRoutes.js` | `/api/ideas` | create, save, submit, getUser, getById, public |
| `competitionRoutes.js` | `/api/competitions` | CRUD + enter competition |
| `paymentRoutes.js` | `/api/payments` | history, check-entry, check, verify |
| `voteRoutes.js` | `/api/votes` | cast, user votes, leaderboard |
| `voterRoutes.js` | `/api/voter` | register, vote (v2) |
| `adminRoutes.js` | `/api/admin` | stats, ideas, users, analytics, audit |
| `mediaRoutes.js` | `/api/media` | upload video, upload document |
| `webhookRoutes.js` | `/api/webhooks` | Stripe webhook (raw body) |
| `withdrawalRoutes.js` | `/api/withdrawals` | CRUD withdrawal requests |
| `statsRoutes.js` | `/api/stats` | global stats |

## RULES
- Auth middleware on all protected routes
- Webhook route must be registered BEFORE `express.json()` in index.js
- Rate limiter on: vote cast, idea creation, auth endpoints
