-- Add notification preferences columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS in_game_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sound boolean DEFAULT true;

-- Add audio settings columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS master_volume integer DEFAULT 80 CHECK (master_volume >= 0 AND master_volume <= 100),
ADD COLUMN IF NOT EXISTS sfx_volume integer DEFAULT 80 CHECK (sfx_volume >= 0 AND sfx_volume <= 100),
ADD COLUMN IF NOT EXISTS music_volume integer DEFAULT 60 CHECK (music_volume >= 0 AND music_volume <= 100),
ADD COLUMN IF NOT EXISTS commentary_volume integer DEFAULT 70 CHECK (commentary_volume >= 0 AND commentary_volume <= 100),
ADD COLUMN IF NOT EXISTS mute_all boolean DEFAULT false;

-- Add accessibility settings columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS high_contrast_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reduce_motion boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS color_blind_mode text DEFAULT 'none' CHECK (color_blind_mode IN ('none', 'protanopia', 'deuteranopia', 'tritanopia'));

-- Add privacy settings columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS allow_data_collection boolean DEFAULT true;

-- Add advanced game settings columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auto_save_frequency text DEFAULT 'normal' CHECK (auto_save_frequency IN ('disabled', 'low', 'normal', 'high')),
ADD COLUMN IF NOT EXISTS default_dashboard_view text DEFAULT 'overview' CHECK (default_dashboard_view IN ('overview', 'compact', 'detailed'));