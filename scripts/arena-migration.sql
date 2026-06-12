-- ZedIdeaArena — Arena Social Hub Migration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS arena_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  post_type TEXT DEFAULT 'discussion',
  linked_idea_id UUID REFERENCES ideas(id),
  linked_competition_id UUID REFERENCES competitions(id),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arena_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES arena_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arena_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES arena_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE arena_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE arena_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arena posts are public" ON arena_posts
  FOR SELECT USING (true);
CREATE POLICY "Auth users can post" ON arena_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Arena comments are public" ON arena_comments
  FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON arena_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can like" ON arena_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_arena_posts_created_at ON arena_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arena_posts_pinned ON arena_posts(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_arena_comments_post_id ON arena_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_arena_likes_post_id ON arena_likes(post_id);
