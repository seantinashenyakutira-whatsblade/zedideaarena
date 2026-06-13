-- Chat system upgrade: attachments, read receipts, typing
-- Run this in Supabase SQL editor

ALTER TABLE arena_chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE arena_chat_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE arena_chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE arena_chat_messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE arena_chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_chat_file_type ON arena_chat_messages(file_type);
CREATE INDEX IF NOT EXISTS idx_chat_read ON arena_chat_messages(read_at);
