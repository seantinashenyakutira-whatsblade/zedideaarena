# Components — UI Library

## PURPOSE
Reusable React components — shadcn/ui primitives + custom business components.

## KEY FILES
| File | Purpose |
|------|---------|
| `ui/*.tsx` | 57 shadcn/ui primitives (button, card, dialog, etc.) |
| `dashboard/sidebar.tsx` | Navigation sidebar with role toggle |
| `dashboard/header.tsx` | Top header with user menu, notifications |
| `dashboard/KycBanner.tsx` | Verification status banner |
| `payment/StripePaymentForm.tsx` | Stripe Elements card form |
| `auth/ProtectedRoute.tsx` | Client-side auth guard wrapper |
| `ui/SuccessPage.tsx` | Reusable success page component with auto-redirect |
| `CompetitionCountdown.tsx` | Live countdown timer |

## RULES
- shadcn components live in `ui/` subfolder
- Business components live directly in `components/`
- Use `cn()` utility from `@/lib/utils` for class merging
- All interactive components support loading/disabled states
- Keep components focused — max 200 lines, extract child components if larger
