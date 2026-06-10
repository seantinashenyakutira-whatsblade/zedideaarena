# Controllers — Business Logic

## PURPOSE
Request handlers that implement the business logic for all API endpoints.

## CONTROLLERS
| Controller | Endpoints | Key Functions |
|------------|-----------|---------------|
| `userController.js` | GET/PATCH profile, login, sync | `getUserProfile`, `login`, `syncUserProfile`, `updateMode` |
| `ideaController.js` | CRUD ideas, submit, save draft | `createIdea`, `saveIdeaDraft`, `submitIdea`, `getUserIdeas`, `getIdeaById` |
| `paymentController.js` | Stripe checkout, webhooks, verification | `enterCompetition`, `createCheckoutSession`, `handleStripeWebhook`, `registerVoter` |
| `adminController.js` | Admin CRUD for users, ideas, competitions | `getAllIdeas`, `updateIdeaStatus`, `verifyUser`, `getAdminStats` |
| `voteController.js` | Vote casting, leaderboard | `castVote`, `getLeaderboard`, `getUserVotes` |
| `mediaController.js` | File uploads to Supabase Storage | `uploadMedia`, `uploadDocument` |
| `withdrawalController.js` | Withdrawal requests | `createWithdrawal`, `getWithdrawals` |

## RULES
- Controllers do NOT handle auth — middleware sets `req.user`
- Always use try/catch with proper error responses
- Admin actions logged to `admin_actions` table
- Email notifications fire asynchronously (non-blocking)
