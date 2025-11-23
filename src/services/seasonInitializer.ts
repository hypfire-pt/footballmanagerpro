import { supabase } from "@/integrations/supabase/client";
import { generateLeagueFixtures } from "./fixtureGenerator";

export interface InitializeSeasonParams {
  saveId: string;
  userId: string;
  teamId: string;
  teamName: string;
  leagueId: string;
}

export class SeasonInitializer {
  
  /**
   * Initialize a complete season with fixtures, standings, and player instances
   */
  static async initializeSeason(params: InitializeSeasonParams) {
    const { saveId, userId, teamId, teamName, leagueId } = params;
    
    console.log('Initializing season for save:', saveId);
    
    try {
      // 1. Get all teams in the league
      const { data: leagueTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId);
      
      if (teamsError) throw teamsError;
      if (!leagueTeams || leagueTeams.length === 0) {
        throw new Error(`No teams found for league ${leagueId}`);
      }
      
      console.log(`Found ${leagueTeams.length} teams in league`);
      
      // 2. Generate fixtures for the season
      const currentYear = new Date().getFullYear();
      const seasonStartDate = new Date(currentYear, 7, 15);
      const fixtures = generateLeagueFixtures(
        leagueTeams.map(t => ({...t, id: t.id, name: t.name, leagueId: t.league_id} as any)), 
        seasonStartDate, 
        leagueId, 
        leagueId
      );
      console.log(`Generated ${fixtures.length} fixtures`);
      
      // 3. Initialize standings
      const standings = leagueTeams.map((team, index) => ({
        team_id: team.id,
        team_name: team.name,
        position: index + 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
        form: []
      }));
      
      // 4. Create season record
      const currentYear = new Date().getFullYear();
      const seasonStartDate = new Date(currentYear, 7, 15); // August 15
      
      const { data: season, error: seasonError } = await supabase
        .from('save_seasons')
        .insert({
          save_id: saveId,
          season_year: currentYear,
          current_matchday: 1,
          current_game_week: 1,
          season_current_date: seasonStartDate.toISOString().split('T')[0],
          is_current: true,
          standings_state: standings,
          fixtures_state: fixtures
        })
        .select()
        .single();
      
      if (seasonError) throw seasonError;
      console.log('Season record created:', season.id);
      
      // 5. Clone all league players to save_players
      const { data: allPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('team_id', leagueTeams.map(t => t.id));
      
      if (playersError) throw playersError;
      console.log(`Cloning ${allPlayers?.length || 0} players to save context`);
      
      if (allPlayers && allPlayers.length > 0) {
        const savePlayers = allPlayers.map(player => ({
          save_id: saveId,
          player_id: player.id,
          team_id: player.team_id,
          fitness: 100,
          morale: 75,
          form: 70,
          goals: 0,
          assists: 0,
          appearances: 0,
          yellow_cards: 0,
          red_cards: 0,
          average_rating: null
        }));
        
        // Insert in batches
        const batchSize = 100;
        for (let i = 0; i < savePlayers.length; i += batchSize) {
          const batch = savePlayers.slice(i, i + batchSize);
          const { error: savePlayersError } = await supabase
            .from('save_players')
            .insert(batch);
          
          if (savePlayersError) throw savePlayersError;
          console.log(`Inserted player batch ${Math.floor(i / batchSize) + 1}`);
        }
      }
      
      // 6. Create initial match records for fixtures
      const matchRecords = fixtures.slice(0, 10).map(fixture => ({ // First 10 matches
        season_id: season.id,
        home_team_id: fixture.homeTeam,
        home_team_name: fixture.homeTeamName,
        away_team_id: fixture.awayTeam,
        away_team_name: fixture.awayTeamName,
        match_date: fixture.date,
        competition: leagueId,
        status: 'scheduled'
      }));
      
      const { error: matchesError } = await supabase
        .from('save_matches')
        .insert(matchRecords);
      
      if (matchesError) throw matchesError;
      console.log('Initial match records created');
      
      // 7. Create manager performance record
      const { error: perfError } = await supabase
        .from('manager_performance')
        .insert({
          save_id: saveId,
          matches_managed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          overall_rating: 50,
          tenure_days: 0,
          trophies_won: 0,
          achievements: []
        });
      
      if (perfError) throw perfError;
      
      // 8. Create finance record
      const managerTeam = leagueTeams.find(t => t.id === teamId);
      const { error: financeError } = await supabase
        .from('save_finances')
        .insert({
          save_id: saveId,
          balance: managerTeam?.balance || 100000000,
          transfer_budget: Math.floor((managerTeam?.balance || 100000000) * 0.3),
          wage_budget: Math.floor((managerTeam?.balance || 100000000) * 0.05),
          total_revenue: 0,
          total_expenses: 0
        });
      
      if (financeError) throw financeError;
      
      // 9. Update game save with next action
      const firstMatch = fixtures.find(f => 
        f.homeTeam === teamId || f.awayTeam === teamId
      );
      
      const { error: saveUpdateError } = await supabase
        .from('game_saves')
        .update({
          next_action: firstMatch ? 'play_match' : 'view_squad'
        })
        .eq('id', saveId);
      
      if (saveUpdateError) throw saveUpdateError;
      
      console.log('✓ Season initialization complete!');
      
      return {
        success: true,
        seasonId: season.id,
        fixtureCount: fixtures.length,
        playerCount: allPlayers?.length || 0,
        nextMatch: firstMatch
      };
      
    } catch (error) {
      console.error('Season initialization error:', error);
      throw error;
    }
  }
  
  /**
   * Get the next upcoming match for a team
   */
  static async getNextMatch(saveId: string, teamId: string) {
    try {
      const { data: season, error: seasonError } = await supabase
        .from('save_seasons')
        .select('fixtures_state')
        .eq('save_id', saveId)
        .eq('is_current', true)
        .single();
      
      if (seasonError) throw seasonError;
      
      const fixtures = season.fixtures_state as any[];
      const nextMatch = fixtures.find(f => 
        (f.homeTeam === teamId || f.awayTeam === teamId) && 
        f.status === 'scheduled'
      );
      
      return nextMatch;
    } catch (error) {
      console.error('Error fetching next match:', error);
      return null;
    }
  }
}