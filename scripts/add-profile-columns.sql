-- ZedIdeaArena: Add profile columns & auto-create trigger
-- Run this in your Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_mode TEXT DEFAULT 'contestant';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Trigger function: auto-create user row when someone signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Innovator'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Mark existing admins (migrate from old hardcoded list)
UPDATE users SET is_admin = TRUE WHERE email IN (
  'dybrahimovic28@gmail.com',
  'seantinashenyakutira@gmail.com',
  'chenaichapto@gmail.com'
);
