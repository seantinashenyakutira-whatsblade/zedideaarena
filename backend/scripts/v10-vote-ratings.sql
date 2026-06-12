-- v10: Add rating and comment columns to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS innovation_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS impact_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS feasibility_rating INTEGER;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS comment TEXT;
