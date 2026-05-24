-- Run this in Supabase SQL Editor

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('paypal', 'crypto', 'bank')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),

  -- PayPal fields
  paypal_email TEXT,

  -- Crypto fields
  crypto_wallet_address TEXT,
  crypto_network TEXT, -- 'BTC', 'ETH', 'USDT-TRC20', 'USDT-ERC20'

  -- Bank fields
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_swift_code TEXT,
  bank_country TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see their own requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own withdrawals" ON withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own withdrawals" ON withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add withdrawal preference columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_withdrawal_method TEXT,
  ADD COLUMN IF NOT EXISTS paypal_email TEXT,
  ADD COLUMN IF NOT EXISTS crypto_wallet TEXT,
  ADD COLUMN IF NOT EXISTS crypto_network TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_swift_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_country TEXT;
