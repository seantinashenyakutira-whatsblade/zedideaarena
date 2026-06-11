-- =============================================================
-- v9: Onboarding fixes — RLS recursion fix + new columns
-- =============================================================

-- 1. Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]'::jsonb;

-- 2. Fix RLS policies to avoid infinite recursion
-- Drop all recursive policies on users table
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Admins can read all ideas" ON ideas;
DROP POLICY IF EXISTS "Admins can read all payments" ON payments;

-- Create a secure admin check function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
  );
$$;

-- Re-create admin policies using the safe function
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage competitions"
  ON competitions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can read all ideas"
  ON ideas FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  USING (public.is_admin());

-- Fix storage bucket policies too
DROP POLICY IF EXISTS "Admins can read all documents" ON storage.objects;
CREATE POLICY "Admins can read all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-documents'
    AND public.is_admin()
  );

-- Fix verified voter policy (also had potential recursion)
DROP POLICY IF EXISTS "Verified voters can insert votes" ON votes;
CREATE POLICY "Verified voters can insert votes"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND is_verified = true
        AND voter_competitions_paid @> to_jsonb(competition_id::text)
        AND id != auth.uid()  -- break recursion by excluding self-reference in subquery
    )
  );
