-- Migration 002: Notification preferences table + priority support
-- Run this manually in Supabase SQL Editor

-- 1. Add priority and category columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'low';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  sound_name TEXT DEFAULT 'chime',
  categories JSONB DEFAULT '{
    "idea_approved": {"push": true, "sound": true, "priority": "high"},
    "verification": {"push": true, "sound": true, "priority": "high"},
    "payments": {"push": true, "sound": true, "priority": "high"},
    "arena_engagement": {"push": true, "sound": true, "priority": "low"},
    "reports": {"push": true, "sound": true, "priority": "high"},
    "new_competitions": {"push": true, "sound": true, "priority": "low"},
    "messages": {"push": true, "sound": true, "priority": "high"},
    "admin_new_ideas": {"push": true, "sound": true, "priority": "high"},
    "admin_arena_engagement": {"push": true, "sound": true, "priority": "low"},
    "admin_messages": {"push": true, "sound": true, "priority": "low"},
    "admin_payments": {"push": true, "sound": true, "priority": "high"},
    "admin_new_users": {"push": true, "sound": true, "priority": "low"},
    "admin_reports": {"push": true, "sound": true, "priority": "high"},
    "admin_withdrawals": {"push": true, "sound": true, "priority": "high"}
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_priority
  ON notifications(priority);

CREATE INDEX IF NOT EXISTS idx_notifications_category
  ON notifications(category);
