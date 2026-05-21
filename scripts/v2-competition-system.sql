-- ZedIdeaArena v2: Competition System Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- COMPETITIONS TABLE
-- ============================================

-- Add new columns to competitions
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS entry_fee_cents INT DEFAULT 500;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS voter_fee_cents INT NOT NULL DEFAULT 0;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS prize_pool_cents INT DEFAULT 0;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Migrate existing entry_fee (dollars) to cents
UPDATE competitions SET entry_fee_cents = ROUND(COALESCE(entry_fee, 5)::NUMERIC * 100)::INT;

-- Drop stored status column (now computed from dates)
ALTER TABLE competitions DROP COLUMN IF EXISTS status;

-- Drop columns tracked dynamically
ALTER TABLE competitions DROP COLUMN IF EXISTS participants_count;
ALTER TABLE competitions DROP COLUMN IF EXISTS ideas_count;

-- ============================================
-- IDEAS TABLE
-- ============================================

-- Add new columns to ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS problem TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS business_model TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS pitch_video_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Migrate data from old columns to new columns
UPDATE ideas SET
  problem = COALESCE(problem_statement, ''),
  solution = COALESCE(description, ''),
  industry = COALESCE(category, ''),
  pitch_video_url = COALESCE(video_url, ''),
  github_url = COALESCE(links->>'github', ''),
  linkedin_url = COALESCE(links->>'linkedin', ''),
  instagram_url = COALESCE(links->>'instagram', '');

-- Extend CHECK constraint to allow 'pending' alongside existing statuses
ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_status_check;
ALTER TABLE ideas ADD CONSTRAINT ideas_status_check
  CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'pending'));

-- ============================================
-- COMPETITIONS RLS (update for computed status)
-- ============================================

-- Drop old RLS policies that reference status column
DROP POLICY IF EXISTS "Anyone can read competitions" ON competitions;
CREATE POLICY "Anyone can read competitions"
  ON competitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage competitions" ON competitions;
CREATE POLICY "Admins can manage competitions"
  ON competitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- ============================================
-- CREATE PITCH-VIDEOS STORAGE BUCKET
-- ============================================

-- Insert a private bucket record for pitch videos
-- Note: The bucket must be created via Supabase Dashboard or Management API.
-- This ensures the bucket policy exists in the storage schema.
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-videos',
  'pitch-videos',
  false,
  false,
  524288000,
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm']::text[];

-- RLS policy: authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Users can upload pitch videos" ON storage.objects;
CREATE POLICY "Users can upload pitch videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pitch-videos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: users can read their own uploads
DROP POLICY IF EXISTS "Users can read own pitch videos" ON storage.objects;
CREATE POLICY "Users can read own pitch videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-videos'
    AND (
      auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- RLS policy: admins can read all pitch videos
DROP POLICY IF EXISTS "Admins can read all pitch videos" ON storage.objects;
CREATE POLICY "Admins can read all pitch videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-videos'
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );
