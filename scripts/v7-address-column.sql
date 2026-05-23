-- ZedIdeaArena v7: Add address column for full address storage
-- Run this in your Supabase SQL Editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
