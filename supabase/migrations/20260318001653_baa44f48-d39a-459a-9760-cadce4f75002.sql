
-- App ratings table (one rating per user per app)
CREATE TABLE public.app_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (app_id, user_hash)
);

-- App comments table
CREATE TABLE public.app_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_comments ENABLE ROW LEVEL SECURITY;

-- Public read access for ratings
CREATE POLICY "Anyone can read ratings"
  ON public.app_ratings
  FOR SELECT
  USING (true);

-- Public read access for comments
CREATE POLICY "Anyone can read comments"
  ON public.app_comments
  FOR SELECT
  USING (true);

-- Allow inserts via service role (edge function will handle validation)
CREATE POLICY "Service role can insert ratings"
  ON public.app_ratings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update ratings"
  ON public.app_ratings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can insert comments"
  ON public.app_comments
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admin) can delete comments
CREATE POLICY "Authenticated users can delete comments"
  ON public.app_comments
  FOR DELETE
  TO authenticated
  USING (true);

-- Authenticated users (admin) can delete ratings
CREATE POLICY "Authenticated users can delete ratings"
  ON public.app_ratings
  FOR DELETE
  TO authenticated
  USING (true);

-- Index for performance
CREATE INDEX idx_app_ratings_app_id ON public.app_ratings(app_id);
CREATE INDEX idx_app_comments_app_id ON public.app_comments(app_id);
CREATE INDEX idx_app_comments_created_at ON public.app_comments(created_at DESC);
