
-- Create peerup_circles table
CREATE TABLE public.peerup_circles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  spot_name TEXT NOT NULL,
  spot_location TEXT,
  topic TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  drop_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  status TEXT NOT NULL DEFAULT 'active'
);

ALTER TABLE public.peerup_circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active circles"
ON public.peerup_circles FOR SELECT
TO authenticated
USING (status = 'active' AND expires_at > now());

CREATE POLICY "Students can create circles"
ON public.peerup_circles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id AND has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Creators can delete own circles"
ON public.peerup_circles FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update own circles"
ON public.peerup_circles FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

-- Create peerup_requests table
CREATE TABLE public.peerup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.peerup_circles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.peerup_requests ENABLE ROW LEVEL SECURITY;

-- Unique constraint: one request per user per circle
CREATE UNIQUE INDEX idx_peerup_requests_unique ON public.peerup_requests(circle_id, requester_id);

CREATE POLICY "Circle creators can view requests"
ON public.peerup_requests FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.peerup_circles c
  WHERE c.id = peerup_requests.circle_id AND c.creator_id = auth.uid()
));

CREATE POLICY "Requesters can view own requests"
ON public.peerup_requests FOR SELECT
TO authenticated
USING (auth.uid() = requester_id);

CREATE POLICY "Students can create requests"
ON public.peerup_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id AND has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Circle creators can update requests"
ON public.peerup_requests FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.peerup_circles c
  WHERE c.id = peerup_requests.circle_id AND c.creator_id = auth.uid()
));

-- Create peerup_participants table
CREATE TABLE public.peerup_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.peerup_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.peerup_participants ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_peerup_participants_unique ON public.peerup_participants(circle_id, user_id);

CREATE POLICY "Participants can view circle members"
ON public.peerup_participants FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.peerup_participants pp
  WHERE pp.circle_id = peerup_participants.circle_id AND pp.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.peerup_circles c
  WHERE c.id = peerup_participants.circle_id AND c.creator_id = auth.uid()
));

CREATE POLICY "System can insert participants"
ON public.peerup_participants FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.peerup_circles c
  WHERE c.id = peerup_participants.circle_id AND c.creator_id = auth.uid()
) OR auth.uid() = user_id);

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.peerup_circles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.peerup_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.peerup_participants;
