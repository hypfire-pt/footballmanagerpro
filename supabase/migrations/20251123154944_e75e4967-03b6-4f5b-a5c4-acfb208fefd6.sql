-- Add stadium_image_url column to teams table
ALTER TABLE public.teams 
ADD COLUMN stadium_image_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.teams.stadium_image_url IS 'URL to the team''s stadium image for match backgrounds and club pages';