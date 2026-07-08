-- Enable RLS on admin_actions table (was missing)
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all admin actions" ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

CREATE POLICY "Admins can insert admin actions" ON admin_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );
