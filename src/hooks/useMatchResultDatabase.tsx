import { supabase } from "@/integrations/supabase/client";
import { SimulationResult } from "@/types/match";

export function useMatchResultDatabase() {
  /**
   * Save match result to database and update all related statistics
   */
  const saveMatchResult = async (
    matchId: string,
    seasonId: string,
    homeTeamId: string,
    awayTeamId: string,
    result: SimulationResult
  ) => {
    try {
      // 1. Update match record
      const { error: matchError } = await supabase
        .from('save_matches')
        .update({
          home_score: result.homeScore,
          away_score: result.awayScore,
          status: 'finished',
          match_data: result as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // 2. Fetch current standings
      const { data: seasonData, error: seasonError } = await supabase
        .from('save_seasons')
        .select('standings_state')
        .eq('id', seasonId)
        .single();

      if (seasonError) throw seasonError;

      const standings = seasonData.standings_state as any[];

      // 3. Update standings
      const updatedStandings = updateStandingsAfterMatch(
        standings,
        homeTeamId,
        awayTeamId,
        result.homeScore,
        result.awayScore
      );

      // 4. Save updated standings back to season
      const { error: updateError } = await supabase
        .from('save_seasons')
        .update({
          standings_state: updatedStandings,
          updated_at: new Date().toISOString()
        })
        .eq('id', seasonId);

      if (updateError) throw updateError;

      // 5. Update player statistics
      await updatePlayerStatistics(result, seasonId);

      return { success: true, standings: updatedStandings };
    } catch (error) {
      console.error('Error saving match result:', error);
      return { success: false, error };
    }
  };

  /**
   * Update standings based on match result
   */
  const updateStandingsAfterMatch = (
    standings: any[],
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number
  ) => {
    const updated = standings.map(team => {
      if (team.team_id === homeTeamId) {
        return updateTeamStats(team, homeScore, awayScore);
      } else if (team.team_id === awayTeamId) {
        return updateTeamStats(team, awayScore, homeScore);
      }
      return team;
    });

    // Recalculate positions
    return recalculatePositions(updated);
  };

  /**
   * Update individual team statistics
   */
  const updateTeamStats = (
    team: any,
    goalsFor: number,
    goalsAgainst: number
  ) => {
    const result = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';
    const points = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    const newForm = [result, ...(team.form || []).slice(0, 4)];

    return {
      ...team,
      played: (team.played || 0) + 1,
      won: (team.won || 0) + (result === 'W' ? 1 : 0),
      drawn: (team.drawn || 0) + (result === 'D' ? 1 : 0),
      lost: (team.lost || 0) + (result === 'L' ? 1 : 0),
      goals_for: (team.goals_for || 0) + goalsFor,
      goals_against: (team.goals_against || 0) + goalsAgainst,
      goal_difference: ((team.goals_for || 0) + goalsFor) - ((team.goals_against || 0) + goalsAgainst),
      points: (team.points || 0) + points,
      form: newForm
    };
  };

  /**
   * Recalculate league positions
   */
  const recalculatePositions = (standings: any[]) => {
    const sorted = [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

    return sorted.map((team, index) => ({
      ...team,
      position: index + 1
    }));
  };

  /**
   * Update player statistics from match result
   */
  const updatePlayerStatistics = async (result: SimulationResult, seasonId: string) => {
    try {
      // Get save_id from season
      const { data: seasonData } = await supabase
        .from('save_seasons')
        .select('save_id')
        .eq('id', seasonId)
        .single();

      if (!seasonData) return;

      // Count goals and assists from events
      const playerStats = new Map<string, { goals: number; assists: number }>();

      result.events.forEach(event => {
        if (event.type === 'goal' && event.player) {
          const current = playerStats.get(event.player) || { goals: 0, assists: 0 };
          current.goals += 1;
          playerStats.set(event.player, current);

          // Extract assist
          if (event.description.includes('assisted by')) {
            const assistMatch = event.description.match(/assisted by ([^)]+)/);
            if (assistMatch) {
              const assister = assistMatch[1];
              const assistCurrent = playerStats.get(assister) || { goals: 0, assists: 0 };
              assistCurrent.assists += 1;
              playerStats.set(assister, assistCurrent);
            }
          }
        }
      });

      // Combine all player ratings
      const allRatings = { ...result.playerRatings.home, ...result.playerRatings.away };

      // Update each player's statistics
      for (const [playerName, rating] of Object.entries(allRatings)) {
        const stats = playerStats.get(playerName) || { goals: 0, assists: 0 };

        // Find player by name
        const { data: players } = await supabase
          .from('players')
          .select('id')
          .ilike('name', playerName)
          .limit(1);

        if (players && players.length > 0) {
          const playerId = players[0].id;

          // Get existing save_player record
          const { data: savePlayer } = await supabase
            .from('save_players')
            .select('*')
            .eq('save_id', seasonData.save_id)
            .eq('player_id', playerId)
            .maybeSingle();

          if (savePlayer) {
            // Update existing record
            await supabase
              .from('save_players')
              .update({
                appearances: (savePlayer.appearances || 0) + 1,
                goals: (savePlayer.goals || 0) + stats.goals,
                assists: (savePlayer.assists || 0) + stats.assists,
                average_rating: savePlayer.average_rating
                  ? ((savePlayer.average_rating * savePlayer.appearances) + (rating as number)) / (savePlayer.appearances + 1)
                  : rating,
                updated_at: new Date().toISOString()
              })
              .eq('id', savePlayer.id);
          }
        }
      }
    } catch (error) {
      console.error('Error updating player statistics:', error);
    }
  };

  return {
    saveMatchResult
  };
}
