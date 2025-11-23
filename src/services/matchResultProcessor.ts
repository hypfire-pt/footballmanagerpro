import { LeagueStanding, Match } from "@/types/game";
import { SimulationResult } from "@/types/match";

export interface ProcessedMatchResult {
  updatedStandings: LeagueStanding[];
  updatedFixtures: Match[];
  playerStats: {
    playerId: string;
    goals: number;
    assists: number;
    appearances: number;
    rating: number;
  }[];
}

export class MatchResultProcessor {
  /**
   * Process match result and update standings, fixtures, and player stats
   */
  static processMatchResult(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    result: SimulationResult,
    currentStandings: LeagueStanding[],
    currentFixtures: Match[]
  ): ProcessedMatchResult {
    // Update fixtures
    const updatedFixtures = currentFixtures.map(fixture => {
      if (fixture.id === matchId) {
        return {
          ...fixture,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: 'finished' as const
        };
      }
      return fixture;
    });

    // Update standings
    const updatedStandings = this.updateStandings(
      currentStandings,
      homeTeam,
      awayTeam,
      result.homeScore,
      result.awayScore
    );

    // Extract player stats
    const playerStats = this.extractPlayerStats(result);

    return {
      updatedStandings,
      updatedFixtures,
      playerStats
    };
  }

  /**
   * Update league standings based on match result
   */
  private static updateStandings(
    standings: LeagueStanding[],
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number
  ): LeagueStanding[] {
    const updated = standings.map(team => {
      if (team.club === homeTeam) {
        return this.updateTeamStats(team, homeScore, awayScore, true);
      } else if (team.club === awayTeam) {
        return this.updateTeamStats(team, awayScore, homeScore, false);
      }
      return team;
    });

    // Recalculate positions
    return this.recalculatePositions(updated);
  }

  /**
   * Update individual team statistics
   */
  private static updateTeamStats(
    team: LeagueStanding,
    goalsFor: number,
    goalsAgainst: number,
    isHome: boolean
  ): LeagueStanding {
    const result = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';
    const points = result === 'W' ? 3 : result === 'D' ? 1 : 0;

    // Update form (keep last 5 results)
    const newForm = [result, ...team.form.slice(0, 4)];

    return {
      ...team,
      played: team.played + 1,
      won: team.won + (result === 'W' ? 1 : 0),
      drawn: team.drawn + (result === 'D' ? 1 : 0),
      lost: team.lost + (result === 'L' ? 1 : 0),
      goalsFor: team.goalsFor + goalsFor,
      goalsAgainst: team.goalsAgainst + goalsAgainst,
      goalDifference: team.goalDifference + (goalsFor - goalsAgainst),
      points: team.points + points,
      form: newForm
    };
  }

  /**
   * Recalculate league positions after standings update
   */
  private static recalculatePositions(standings: LeagueStanding[]): LeagueStanding[] {
    const sorted = [...standings].sort((a, b) => {
      // Sort by points (descending)
      if (b.points !== a.points) return b.points - a.points;
      // Then by goal difference (descending)
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      // Then by goals for (descending)
      return b.goalsFor - a.goalsFor;
    });

    return sorted.map((team, index) => ({
      ...team,
      position: index + 1
    }));
  }

  /**
   * Extract player statistics from match result
   */
  static extractPlayerStats(result: SimulationResult) {
    const stats: {
      playerId: string;
      goals: number;
      assists: number;
      appearances: number;
      rating: number;
    }[] = [];

    // Count goals and assists from events
    const goalScorers = new Map<string, number>();
    const assistProviders = new Map<string, number>();

    result.events.forEach(event => {
      if (event.type === 'goal' && event.player) {
        goalScorers.set(event.player, (goalScorers.get(event.player) || 0) + 1);
        // Extract assist from description if present
        if (event.description.includes('assisted by')) {
          const assistMatch = event.description.match(/assisted by ([^)]+)/);
          if (assistMatch) {
            assistProviders.set(assistMatch[1], (assistProviders.get(assistMatch[1]) || 0) + 1);
          }
        }
      }
    });

    // Combine home and away player ratings
    const allRatings = {
      ...result.playerRatings.home,
      ...result.playerRatings.away
    };

    // Create stats for all players who participated
    Object.entries(allRatings).forEach(([playerId, rating]) => {
      stats.push({
        playerId,
        goals: goalScorers.get(playerId) || 0,
        assists: assistProviders.get(playerId) || 0,
        appearances: 1,
        rating
      });
    });

    return stats;
  }

  /**
   * Save processed results to localStorage
   */
  static saveToLocalStorage(
    standings: LeagueStanding[],
    fixtures: Match[],
    playerStats: any[]
  ) {
    localStorage.setItem('leagueStandings', JSON.stringify(standings));
    localStorage.setItem('fixtures', JSON.stringify(fixtures));
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
  }

  /**
   * Load data from localStorage
   */
  static loadFromLocalStorage(): {
    standings: LeagueStanding[] | null;
    fixtures: Match[] | null;
    playerStats: any[] | null;
  } {
    const standingsData = localStorage.getItem('leagueStandings');
    const fixturesData = localStorage.getItem('fixtures');
    const playerStatsData = localStorage.getItem('playerStats');

    return {
      standings: standingsData ? JSON.parse(standingsData) : null,
      fixtures: fixturesData ? JSON.parse(fixturesData) : null,
      playerStats: playerStatsData ? JSON.parse(playerStatsData) : null
    };
  }
}
