import { supabase } from "@/integrations/supabase/client";

export interface AIMatchSimulationRequest {
  homeTeam: {
    name: string;
    players: any[];
    tactics: any;
  };
  awayTeam: {
    name: string;
    players: any[];
    tactics: any;
  };
  competition: string;
  matchday: number;
}

export interface AIMatchSimulationResult {
  success: boolean;
  result?: {
    homeScore: number;
    awayScore: number;
    events: Array<{
      minute: number;
      type: string;
      team: 'home' | 'away';
      player: string;
      description: string;
    }>;
    stats: {
      possession: { home: number; away: number };
      shots: { home: number; away: number };
      shotsOnTarget: { home: number; away: number };
      corners: { home: number; away: number };
      fouls: { home: number; away: number };
      passes: { home: number; away: number };
      passAccuracy: { home: number; away: number };
    };
    narrative: string;
  };
  error?: string;
  homeTeam?: string;
  awayTeam?: string;
}

export class AIMatchSimulatorService {
  /**
   * Simulate a match using AI
   */
  static async simulateMatch(
    matchRequest: AIMatchSimulationRequest
  ): Promise<AIMatchSimulationResult> {
    try {
      console.log('[AI Match Simulator] Requesting AI simulation...');
      
      const { data, error } = await supabase.functions.invoke('ai-match-simulator', {
        body: matchRequest
      });

      if (error) {
        console.error('[AI Match Simulator] Error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'AI simulation failed');
      }

      console.log('[AI Match Simulator] Simulation complete:', data.result.homeScore, '-', data.result.awayScore);
      
      return data as AIMatchSimulationResult;
    } catch (error) {
      console.error('[AI Match Simulator] Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Batch simulate multiple matches using AI
   */
  static async simulateMatches(
    matches: AIMatchSimulationRequest[]
  ): Promise<AIMatchSimulationResult[]> {
    console.log(`[AI Match Simulator] Batch simulating ${matches.length} matches`);
    
    // Simulate matches sequentially to avoid rate limits
    const results: AIMatchSimulationResult[] = [];
    
    for (const match of matches) {
      const result = await this.simulateMatch(match);
      results.push(result);
      
      // Add small delay between requests to respect rate limits
      if (matches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
}
