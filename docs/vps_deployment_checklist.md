# VPS Deployment & Production Checklist

These tasks should be performed once the application is moved to the VPS for production hosting on `zedideaarena.com`.

## 1. Stripe Production Setup
- [ ] **Switch to Live Keys**: Replace `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` with live production keys from the Stripe Dashboard.
- [ ] **Configure Production Webhook**:
    1.  Go to [Stripe Webhooks Dashboard](https://dashboard.stripe.com/webhooks).
    2.  Add an endpoint: `https://api.zedideaarena.com/api/payment/webhook`.
    3.  Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`.
    4.  Copy the **Signing Secret** and update `STRIPE_WEBHOOK_SECRET` in your `.env`.

## 2. Firebase Production Setup
- [ ] **Restrict API Keys**: Ensure Firebase browser keys are restricted to `zedideaarena.com`.
- [ ] **Production Database**: Ensure Firestore security rules are set to `production` mode (disallow unauthorized writes).

## 3. KYC Verification (Didit.me)
- [ ] **Update Callback URL**: Set `DIDIT_CALLBACK_URL` to `https://zedideaarena.com/kyc/callback`.
- [ ] **Update Webhook URL**: Update the Didit dashboard with `https://api.zedideaarena.com/api/kyc/webhook`.

## 4. Environment & Security
- [ ] **NODE_ENV**: Set `NODE_ENV=production` in the VPS environment.
- [ ] **SSL/TLS**: Ensure both frontend and backend are served over HTTPS (using Nginx/Certbot).
- [ ] **CORS**: Update the CORS origin in `server/src/index.js` to only allow `https://zedideaarena.com`.

## 5. Domain Settings
- [ ] **DNS**: Point `zedideaarena.com` (A record) to the VPS IP.
- [ ] **Subdomain**: Point `api.zedideaarena.com` (A record) to the VPS IP for backend services.
