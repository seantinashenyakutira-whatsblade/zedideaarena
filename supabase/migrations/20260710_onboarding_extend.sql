-- Onboarding questionnaire columns
ALTER TABLE waitlist_signups
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS interested_in_voting boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS interested_in_earning boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS interested_in_competitions boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS motivations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_idea text,
  ADD COLUMN IF NOT EXISTS interested_in_community boolean DEFAULT false;

-- Index for referral source analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_source ON waitlist_signups(referral_source);
CREATE INDEX IF NOT EXISTS idx_waitlist_interested_voting ON waitlist_signups(interested_in_voting);
