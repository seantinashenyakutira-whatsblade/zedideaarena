# Controllers — Agent Docs

## Purpose
Request handlers that implement the business logic for all API endpoints.

## Key Files
- `userController.js` — Login (create/update user on sign-in), profile fetch/update, mode switch (contestant/voter), public profile lookup
- `ideaController.js` — Create, read, update, delete ideas; upload media; toggle public status
- `paymentController.js` — Create Stripe Checkout Sessions (contestant entry fee, voter registration), handle checkout.session.completed webhook, verify payment, check payment status, payment history
- `voteController.js` — Cast vote, get voting results, check voter eligibility
- `adminController.js` — Dashboard stats, list all users, list all ideas, update idea status (approve/reject), verify users, analytics, audit log
- `mediaController.js` — Generate signed upload URLs for Supabase Storage, serve files
- `withdrawalController.js` — Create withdrawal requests, list user withdrawals, admin approval

## Rules
- All controllers use `const { uid } = req.user;` to identify the authenticated user (set by verifyToken middleware)
- Stripe checkout sessions set success_url/cancel_url using process.env.FRONTEND_URL (falls back to localhost:3000)
- Webhook handler (handleStripeWebhook) is the only controller that receives a raw body; uses stripe.webhooks.constructEvent()
- Payment verification endpoint queries payments table by stripe_session_id; returns verified: true/false
- isAdmin gate on admin routes checks users.is_admin boolean column (not the role column)
- Mode switch (updateMode) rejects if user has pending payments
- User profile update (syncUserProfile) only updates fields present in the request body

## Child Docs
(none — leaf node)
