# Frontend App — Pages & Routes

## PURPOSE
All Next.js App Router pages, layouts, and route groups.

## ROUTE STRUCTURE
| Route | Purpose |
|-------|---------|
| `/` | Landing page with stats, hero, CTA |
| `/auth/login` | Email/password + Google OAuth login |
| `/auth/signup` | Registration form |
| `/auth/callback` | OAuth callback handler |
| `/onboarding/personal` | Step 1: personal info |
| `/onboarding/location` | Step 2: address/location |
| `/onboarding/documents` | Step 3: ID upload |
| `/onboarding/review` | Step 4: review & submit |
| `/dashboard` | Main dashboard overview |
| `/dashboard/ideas` | User's ideas list |
| `/dashboard/ideas/new` | Create idea form |
| `/dashboard/competitions` | Browse competitions |
| `/dashboard/payment` | Payment flow |
| `/dashboard/payment/success` | Payment success |
| `/dashboard/earnings` | Withdrawal management |
| `/dashboard/settings` | Profile settings |
| `/dashboard/voter` | Voter dashboard |
| `/dashboard/voting` | Voting interface |
| `/dashboard/vote/success` | Vote cast confirmation |
| `/dashboard/kyc` | KYC/document upload |
| `/dashboard/ideas/success` | Idea submission success |
| `/dashboard/competitions/[id]/leaderboard` | Live ranking by votes |
| `/onboarding/success` | Onboarding completion page |
| `/competitions` | Public competitions list |
| `/admin` | Admin panel |

## KEY FILES
| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout — AuthProvider, font, metadata |
| `page.tsx` | Landing page — hero, stats, features |
| `loading.tsx` | Root loading skeleton |
| `auth/login/page.tsx` | Login form with Zod validation |
| `dashboard/layout.tsx` | Dashboard wrapper — sidebar, header, auth check |

## RULES
- All dashboard pages wrapped in `DashboardLayout`
- Auth pages wrapped in `AuthLayout` (redirects authenticated users)
- Onboarding pages are standalone (no dashboard layout)
- Every form validates with Zod schema before submission
