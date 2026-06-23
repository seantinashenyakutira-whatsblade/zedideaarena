-- ZedIdeaArena v10: PawaPay Payment System Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- PAYMENTS TABLE UPDATE
-- ============================================

-- Add new columns for provider-agnostic payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_ref TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'pawapay';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS network_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update status check to include provider-agnostic statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'completed', 'failed', 'succeeded', 'canceled', 'expired', 'refunded'));

-- Add unique constraint on transaction_ref (only when non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_ref ON payments(transaction_ref) WHERE transaction_ref IS NOT NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Update existing rows to have a provider value
UPDATE payments SET provider = 'pawapay' WHERE provider IS NULL;
UPDATE payments SET updated_at = created_at WHERE updated_at IS NULL;

-- ============================================
-- PAYMENT_ATTEMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  transaction_ref TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'pawapay',
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'expired', 'cancelled')),
  correspondent TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  idempotency_key TEXT,
  error_message TEXT,
  attempt_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment attempts indexes
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_transaction_ref ON payment_attempts(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON payment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created_at ON payment_attempts(created_at DESC);

-- RLS for payment_attempts
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payment attempts"
  ON payment_attempts FOR SELECT
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all payment attempts"
  ON payment_attempts FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- ============================================
-- PAYMENT_WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL DEFAULT 'pawapay',
  event_type TEXT,
  transaction_ref TEXT,
  deposit_id TEXT,
  status TEXT,
  raw_payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment webhooks indexes
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_transaction_ref ON payment_webhooks(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON payment_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_created_at ON payment_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);

-- RLS for payment_webhooks (admin-only)
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all payment webhooks"
  ON payment_webhooks FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Service role can insert webhooks"
  ON payment_webhooks FOR INSERT
  WITH CHECK (true);

-- ============================================
-- UPDATE RLS ON EXISTING PAYMENTS TABLE
-- ============================================
-- Ensure RLS policies exist for payments
DROP POLICY IF EXISTS "Users can read own payments" ON payments;
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all payments" ON payments;
CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to payments
DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to payment_attempts
DROP TRIGGER IF EXISTS trg_payment_attempts_updated_at ON payment_attempts;
CREATE TRIGGER trg_payment_attempts_updated_at
  BEFORE UPDATE ON payment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
