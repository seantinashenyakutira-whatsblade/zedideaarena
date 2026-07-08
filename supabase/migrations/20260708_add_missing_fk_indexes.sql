-- Add missing foreign key indexes for JOIN performance
CREATE INDEX IF NOT EXISTS idx_arena_posts_user_id ON arena_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_arena_posts_linked_idea_id ON arena_posts(linked_idea_id);
CREATE INDEX IF NOT EXISTS idx_arena_posts_linked_competition_id ON arena_posts(linked_competition_id);
CREATE INDEX IF NOT EXISTS idx_arena_comments_user_id ON arena_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_arena_likes_user_id ON arena_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_idea_id ON reactions(idea_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_voter_earnings_voter_id ON voter_earnings(voter_id);
CREATE INDEX IF NOT EXISTS idx_voter_earnings_competition_id ON voter_earnings(competition_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_arena_reports_reviewed_by ON arena_reports(reviewed_by);
