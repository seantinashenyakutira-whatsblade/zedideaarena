# Required Credentials — Setup Checklist

## PawaPay (Payment Processing)
| Variable | Status | What Breaks |
|----------|--------|-------------|
| `PAWAPAY_API_KEY` | placeholder | All payments fail — `createPayment()` returns success:false |
| `PAWAPAY_WEBHOOK_SECRET` | placeholder | Webhook signature verification bypassed (less secure) |

## Resend (Email Notifications)
| Variable | Status | What Breaks |
|----------|--------|-------------|
| `RESEND_API_KEY` | placeholder | All emails silently skipped — password reset, verification, notifications |

## OneSignal (Push Notifications)
| Variable | Status | What Breaks |
|----------|--------|-------------|
| `ONESIGNAL_APP_ID` | placeholder | Push notifications not sent |
| `ONESIGNAL_REST_API_KEY` | placeholder | Push notifications not sent |

## OpenRouter (AI Bio Polish)
| Variable | Status | What Breaks |
|----------|--------|-------------|
| `NEXT_PUBLIC_OPENROUTER_KEY` | not in any .env | AI bio generation on onboarding silently fails |

## How to apply
Set these in `backend/.env` (backend vars) and/or Vercel environment variables (frontend vars).
