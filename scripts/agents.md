# Scripts — Agent Docs

## Purpose
SQL migration files for Supabase PostgreSQL database. Apply in order via Supabase SQL Editor.

## Key Files
- `migrate-to-supabase.sql` — Base schema: users, competitions, ideas, votes, payments tables + indexes + Row Level Security
- `add-profile-columns.sql` — Adds profile columns (country, city, current_mode, etc.) + trigger to auto-create user row on auth signup
- `v2-competition-system.sql` — Competition prize pool RPC, submission deadline, entry fee cents
- `v3-checkout-sessions.sql` — Payment metadata columns, Stripe session tracking
- `v4-voting-system.sql` — Vote eligibility, per-competition voter tracking
- `v5-admin.sql` — Admin role enforcement, admin views
- `v6-onboarding.sql` — Onboarding step tracking columns
- `v7-address-column.sql` — Address and identity document URL columns
- `v8-notifications-comments.sql` — Notifications, comments, reactions tables + platform_stats view
- `withdrawal_migration.sql` — Withdrawal requests table and processing logic

## Rules
- Apply migrations sequentially (base first, then v2-v8, then withdrawal)
- All migrations are idempotent (IF NOT EXISTS / IF EXISTS guards)
- Never edit applied migrations; create new vN-*.sql for changes
- Row Level Security policies are defined in migrate-to-supabase.sql
- Trigger functions (e.g., handle_new_user) are defined in add-profile-columns.sql
- Competition entry fees stored as cents (integer) in entry_fee_cents column
- The users table uses UUID primary key matching Supabase Auth user ID

## Child Docs
(none — leaf node)
