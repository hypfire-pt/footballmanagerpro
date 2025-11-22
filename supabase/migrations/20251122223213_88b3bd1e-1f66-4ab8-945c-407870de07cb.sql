-- Add season state tracking to save_seasons table
ALTER TABLE save_seasons
ADD COLUMN season_current_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN fixtures_state JSONB DEFAULT '[]'::jsonb,
ADD COLUMN standings_state JSONB DEFAULT '[]'::jsonb;

-- Add next action tracking to game_saves
ALTER TABLE game_saves
ADD COLUMN next_action TEXT DEFAULT 'view_squad',
ADD COLUMN last_match_id UUID,
ADD COLUMN pending_tasks JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN game_saves.next_action IS 'Suggested next action for the user: view_squad, next_match, review_tactics, check_inbox, etc.';
COMMENT ON COLUMN game_saves.pending_tasks IS 'List of pending manager tasks like contract renewals, injury updates, etc.';