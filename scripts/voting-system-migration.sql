-- ZedIdeaArena — Voting System Migration
-- Run this in your Supabase SQL Editor

-- 1. Add rating columns to votes table
ALTER TABLE votes
  ADD COLUMN IF NOT EXISTS innovation_score INT CHECK (innovation_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS feasibility_score INT CHECK (feasibility_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS impact_score INT CHECK (impact_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS presentation_score INT CHECK (presentation_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS comment TEXT,
  ADD COLUMN IF NOT EXISTS time_spent_seconds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_score DECIMAL GENERATED ALWAYS AS (
    (innovation_score + feasibility_score + impact_score + presentation_score) / 4.0
  ) STORED;

-- 2. Fix unique constraint (old: UNIQUE(user_id, competition_id) prevents voting multiple ideas)
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_competition_id_key;
ALTER TABLE votes ADD CONSTRAINT votes_user_id_idea_id_key UNIQUE (user_id, idea_id);

-- 3. Voter earnings table
CREATE TABLE IF NOT EXISTS voter_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id),
  base_amount_cents INT DEFAULT 0,
  bonus_amount_cents INT DEFAULT 0,
  ad_amount_cents INT DEFAULT 0,
  total_amount_cents INT GENERATED ALWAYS AS
    (base_amount_cents + bonus_amount_cents + ad_amount_cents) STORED,
  votes_cast INT DEFAULT 0,
  ads_watched INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(voter_id, competition_id)
);

ALTER TABLE voter_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voters see own earnings" ON voter_earnings
  FOR ALL USING (auth.uid() = voter_id);

-- 4. Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ad_unit TEXT,
  duration_seconds INT DEFAULT 0,
  credited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own impressions" ON ad_impressions
  FOR ALL USING (auth.uid() = user_id);

-- 5. Vote bonus function
CREATE OR REPLACE FUNCTION add_voter_vote_bonus(
  p_voter_id uuid,
  p_competition_id uuid
)
RETURNS void AS $$
  INSERT INTO voter_earnings (voter_id, competition_id, votes_cast, bonus_amount_cents)
  VALUES (p_voter_id, p_competition_id, 1, 10)
  ON CONFLICT (voter_id, competition_id) DO UPDATE SET
    votes_cast = voter_earnings.votes_cast + 1,
    bonus_amount_cents = voter_earnings.bonus_amount_cents + 10,
    updated_at = NOW();
$$ LANGUAGE sql SECURITY DEFINER;
