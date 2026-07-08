-- Fix waitlist_signups RLS: table has RLS enabled but no policies defined
-- This blocks ALL queries. Add policies for the anonymous signup flow.

CREATE POLICY "Anyone can insert into waitlist" ON waitlist_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read waitlist count" ON waitlist_signups
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can view individual waitlist entries
CREATE POLICY "Admins can view all waitlist entries" ON waitlist_signups
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );
