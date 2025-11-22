-- Add game preferences and display settings columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ui_compact_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sidebar_default_collapsed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS animations_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS match_speed_default text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS tutorial_hints_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS theme_mode text DEFAULT 'dark';

-- Add check constraints for valid values
ALTER TABLE public.profiles
ADD CONSTRAINT match_speed_valid CHECK (match_speed_default IN ('slow', 'normal', 'fast', 'instant')),
ADD CONSTRAINT theme_mode_valid CHECK (theme_mode IN ('light', 'dark', 'auto'));