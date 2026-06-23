# Payment System Audit — ZedIdeaArena

## Current State Summary

### Active Payment Providers
| Provider | Status | Files |
|----------|--------|-------|
| **Stripe** | Active (card-only) | `paymentController.js`, `webhookRoutes.js`, `backend/index.js`, `frontend/payment/page.tsx`, `frontend/payment/success/page.tsx` |
| **DPO Pay** | Active (mobile money) | `dpoService.js`, `paymentController.js`, `paymentMethods.js`, `webhookRoutes.js` |
| **PawaPay** | Not integrated | — |

### Payment-Related Files

#### Backend
| File | Purpose |
|------|---------|
| `backend/src/controllers/paymentController.js` | All payment logic (952 lines) — Stripe + DPO |
| `backend/src/services/dpoService.js` | DPO Pay v6 XML API client |
| `backend/src/config/paymentMethods.js` | Payment methods definition (Stripe card + DPO mobile money) |
| `backend/src/routes/paymentRoutes.js` | 6 GET endpoints: history, methods, check-entry, check, verify, my-competitions |
| `backend/src/routes/webhookRoutes.js` | POST /webhooks/stripe, POST /webhooks/dpo |
| `backend/src/routes/competitionRoutes.js` | POST /:id/enter -> enterCompetition |
| `backend/src/routes/voterRoutes.js` | POST /register -> registerVoter |
| `backend/src/index.js` | Stripe initialization, CORS, route mounting |
| `backend/package.json` | `stripe: ^22.1.0` |

#### Frontend
| File | Purpose |
|------|---------|
| `frontend/app/dashboard/payment/page.tsx` | Payment checkout page with method selection |
| `frontend/app/dashboard/payment/success/page.tsx` | Payment verification + success redirect |
| `frontend/app/dashboard/payment/error/page.tsx` | Payment error/cancelled page |
| `frontend/components/payment/StripePaymentForm.tsx` | Unused inline Stripe Elements form |
| `frontend/services/payment.js` | API client: enterCompetition, registerVoter, getPayments |
| `frontend/package.json` | `@stripe/react-stripe-js: ^6.2.0`, `@stripe/stripe-js: ^9.3.1` |

#### Database (Supabase)
| Table/Field | Usage |
|-------------|-------|
| `payments` | Columns: `stripe_session_id`, `stripe_payment_intent_id`, `transaction_ref`, `network_id`, `amount_cents`, `amount`, `status`, `type`, `user_id`, `competition_id`, `idea_id` |
| `ideas.payment_status` | 'paid' / 'unpaid' |
| `users.voter_competitions_paid` | Array of competition IDs paid for |
| `users.voter_payment_status` | 'paid' / 'unpaid' |
| `competitions.entry_fee_cents` | Entry fee in cents |
| `competitions.voter_fee_cents` | Voter fee in cents |

#### Environment Variables (Backend)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DPO_COMPANY_TOKEN=...
DPO_SERVICE_TYPE=...
DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
```

---

## Migration Plan: Stripe + DPO -> PawaPay

### Phase 2 — Payment Architecture Refactor
Create abstract provider interface:
```
backend/src/services/payments/
├── PaymentProvider.js     # Abstract base interface
├── PaymentService.js       # Orchestrator
└── providers/
    ├── PawapayProvider.js  # PawaPay implementation
    └── (future: CardProvider.js, etc.)
```

### Phase 3 — Removal
- Delete: `dpoService.js`, `paymentMethods.js`, `StripePaymentForm.tsx`
- Modify: `paymentController.js` — remove all Stripe/DPO code, use PaymentService
- Modify: `webhookRoutes.js` — remove Stripe/DPO routes
- Modify: `backend/index.js` — remove Stripe init
- Modify: `frontend/payment/page.tsx`, `success/page.tsx`, `error/page.tsx` — use PawaPay
- Modify: `frontend/services/payment.js` — call PaymentService
- Uninstall: `stripe` npm package, `@stripe/*` npm packages
- Clean env vars: `STRIPE_*`, `DPO_*` -> add `PAWAPAY_*`

### Phase 4 — PawaPay Integration
- `PawapayProvider.js` — implements `createDeposit`, `verifyPayment`, `getPaymentStatus`
- Webhook endpoint: `POST /api/webhooks/pawapay`
- Environment variables:
  ```
  PAWAPAY_API_KEY=...
  PAWAPAY_CALLBACK_URL=https://api.zedideaarena.com/api/webhooks/pawapay
  PAWAPAY_SANDBOX=true
  ```

### Phase 5 — Country-Based Payment Methods
- `config/paymentMethods.ts` — stores country -> available providers mapping
- `PaymentMethodResolver` — detects user country, returns available methods
- Zambia: MTN Money, Airtel Money
- Tanzania: M-Pesa, Airtel Money, Tigo Pesa
- Uganda: MTN, Airtel Money
- Fallback: card methods

### Phase 6 — Icon System
- `frontend/assets/payment-icons/*.svg` — brand logos
- `PaymentMethodIcon` component

### Phase 7 — Flows (no major change)
Contestant: Account -> Verification -> Competition -> Payment -> Submit
Voter: Account -> Verification -> Competition -> Payment -> Vote

### Phase 8 — Database
- Add `payment_attempts` table
- Add `payment_webhooks` table
- Add indexes on: `payments.transaction_ref`, `payments.user_id`, `payments.status`
- Add unique constraint on `payments.transaction_ref`

### Phase 9 — Admin
- Admin payment dashboard in existing admin panel
- Filters: successful, pending, failed, refunds
- Competition revenue, voter revenue
- CSV export

### Phase 10 — Testing
- Unit tests for PaymentService, PawapayProvider
- Integration test: create deposit -> webhook -> verify
- Edge cases: duplicates, expired, cancelled, invalid webhooks
