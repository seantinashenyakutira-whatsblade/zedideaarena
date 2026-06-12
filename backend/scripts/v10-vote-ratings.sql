-- v10: Add rating and comment columns to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS innovation_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS impact_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS feasibility_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS comment TEXT;

-- v10b: Backfill is_public for any paid+approved ideas that aren't public
UPDATE ideas SET is_public = true, updated_at = NOW()
WHERE payment_status = 'paid'
  AND status = 'approved'
  AND is_public = false;
