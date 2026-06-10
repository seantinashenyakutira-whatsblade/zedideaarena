# Backend — Agent Docs

## Purpose
Express.js 5 REST API — handles business logic, payments, media uploads, and Supabase integration.

## Key Files
- `package.json` — Dependencies (express, @supabase/supabase-js, stripe, cors, etc.)
- `.env` — Environment variables (local dev)
- `.env.example` — Environment variable template
- `src/index.js` — Express app entry point; middleware setup, route mounting, error handler

## Rules
- All sensitive keys in environment variables only (SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.)
- CORS configured with `origin: true` in production; restrict before launch
- Global error handler at bottom of index.js catches all unhandled errors
- express-rate-limit v8+ does not export defaultKeyGenerator; use req.ip directly
- Webhook routes registered before express.json() to preserve raw body for Stripe signature verification
- Health endpoints at /health and /api/health return service status only

## Child Docs
- /backend/src/agents.md — Source code organization
