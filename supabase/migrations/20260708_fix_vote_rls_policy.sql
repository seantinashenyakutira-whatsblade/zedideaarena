-- Fix broken vote insert RLS policy that was blocking all vote inserts
-- The previous policy had: WHERE id = auth.uid() AND is_verified = true AND id != auth.uid()
-- The id != auth.uid() clause made the entire WHERE condition always false

DROP POLICY IF EXISTS "Verified voters can insert votes" ON votes;

CREATE POLICY "Verified voters can insert votes" ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE id = auth.uid() AND is_verified = true
    )
  );
