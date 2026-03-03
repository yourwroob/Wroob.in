
-- Add onboarding tracking columns to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS profile_role text,
ADD COLUMN IF NOT EXISTS experience_years text,
ADD COLUMN IF NOT EXISTS is_student boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS current_job_title text,
ADD COLUMN IF NOT EXISTS current_company text,
ADD COLUMN IF NOT EXISTS not_employed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS website_url text;

-- Create student_preferences table
CREATE TABLE IF NOT EXISTS public.student_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  job_search_status text,
  job_types text[] DEFAULT '{}',
  desired_salary numeric,
  currency text DEFAULT 'USD',
  preferred_roles text[] DEFAULT '{}',
  preferred_locations text[] DEFAULT '{}',
  remote_ok boolean DEFAULT false,
  us_authorized boolean,
  needs_sponsorship boolean,
  company_size_preferences jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own preferences" ON public.student_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own preferences" ON public.student_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update own preferences" ON public.student_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create student_culture table
CREATE TABLE IF NOT EXISTS public.student_culture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tech_interests text[] DEFAULT '{}',
  tech_avoid text[] DEFAULT '{}',
  motivation_type text,
  career_track text,
  environment_preference text,
  job_priorities text[] DEFAULT '{}',
  remote_importance text,
  quiet_importance text,
  job_description_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_culture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own culture" ON public.student_culture FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own culture" ON public.student_culture FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students can update own culture" ON public.student_culture FOR UPDATE USING (auth.uid() = user_id);
