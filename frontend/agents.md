# Frontend — Agents Guide

## PURPOSE
Next.js 16 App Router application — all user-facing UI, pages, components, and client-side logic.

## OWNERSHIP
- Pages, layouts, routing (`app/`)
- Reusable UI components (`components/`)
- Auth state management (`hooks/useAuth.ts`)
- API client layer (`services/`, `lib/api.js`)
- Route protection (`middleware.ts`)

## RULES
- All new pages: `'use client'` unless server-rendered static content
- Use `@/` path aliases (e.g. `@/hooks/useAuth`, `@/lib/api`)
- Styling: Tailwind CSS v4 classes + css module globals
- Forms: always validate with Zod schemas from `lib/validators/`
- Loading states: every page needs a `loading.tsx` with skeleton UI
- Error states: every page handles errors gracefully
- No `any` types in new code — use proper TypeScript interfaces

## KEY FILES
| File | Purpose |
|------|---------|
| `middleware.ts` | Auth guard, onboarding check, role-based routing |
| `hooks/useAuth.ts` | AuthProvider + useAuth hook — session, profile, role |
| `services/auth.js` | Supabase auth operations (login, signup, logout, OAuth) |
| `lib/api.js` | Axios instance with token interceptor |
| `lib/supabase.ts` | Supabase browser client singleton |

## CHILD DOCS
- `app/agents.md` — pages, routes, layouts
- `components/agents.md` — UI component library

## WORK GUIDANCE
- Edit pages in `app/` first, then add services, then components
- Every new route needs: `page.tsx` + `loading.tsx` (+ `error.tsx` for complex pages)
- Test frontend build with `pnpm build` before deploying
- Avoid `router.push()` for auth redirects — use `window.location.replace()` so middleware runs correctly
