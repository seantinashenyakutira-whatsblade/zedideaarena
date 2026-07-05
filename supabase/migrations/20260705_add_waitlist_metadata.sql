ALTER TABLE waitlist_signups ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_waitlist_metadata ON waitlist_signups USING gin(metadata);
