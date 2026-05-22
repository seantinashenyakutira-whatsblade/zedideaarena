-- ZedIdeaArena v3: Stripe Checkout Sessions Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- PAYMENTS TABLE UPDATE
-- ============================================
-- Add new columns for Checkout Sessions
ALTER TABLE payments ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_cents INT;

-- Update CHECK constraint to include 'completed' and 'pending' from new schema
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'succeeded', 'canceled'));

-- ============================================
-- USERS TABLE UPDATE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS voter_competitions_paid JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- COMPETITIONS TABLE UPDATE
-- ============================================
ALTER TABLE competitions ALTER COLUMN prize_pool_cents SET DEFAULT 0;
ALTER TABLE competitions ALTER COLUMN prize_pool_cents SET NOT NULL;
UPDATE competitions SET prize_pool_cents = 0 WHERE prize_pool_cents IS NULL;

-- ============================================
-- FUNCTION: Increment prize pool atomically
-- ============================================
CREATE OR REPLACE FUNCTION increment_prize_pool(comp_id UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE competitions
  SET prize_pool_cents = prize_pool_cents + amount
  WHERE id = comp_id;
END;
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_competition ON payments(user_id, competition_id);
