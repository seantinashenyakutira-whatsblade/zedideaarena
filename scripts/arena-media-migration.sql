-- Arena media, links, reposts support
-- Run in Supabase SQL Editor

ALTER TABLE arena_posts
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS link_preview JSONB,
  ADD COLUMN IF NOT EXISTS repost_of_id UUID REFERENCES arena_posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shares_count INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_arena_posts_repost_of ON arena_posts(repost_of_id);
