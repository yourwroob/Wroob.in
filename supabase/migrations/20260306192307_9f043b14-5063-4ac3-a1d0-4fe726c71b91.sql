-- Add explicit deny-all policy on rate_limits to satisfy linter
-- Service role bypasses RLS, so this correctly blocks all client access
CREATE POLICY "No client access" ON public.rate_limits
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);