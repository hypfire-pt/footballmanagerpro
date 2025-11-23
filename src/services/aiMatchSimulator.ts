import { ProbabilisticMatchEngine } from "./probabilisticMatchEngine";
import { supabase } from "@/integrations/supabase/client";
import { TeamLineup } from "@/types/match";

/**
 * Auto-simulates AI vs AI matches when the date advances
 */
export class AIMatchSimulator {
  /**
   * Simulate all AI matches up to the current date
   */
  static async simulateAIMatches(
    seasonId: string,
    saveId: string,
    currentDate: string,
    userTeamId: string
  ): Promise<number> {
    try {
      // Get current season data
      const { data: season, error: seasonError } = await supabase
        .from('save_seasons')
        .select('fixtures_state')
        .eq('id', seasonId)
        .single();

      if (seasonError) throw seasonError;

      const fixtures = (season.fixtures_state as any[]) || [];
      
      // Find AI matches that should be played (not involving user's team, scheduled, and date <= current date)
      const aiMatchesToSimulate = fixtures.filter((fixture: any) => 
        fixture.status === 'scheduled' &&
        fixture.date <= currentDate &&
        fixture.homeTeamId !== userTeamId &&
        fixture.awayTeamId !== userTeamId
      );

      console.log(`Found ${aiMatchesToSimulate.length} AI matches to simulate`);

      let simulatedCount = 0;

      for (const fixture of aiMatchesToSimulate) {
        try {
          await this.simulateSingleMatch(fixture, seasonId, saveId);
          simulatedCount++;
        } catch (error) {
          console.error(`Error simulating match ${fixture.id}:`, error);
        }
      }

      return simulatedCount;
    } catch (error) {
      console.error('Error in simulateAIMatches:', error);
      return 0;
    }
  }

  /**
   * Simulate a single match between two AI teams
   */
  private static async simulateSingleMatch(
    fixture: any,
    seasonId: string,
    saveId: string
  ): Promise<void> {
    // Fetch team players
    const { data: homePlayers } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', fixture.homeTeamId)
      .limit(11);

    const { data: awayPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', fixture.awayTeamId)
      .limit(11);

    if (!homePlayers || !awayPlayers) return;

    // Create basic lineups (simplified for AI matches)
    const homeLineup: TeamLineup = {
      formation: '4-4-2',
      tactics: {
        mentality: 'balanced',
        tempo: 'standard',
        width: 'standard',
        pressing: 'medium'
      },
      players: homePlayers.slice(0, 11).map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        overall: p.overall,
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        defending: p.defending,
        physical: p.physical,
        fitness: 100,
        morale: 7
      }))
    };

    const awayLineup: TeamLineup = {
      formation: '4-4-2',
      tactics: {
        mentality: 'balanced',
        tempo: 'standard',
        width: 'standard',
        pressing: 'medium'
      },
      players: awayPlayers.slice(0, 11).map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        overall: p.overall,
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        defending: p.defending,
        physical: p.physical,
        fitness: 100,
        morale: 7
      }))
    };

    // Run simulation
    const engine = new ProbabilisticMatchEngine(homeLineup, awayLineup, 50000, 75, false);
    const result = engine.simulate();

    // Update match in database
    await supabase
      .from('save_matches')
      .update({
        status: 'finished',
        home_score: result.homeScore,
        away_score: result.awayScore,
        match_data: result as any
      })
      .eq('id', fixture.id);

    // Update fixtures_state
    const { data: season } = await supabase
      .from('save_seasons')
      .select('fixtures_state')
      .eq('id', seasonId)
      .single();

    if (season) {
      const fixtures = (season.fixtures_state as any[]) || [];
      const updatedFixtures = fixtures.map((f: any) => {
        if (f.id === fixture.id) {
          return {
            ...f,
            status: 'finished',
            homeScore: result.homeScore,
            awayScore: result.awayScore
          };
        }
        return f;
      });

      await supabase
        .from('save_seasons')
        .update({ fixtures_state: updatedFixtures })
        .eq('id', seasonId);
    }

    // Update player stats
    await this.updatePlayerStats(result, saveId);

    console.log(`Simulated: ${fixture.homeTeam} ${result.homeScore}-${result.awayScore} ${fixture.awayTeam}`);
  }

  private static async updatePlayerStats(result: any, saveId: string): Promise<void> {
    // Extract player stats from match result - use playerPerformance data
    const homePerformance = result.playerPerformance?.home || [];
    const awayPerformance = result.playerPerformance?.away || [];
    const allPerformance = [...homePerformance, ...awayPerformance];
    
    for (const performance of allPerformance) {
      const goals = result.events.filter((e: any) => 
        e.type === 'goal' && e.player === performance.name
      ).length;

      const assists = result.events.filter((e: any) => 
        e.type === 'goal' && e.additionalInfo?.includes(performance.name)
      ).length;

      if (goals > 0 || assists > 0 || performance.rating > 0) {
        const { data: existingPlayer } = await supabase
          .from('save_players')
          .select('*')
          .eq('save_id', saveId)
          .eq('player_id', performance.playerId)
          .maybeSingle();

        if (existingPlayer) {
          await supabase
            .from('save_players')
            .update({
              goals: existingPlayer.goals + goals,
              assists: existingPlayer.assists + assists,
              appearances: existingPlayer.appearances + 1,
              average_rating: existingPlayer.average_rating 
                ? ((existingPlayer.average_rating * existingPlayer.appearances) + performance.rating) / (existingPlayer.appearances + 1)
                : performance.rating
            })
            .eq('id', existingPlayer.id);
        }
      }
    }
  }
}
