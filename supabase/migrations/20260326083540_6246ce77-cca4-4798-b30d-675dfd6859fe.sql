
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS internship_category text DEFAULT 'full-time',
  ADD COLUMN IF NOT EXISTS duration_months integer,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS working_days text,
  ADD COLUMN IF NOT EXISTS working_hours text,
  ADD COLUMN IF NOT EXISTS stipend_type text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stipend_amount numeric,
  ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS eligibility text[],
  ADD COLUMN IF NOT EXISTS roles_responsibilities text,
  ADD COLUMN IF NOT EXISTS day_to_day_tasks text,
  ADD COLUMN IF NOT EXISTS projects text,
  ADD COLUMN IF NOT EXISTS resume_screening boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS interview_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS test_assignment text,
  ADD COLUMN IF NOT EXISTS joining_process text;
