-- Extended waitlist_signups with full onboarding fields
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS username varchar(100);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS country varchar(100);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS profession varchar(100);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS role varchar(50);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS goal varchar(100);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS challenge varchar(100);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS referral_code varchar(20) UNIQUE;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES waitlist_signups(id);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS verification_token varchar(255);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS verification_token_expiry timestamp;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT true;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS email_status varchar(20) DEFAULT 'pending';
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS last_email_sent timestamp;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS last_email_type varchar(50);
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS unsubscribed boolean DEFAULT false;
ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp;

CREATE INDEX IF NOT EXISTS idx_waitlist_verification_token ON waitlist_signups(verification_token);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_verified ON waitlist_signups(email_verified);
CREATE INDEX IF NOT EXISTS idx_waitlist_role ON waitlist_signups(role);
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON waitlist_signups(country);
CREATE INDEX IF NOT EXISTS idx_waitlist_goal ON waitlist_signups(goal);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON waitlist_signups(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_status ON waitlist_signups(email_status);
CREATE INDEX IF NOT EXISTS idx_waitlist_last_email_sent ON waitlist_signups(last_email_sent);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id uuid REFERENCES waitlist_signups(id) ON DELETE CASCADE,
  email_type varchar(50) NOT NULL,
  recipient_email varchar(255) NOT NULL,
  subject varchar(255) NOT NULL,
  message_id varchar(255),
  status varchar(20) DEFAULT 'sent',
  error text,
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  opened_at timestamp,
  clicked_at timestamp,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_waitlist_id ON email_logs(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

-- Verification attempts tracking
CREATE TABLE IF NOT EXISTS verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  ip_address varchar(45),
  attempt_type varchar(20) DEFAULT 'send',
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_attempts_email ON verification_attempts(email);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_ip ON verification_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_created ON verification_attempts(created_at);

-- Update RLS policies for new table
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email_logs" ON email_logs
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Admins can insert email_logs" ON email_logs
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Admins can read verification_attempts" ON verification_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Anyone can insert verification_attempts" ON verification_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);
