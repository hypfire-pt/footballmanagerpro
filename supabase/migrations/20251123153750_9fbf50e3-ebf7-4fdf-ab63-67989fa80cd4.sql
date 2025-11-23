-- Add logo_url column to teams table
ALTER TABLE public.teams 
ADD COLUMN logo_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.teams.logo_url IS 'URL to the team''s official logo/crest image';