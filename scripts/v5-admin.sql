-- v5: Admin Control Layer
-- Adds audit log table, soft delete for competitions, indexes

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_verified', 'user_unverified',
    'idea_approved', 'idea_rejected',
    'competition_created', 'competition_edited', 'competition_deleted'
  )),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_competitions_is_deleted ON competitions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_ideas_admin_note ON ideas(admin_note);
