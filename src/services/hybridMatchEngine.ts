import { TeamLineup, SimulationResult } from "@/types/match";
import { ProbabilisticMatchEngine } from "./probabilisticMatchEngine";
import { supabase } from "@/integrations/supabase/client";

export interface HybridMatchResult extends SimulationResult {
  aiNarrative?: string;
}

/**
 * Hybrid Match Engine
 * Combines probabilistic mathematics for accurate simulation
 * with AI-generated narrative for rich storytelling
 */
export class HybridMatchEngine {
  /**
   * Simulate match using probabilistic engine + AI narrative
   */
  static async simulate(
    homeLineup: TeamLineup,
    awayLineup: TeamLineup,
    homeTeamName: string,
    awayTeamName: string,
    stadiumCapacity: number = 60000,
    homeReputation: number = 80,
    isDerby: boolean = false
  ): Promise<HybridMatchResult> {
    console.log('[Hybrid Engine] Starting simulation - Math + AI');

    // Step 1: Run probabilistic engine for accurate match simulation
    const engine = new ProbabilisticMatchEngine(
      homeLineup,
      awayLineup,
      stadiumCapacity,
      homeReputation,
      isDerby
    );

    const mathResult = engine.simulate();
    console.log('[Hybrid Engine] Math simulation complete:', mathResult.homeScore, '-', mathResult.awayScore);

    // Step 2: Generate AI narrative based on match result
    try {
      const narrative = await this.generateAINarrative(
        homeTeamName,
        awayTeamName,
        mathResult,
        homeLineup.tactics,
        awayLineup.tactics
      );

      return {
        ...mathResult,
        aiNarrative: narrative
      };
    } catch (error) {
      console.warn('[Hybrid Engine] AI narrative generation failed, using math result only:', error);
      return mathResult;
    }
  }

  /**
   * Generate AI commentary narrative based on match events
   */
  private static async generateAINarrative(
    homeTeam: string,
    awayTeam: string,
    result: SimulationResult,
    homeTactics: TeamLineup['tactics'],
    awayTactics: TeamLineup['tactics']
  ): Promise<string> {
    const goals = result.events.filter(e => e.type === 'goal');
    const keyMoments = result.events.filter(e => 
      ['goal', 'red_card', 'yellow_card', 'injury'].includes(e.type)
    );

    const prompt = `You are a professional football commentator. Generate a concise match summary (max 150 words) for:

${homeTeam} ${result.homeScore} - ${result.awayScore} ${awayTeam}

Tactics:
- ${homeTeam}: ${homeTactics.mentality} mentality, ${homeTactics.tempo} tempo, ${homeTactics.pressing} pressing
- ${awayTeam}: ${awayTactics.mentality} mentality, ${awayTactics.tempo} tempo, ${awayTactics.pressing} pressing

Key Events:
${keyMoments.slice(0, 5).map(e => `${e.minute}' - ${e.description}`).join('\n')}

Stats:
- Possession: ${homeTeam} ${Math.round(result.stats.possession.home)}% - ${Math.round(result.stats.possession.away)}% ${awayTeam}
- Shots: ${result.stats.shots.home} - ${result.stats.shots.away}
- Shots on target: ${result.stats.shotsOnTarget.home} - ${result.stats.shotsOnTarget.away}

Write a natural, engaging match summary that mentions the tactical battle and key moments.`;

    try {
      const { data, error } = await supabase.functions.invoke('ai-match-commentary', {
        body: { prompt }
      });

      if (error) throw error;
      return data.commentary || '';
    } catch (error) {
      console.error('[Hybrid Engine] AI commentary error:', error);
      return '';
    }
  }
}
