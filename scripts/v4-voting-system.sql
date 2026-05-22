-- ZedIdeaArena v4: Voting System Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- VOTES TABLE
-- ============================================

-- Drop old UNIQUE constraint (one vote per competition)
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_competition_id_key;

-- Add new UNIQUE constraint (one vote per idea per user)
ALTER TABLE votes ADD CONSTRAINT votes_user_id_idea_id_key UNIQUE (user_id, idea_id);

-- Add score column
ALTER TABLE votes ADD COLUMN IF NOT EXISTS score INT DEFAULT 1;

-- Index for leaderboard query
CREATE INDEX IF NOT EXISTS idx_votes_competition_idea ON votes(competition_id, idea_id);

-- ============================================
-- FUNCTION: Get competition results with rankings
-- ============================================

CREATE OR REPLACE FUNCTION get_competition_results(comp_id UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  user_id UUID,
  contestant_name TEXT,
  vote_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.title, i.user_id, p.full_name::TEXT, COUNT(v.id)::BIGINT
  FROM ideas i
  LEFT JOIN votes v ON v.idea_id = i.id
  JOIN users p ON p.id = i.user_id
  WHERE i.competition_id = comp_id
    AND i.status = 'approved'
    AND i.is_public = true
  GROUP BY i.id, i.title, i.user_id, p.full_name
  ORDER BY COUNT(v.id) DESC;
END;
$$;

-- ============================================
-- RLS: Update votes insert policy
-- ============================================

DROP POLICY IF EXISTS "Verified voters can insert votes" ON votes;
CREATE POLICY "Verified voters can insert votes"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND is_verified = true
        AND voter_competitions_paid @> to_jsonb(competition_id::text)
    )
  );

DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  USING (true);
