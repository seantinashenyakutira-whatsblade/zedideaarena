# Payment System Test Report

**Generated**: $(date +%Y-%m-%d)
**Test Framework**: Jest + Supertest
**Run Command**: `npm test` (from `backend/`)

---

## Test Suite Summary

| Suite | Tests | Status | Coverage (Lines) |
|-------|-------|--------|-------------------|
| `PaymentProvider` (abstract) | 8 | ✅ All pass | 100% |
| `PawapayProvider` | 22 | ✅ All pass | 82.5% |
| `PaymentService` | 18 | ✅ All pass | 59.3% |
| **Total** | **48** | **✅ 0 failures** | **61.4% (payment layer)** |

---

## Test Breakdown

### 1. PaymentProvider (abstract class) — `__tests__/PaymentProvider.test.js`

Tests that the abstract base enforces its interface contract:

| Test | What it verifies |
|------|------------------|
| `throws when accessing name on base class` | `.name` getter throws without subclass override |
| `requires subclass to implement createPayment` | `createPayment()` throws not-implemented error |
| `requires subclass to implement verifyPayment` | `verifyPayment()` throws not-implemented error |
| `requires subclass to implement refundPayment` | `refundPayment()` throws not-implemented error |
| `requires subclass to implement getPaymentStatus` | `getPaymentStatus()` throws not-implemented error |
| `requires subclass to implement handleWebhook` | `handleWebhook()` throws not-implemented error |
| `requires subclass to implement getSupportedMethods` | `getSupportedMethods()` throws not-implemented error |
| `allows valid subclass to override methods` | Well-formed subclass works without errors |

### 2. PawapayProvider — `providers/__tests__/PawapayProvider.test.js`

Tests the PawaPay API implementation with mocked `global.fetch`:

| Category | Tests | What it verifies |
|----------|-------|------------------|
| `name` | 1 | Provider name is `pawapay` |
| `isConfigured` | 2 | Returns `false` without API key, `true` with key set |
| `getSupportedMethods` | 4 | Correct method IDs for ZM (mtn-zm, airtel-zm, card), TZ (m-pesa-tz, airtel-tz, tigo-tz, card), UG (mtn-ug, airtel-ug, card), and unknown country (card-only) |
| `createPayment` | 5 | Unconfigured returns error; unsupported method returns error; successful deposit calls correct URL with auth header; API error returns status code; network error returns message |
| `verifyPayment` | 2 | Unconfigured returns error; completed deposit returns status + amount |
| `refundPayment` | 2 | Unconfigured returns error; successful refund returns refund ref |
| `getPaymentStatus` | 1 | Delegates to `verifyPayment` |
| `handleWebhook` | 5 | Invalid HMAC signature rejects when secret set; missing secret accepts any sig; `deposit.completed`/`deposit.failed` events parse correctly; missing depositId rejected |

### 3. PaymentService — `__tests__/PaymentService.test.js`

Tests the service orchestration layer with mocked Supabase:

| Category | Tests | What it verifies |
|----------|-------|------------------|
| `constructor` | 2 | Empty provider map on init; supabase mock connectivity |
| `registerProvider` | 2 | Registers by name; throws for nameless provider |
| `createPayment` | 3 | Inserts DB record after provider success; returns error when no provider; handles DB insert failure gracefully |
| `verifyPayment` | 2 | Returns verified when DB has `completed` status; returns not-verified when no payment found |
| `refundPayment` | 2 | Returns error when payment not found in DB; processes refund and updates DB |
| `getPaymentStatus` | 2 | Delegates to provider when specified; reads from DB when no provider |
| `handleWebhook` | 2 | Delegates to provider + processes result; returns error for unknown provider |
| `getPaymentStatusPoll` | 2 | Returns completed from DB without calling provider; falls back to provider when pending in DB |
| `getSupportedMethods` | 1 | Aggregates methods from all registered providers |

---

## Coverage Details

### PaymentProvider.js — 100%

All 4 methods + getter fully covered.

### PawapayProvider.js — 82.5%

Uncovered lines are error handling paths that require specific API failure modes:
- Line 99: Response parsing failure in `verifyPayment`
- Lines 121-122: `getPaymentStatus` is a simple delegation (covered via spy)
- Lines 147-149: `refundPayment` JSON parsing failure
- Lines 159-160: `refundPayment` exception handling
- Lines 200-201: `handleWebhook` exception handling
- Lines 211, 216: `_verifySignature` rawBody/signature edge cases
- Lines 230-232: `handleWebhook` JSON parse failure in catch block

### PaymentService.js — 59.3%

Uncovered lines are primarily in:
- `getPaymentStatusPoll`: Branch where provider raises payment to completed and calls `_completePaymentAndRunSideEffects`
- `_completePaymentAndRunSideEffects`: Private method called for status transitions
- `_runSideEffects`: Side-effect execution (notification, prize pool updates)
- `_processWebhookResult`: Webhook re-processing guard, payment-update-from-webhook path
- Error paths within `_runSideEffects` (notification failures, DB update failures)

---

## API Coverage

| Endpoint | Status | Tested via |
|----------|--------|------------|
| `POST /deposits` (PawaPay) | ✅ | `PawapayProvider.createPayment` |
| `GET /deposits/:ref` (PawaPay) | ✅ | `PawapayProvider.verifyPayment` |
| `POST /deposits/:ref/refunds` (PawaPay) | ✅ | `PawapayProvider.refundPayment` |
| PawaPay Webhook | ✅ | `PawapayProvider.handleWebhook` |
| `GET /admin/payments` | 🟡 | Backend endpoint written, no HTTP test |
| `POST /admin/payments/:id/refund` | 🟡 | Backend endpoint written, no HTTP test |
| `GET /admin/export/payments` | 🟡 | Backend endpoint written, no HTTP test |

> 🟡 = Endpoint exists but HTTP integration test not yet written (requires supertest setup)

---

## Key Bugs Found & Fixed During Testing

1. **Wrong module path in PawapayProvider** (`PAYMENT_AUDIT.md`): `../../config/paymentMethodsResolver` resolved to the wrong directory. Changed to `../../../config/paymentMethodsResolver`.

2. **Missing `_resolveProvider` method** in `PaymentService`: The `createPayment` method called `this._resolveProvider()` but it wasn't implemented. Added a simple implementation that returns the first registered provider.

3. **Module-level env vars**: `PawapayProvider` reads `PAWAPAY_API_KEY` and `PAWAPAY_WEBHOOK_SECRET` at module load time via `const`, making them immutable after import. Tests must use `jest.resetModules()` + re-require to change these.

---

## Running Tests

```bash
# Run all payment tests
cd backend && npm test

# Run with coverage report
cd backend && npm run test:coverage

# Run single test file
npx jest src/services/payments/__tests__/PaymentService.test.js --verbose

# Run single test
npx jest -t "creates a deposit" --verbose
```
