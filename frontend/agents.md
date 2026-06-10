# Frontend — Agent Docs

## Purpose
Next.js 16 App Router application — all user-facing UI, pages, components, and client-side logic.

## Key Files
- `middleware.ts` — Route protection; redirects unauthenticated users to /auth/login
- `lib/api.js` — Axios instance with localStorage token interceptor
- `lib/supabase-browser.ts` — Browser-side Supabase client (anon key)
- `lib/supabase-server.ts` — Server-side Supabase client (service role)
- `lib/utils.ts` — Tailwind CSS class merge utility
- `lib/validators/` — Zod schemas for login, signup, profile, idea forms
- `hooks/useAuth.ts` — Auth context provider + session/profile state
- `hooks/use-toast.ts` — Sonner toast notification hook
- `services/auth.js` — Auth service (login, signup, logout, OAuth, sync)
- `services/core.ts` — Admin API service (stats, users, ideas, audit)
- `services/idea.ts` — Idea CRUD API service
- `services/payment.js` — Payment API service (Stripe checkout, verify)
- `app/` — All App Router pages and layouts
- `components/` — Reusable UI and business components
- `public/` — Static assets (logos, images, icons)
- `next.config.mjs` — Next.js configuration
- `tailwind.config.ts` — Tailwind theme and custom tokens
- `tsconfig.json` — TypeScript configuration

## Rules
- All auth checks server-side via middleware.ts; never trust client-side state for guarding routes
- Use `window.location.replace()` instead of `router.replace()` for auth redirects to let middleware handle routing
- API calls go through `lib/api.js` (handles token injection and error formatting)
- Form validation uses Zod schemas in `lib/validators/`
- shadcn/ui components go in `components/ui/`; business components go in their own folders
- Environment variables prefixed with `NEXT_PUBLIC_` are client-safe; secrets go only to backend

## Child Docs
- /frontend/app/agents.md — Pages and routes
- /frontend/components/agents.md — UI component library
