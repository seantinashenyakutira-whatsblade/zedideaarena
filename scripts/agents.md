# Scripts — Database Migrations

## PURPOSE
SQL migration files for Supabase PostgreSQL database. Apply in order via Supabase SQL Editor.

## MIGRATION FILES
| File | Purpose |
|------|---------|
| `migrate-to-supabase.sql` | Core schema — users, ideas, competitions, votes, payments |
| `v2-competition-system.sql` | Competition improvements — fees, prize pools |
| `v3-checkout-sessions.sql` | Stripe checkout session tracking |
| `v4-voting-system.sql` | Vote registration system |
| `v5-admin.sql` | Admin actions audit log |
| `v6-onboarding.sql` | Onboarding profile fields |
| `v7-address-column.sql` | Address field addition |
| `add-profile-columns.sql` | Profile expansion fields |
| `withdrawal_migration.sql` | Withdrawal requests table |
| `v8-notifications-comments.sql` | Notifications, comments, reactions, platform_stats |

## RULES
- Apply in numeric/semantic version order
- Test each migration against staging before production
- All new tables need RLS policies
- Always use `IF NOT EXISTS` for idempotent migrations
