-- Create profiles table for user/manager identity
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  manager_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, manager_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'manager_name', 'Manager'));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create game_saves table
CREATE TABLE public.game_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saves"
  ON public.game_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves"
  ON public.game_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves"
  ON public.game_saves FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON public.game_saves FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON public.game_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_game_saves_user_id ON public.game_saves(user_id);
CREATE INDEX idx_game_saves_active ON public.game_saves(is_active) WHERE is_active = true;

-- Create save_finances table
CREATE TABLE public.save_finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 0,
  transfer_budget BIGINT NOT NULL DEFAULT 0,
  wage_budget BIGINT NOT NULL DEFAULT 0,
  total_revenue BIGINT NOT NULL DEFAULT 0,
  total_expenses BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(save_id)
);

ALTER TABLE public.save_finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view finances for their own saves"
  ON public.save_finances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_finances.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage finances for their own saves"
  ON public.save_finances FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_finances.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_save_finances_updated_at
  BEFORE UPDATE ON public.save_finances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_save_finances_save_id ON public.save_finances(save_id);

-- Create save_seasons table
CREATE TABLE public.save_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  season_year INTEGER NOT NULL,
  current_matchday INTEGER NOT NULL DEFAULT 1,
  current_game_week INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.save_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seasons for their own saves"
  ON public.save_seasons FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_seasons.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage seasons for their own saves"
  ON public.save_seasons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_seasons.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_save_seasons_updated_at
  BEFORE UPDATE ON public.save_seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_save_seasons_save_id ON public.save_seasons(save_id);
CREATE INDEX idx_save_seasons_current ON public.save_seasons(is_current) WHERE is_current = true;

-- Create save_standings table
CREATE TABLE public.save_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.save_seasons(id) ON DELETE CASCADE,
  league_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  form JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(season_id, league_id, team_id)
);

ALTER TABLE public.save_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view standings for their own saves"
  ON public.save_standings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.save_seasons
    JOIN public.game_saves ON game_saves.id = save_seasons.save_id
    WHERE save_seasons.id = save_standings.season_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage standings for their own saves"
  ON public.save_standings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.save_seasons
    JOIN public.game_saves ON game_saves.id = save_seasons.save_id
    WHERE save_seasons.id = save_standings.season_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_save_standings_updated_at
  BEFORE UPDATE ON public.save_standings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_save_standings_season_league ON public.save_standings(season_id, league_id);
CREATE INDEX idx_save_standings_position ON public.save_standings(season_id, league_id, position);

-- Create save_matches table
CREATE TABLE public.save_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.save_seasons(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  competition TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  home_team_name TEXT NOT NULL,
  away_team_name TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  match_data JSONB,
  tactical_setup JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.save_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches for their own saves"
  ON public.save_matches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.save_seasons
    JOIN public.game_saves ON game_saves.id = save_seasons.save_id
    WHERE save_seasons.id = save_matches.season_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage matches for their own saves"
  ON public.save_matches FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.save_seasons
    JOIN public.game_saves ON game_saves.id = save_seasons.save_id
    WHERE save_seasons.id = save_matches.season_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_save_matches_updated_at
  BEFORE UPDATE ON public.save_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_save_matches_season_id ON public.save_matches(season_id);
CREATE INDEX idx_save_matches_date ON public.save_matches(match_date);
CREATE INDEX idx_save_matches_status ON public.save_matches(status);

-- Create save_players table
CREATE TABLE public.save_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  form INTEGER NOT NULL DEFAULT 7,
  fitness INTEGER NOT NULL DEFAULT 100,
  morale INTEGER NOT NULL DEFAULT 7,
  appearances INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  yellow_cards INTEGER NOT NULL DEFAULT 0,
  red_cards INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(save_id, player_id)
);

ALTER TABLE public.save_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view players for their own saves"
  ON public.save_players FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_players.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage players for their own saves"
  ON public.save_players FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = save_players.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_save_players_updated_at
  BEFORE UPDATE ON public.save_players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_save_players_save_id ON public.save_players(save_id);
CREATE INDEX idx_save_players_team_id ON public.save_players(save_id, team_id);

-- Create manager_performance table
CREATE TABLE public.manager_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL DEFAULT 50,
  matches_managed INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  trophies_won INTEGER NOT NULL DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  tenure_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(save_id)
);

ALTER TABLE public.manager_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own manager performance"
  ON public.manager_performance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = manager_performance.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own manager performance"
  ON public.manager_performance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.game_saves
    WHERE game_saves.id = manager_performance.save_id
    AND game_saves.user_id = auth.uid()
  ));

CREATE TRIGGER update_manager_performance_updated_at
  BEFORE UPDATE ON public.manager_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_manager_performance_save_id ON public.manager_performance(save_id);