-- =============================================================================
-- FIX: CRITICAL-1/#2 — Google OAuth users silently assigned 'student' role
--
-- Root cause: handle_new_user always inserts into user_roles, even for OAuth
-- signups where no role was chosen. This bypasses the role-selection step.
--
-- Fix: for non-email providers (e.g. google), skip user_roles and role-specific
-- profile stub creation. The DB trigger still creates the base profiles row.
-- Dashboard detects role = null → redirects to /select-role → user picks role
-- → set_initial_role() creates user_roles + profile stub from there.
--
-- Email signups continue to work exactly as before — the 'role' field in
-- raw_user_meta_data is picked up and applied immediately.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role app_role;
  _provider text;
BEGIN
  -- Identify the auth provider. Email signups use 'email'; OAuth uses 'google', etc.
  _provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- Always create the base profile row regardless of provider.
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (user_id) DO NOTHING;

  -- For OAuth providers, skip role assignment here. The user will reach
  -- /select-role (via Dashboard), pick a role, and set_initial_role() handles
  -- user_roles + role-specific profile stub in a single transaction.
  IF _provider != 'email' THEN
    RETURN NEW;
  END IF;

  -- Email signup: apply the role from metadata (admin is silently demoted to student).
  _role := CASE
    WHEN (NEW.raw_user_meta_data->>'role') = 'employer' THEN 'employer'::app_role
    ELSE 'student'::app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id) DO NOTHING;

  IF _role = 'student' THEN
    INSERT INTO public.student_profiles (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF _role = 'employer' THEN
    INSERT INTO public.employer_profiles (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
