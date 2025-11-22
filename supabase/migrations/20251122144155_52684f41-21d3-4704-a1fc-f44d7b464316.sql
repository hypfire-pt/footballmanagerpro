-- Create leagues table (master data)
CREATE TABLE public.leagues (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  tier INTEGER NOT NULL,
  confederation TEXT NOT NULL,
  reputation INTEGER NOT NULL,
  founded INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are viewable by everyone"
  ON public.leagues FOR SELECT
  USING (true);

-- Create teams table (master data)
CREATE TABLE public.teams (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  league_id TEXT NOT NULL REFERENCES public.leagues(id),
  country TEXT NOT NULL,
  stadium TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  reputation INTEGER NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  founded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE INDEX idx_teams_league_id ON public.teams(league_id);
CREATE INDEX idx_teams_reputation ON public.teams(reputation DESC);

-- Create players table (master data)
CREATE TABLE public.players (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  team_id TEXT NOT NULL REFERENCES public.teams(id),
  nationality TEXT NOT NULL,
  age INTEGER NOT NULL,
  date_of_birth DATE NOT NULL,
  position TEXT NOT NULL,
  overall INTEGER NOT NULL,
  potential INTEGER NOT NULL,
  pace INTEGER NOT NULL,
  shooting INTEGER NOT NULL,
  passing INTEGER NOT NULL,
  defending INTEGER NOT NULL,
  physical INTEGER NOT NULL,
  technical INTEGER NOT NULL,
  mental INTEGER NOT NULL,
  market_value BIGINT NOT NULL,
  wage BIGINT NOT NULL,
  contract_expiry DATE NOT NULL,
  preferred_foot TEXT DEFAULT 'Right',
  height INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are viewable by everyone"
  ON public.players FOR SELECT
  USING (true);

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_players_team_id ON public.players(team_id);
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_overall ON public.players(overall DESC);
CREATE INDEX idx_players_nationality ON public.players(nationality);
CREATE INDEX idx_players_name ON public.players(name);

-- Add foreign key to save_players to reference master players table
ALTER TABLE public.save_players
  ADD CONSTRAINT fk_save_players_player_id
  FOREIGN KEY (player_id)
  REFERENCES public.players(id)
  ON DELETE CASCADE;