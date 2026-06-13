-- Add images array column for multi-photo posts
ALTER TABLE arena_posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add topics/tags column
ALTER TABLE arena_posts ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- Admin chat table
CREATE TABLE IF NOT EXISTS arena_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for chat lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON arena_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON arena_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_admin ON arena_chat_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON arena_chat_messages(created_at);

-- Enable RLS
ALTER TABLE arena_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies: users can see their own messages, admins can see all
CREATE POLICY "Users view own chat" ON arena_chat_messages
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users insert own chat" ON arena_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins insert replies" ON arena_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE arena_chat_messages;

-- Arena rules table
CREATE TABLE IF NOT EXISTS arena_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  consequence TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE arena_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read rules" ON arena_rules FOR SELECT USING (true);
CREATE POLICY "Admins manage rules" ON arena_rules
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- Insert default rules
INSERT INTO arena_rules (title, description, consequence, category, sort_order) VALUES
  ('Be Respectful', 'Treat all community members with respect. No harassment, hate speech, or personal attacks.', 'Warning → 24h mute → Permanent ban', 'conduct', 1),
  ('No Spam', 'Do not post repetitive content, unsolicited promotions, or irrelevant links.', 'Content removal → 48h mute → Permanent ban', 'conduct', 2),
  ('Stay On Topic', 'Keep discussions relevant to the post or competition. Use appropriate post types.', 'Content removal → Warning', 'posting', 3),
  ('No Impersonation', 'Do not impersonate staff, other users, or public figures.', 'Permanent ban', 'conduct', 4),
  ('Respect Privacy', 'Do not share personal information of others without consent.', 'Content removal → Permanent ban', 'conduct', 5),
  ('Original Content', 'Posts should be your original content or properly attributed. No plagiarism.', 'Content removal → Warning → Ban', 'posting', 6),
  ('No Hate Speech', 'Zero tolerance for content promoting hatred, violence, or discrimination.', 'Immediate permanent ban', 'conduct', 7),
  ('Report Violations', 'Use the report feature to flag content that breaks these rules.', 'N/A - Reporting is encouraged', 'posting', 8),
  ('No Copyright Violations', 'Do not post content that infringes on copyrights, trademarks, or intellectual property.', 'Content removal → Permanent ban', 'conduct', 9),
  ('Keep It Clean', 'No explicit, adult, or NSFW content. Keep discussions appropriate for all ages.', 'Content removal → 48h mute → Ban', 'posting', 10);
