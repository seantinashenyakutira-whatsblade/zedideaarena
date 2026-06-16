-- Migration: Add appeal_count column to ideas table
-- Required for the appeal feature (max 5 appeals per rejected idea)
-- Run this in Supabase SQL Editor

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS appeal_count INTEGER DEFAULT 0;

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_ideas_appeal_count ON ideas (appeal_count);
