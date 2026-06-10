-- ============================================================
-- v8: Notifications, Comments, Reactions & Platform Stats
-- Apply in Supabase SQL Editor
-- ============================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are public" ON comments
  FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reactions table (likes on ideas)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id, type)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are public" ON reactions
  FOR SELECT USING (true);
CREATE POLICY "Auth users can react" ON reactions
  FOR ALL USING (auth.uid() = user_id);

-- Platform stats view
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COUNT(*) FROM competitions WHERE (start_date <= NOW() AND submission_deadline >= NOW()) AND (is_deleted IS DISTINCT FROM true)) as active_competitions,
  (SELECT COUNT(*) FROM ideas WHERE is_public = true) as total_ideas,
  (SELECT COALESCE(SUM(prize_pool_cents), 0) FROM competitions WHERE is_deleted IS DISTINCT FROM true) as total_prize_pool_cents,
  (SELECT COUNT(DISTINCT user_id) FROM votes) as total_voters;
