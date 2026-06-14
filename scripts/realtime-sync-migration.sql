-- ==============================================================
-- Realtime Sync + Atomic Vote Counting Migration
-- Run this in Supabase SQL editor
-- ==============================================================

-- 1. ATOMIC VOTE COUNTING --------------------------------------
-- Function: atomically increment votes_count (no race condition)
CREATE OR REPLACE FUNCTION public.increment_vote_count(p_idea_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ideas
  SET votes_count = votes_count + 1
  WHERE id = p_idea_id;
END;
$$;

-- Function: atomically decrement votes_count (for admin undo)
CREATE OR REPLACE FUNCTION public.decrement_vote_count(p_idea_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ideas
  SET votes_count = GREATEST(0, votes_count - 1)
  WHERE id = p_idea_id;
END;
$$;

-- 2. DB TRIGGERS FOR COUNT SYNC ---------------------------------

-- Trigger: auto-update votes_count when a vote is inserted
CREATE OR REPLACE FUNCTION public.on_vote_inserted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comp_id UUID;
BEGIN
  UPDATE ideas
  SET votes_count = votes_count + 1
  WHERE id = NEW.idea_id;

  SELECT competition_id INTO comp_id FROM ideas WHERE id = NEW.idea_id;

  -- Broadcast the count update to all subscribers on this competition channel
  PERFORM realtime.send(
    jsonb_build_object(
      'type', 'vote_count',
      'idea_id', NEW.idea_id,
      'votes_count', (SELECT votes_count FROM ideas WHERE id = NEW.idea_id),
      'user_id', NEW.user_id
    )::text,
    'broadcast',
    'vote_update',
    'competition-' || comp_id,
    'public'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vote_inserted ON votes;
CREATE TRIGGER trg_vote_inserted
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_vote_inserted();

-- Trigger: auto-update votes_count when a vote is deleted
CREATE OR REPLACE FUNCTION public.on_vote_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comp_id UUID;
BEGIN
  UPDATE ideas
  SET votes_count = GREATEST(0, votes_count - 1)
  WHERE id = OLD.idea_id;

  SELECT competition_id INTO comp_id FROM ideas WHERE id = OLD.idea_id;

  PERFORM realtime.send(
    jsonb_build_object(
      'type', 'vote_count',
      'idea_id', OLD.idea_id,
      'votes_count', (SELECT votes_count FROM ideas WHERE id = OLD.idea_id),
      'user_id', OLD.user_id
    )::text,
    'broadcast',
    'vote_update',
    'competition-' || comp_id,
    'public'
  );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_vote_deleted ON votes;
CREATE TRIGGER trg_vote_deleted
  AFTER DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_vote_deleted();

-- Trigger: auto-update likes_count and broadcast on arena_likes insert/delete
CREATE OR REPLACE FUNCTION public.on_arena_like_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE arena_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;

    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'like_count',
        'post_id', NEW.post_id,
        'likes_count', (SELECT likes_count FROM arena_posts WHERE id = NEW.post_id),
        'user_id', NEW.user_id
      )::text,
      'broadcast',
      'like_update',
      'arena-feed',
      'public'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE arena_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;

    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'like_count',
        'post_id', OLD.post_id,
        'likes_count', (SELECT likes_count FROM arena_posts WHERE id = OLD.post_id),
        'user_id', OLD.user_id
      )::text,
      'broadcast',
      'like_update',
      'arena-feed',
      'public'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_arena_like_inserted ON arena_likes;
CREATE TRIGGER trg_arena_like_inserted
  AFTER INSERT ON arena_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_arena_like_changed();

DROP TRIGGER IF EXISTS trg_arena_like_deleted ON arena_likes;
CREATE TRIGGER trg_arena_like_deleted
  AFTER DELETE ON arena_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.on_arena_like_changed();

-- Trigger: auto-update comments_count and broadcast on arena_comments insert/delete
CREATE OR REPLACE FUNCTION public.on_arena_comment_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE arena_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;

    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'comment_count',
        'post_id', NEW.post_id,
        'comments_count', (SELECT comments_count FROM arena_posts WHERE id = NEW.post_id)
      )::text,
      'broadcast',
      'comment_update',
      'arena-feed',
      'public'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE arena_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;

    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'comment_count',
        'post_id', OLD.post_id,
        'comments_count', (SELECT comments_count FROM arena_posts WHERE id = OLD.post_id)
      )::text,
      'broadcast',
      'comment_update',
      'arena-feed',
      'public'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_arena_comment_inserted ON arena_comments;
CREATE TRIGGER trg_arena_comment_inserted
  AFTER INSERT ON arena_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_arena_comment_changed();

DROP TRIGGER IF EXISTS trg_arena_comment_deleted ON arena_comments;
CREATE TRIGGER trg_arena_comment_deleted
  AFTER DELETE ON arena_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_arena_comment_changed();

-- 3. ENABLE REALTIME FOR ALL TABLES ----------------------------
-- Add all tables that need real-time sync to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE arena_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE arena_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE arena_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE competitions;
