/**
 * Fixture Scheduler - Ensures all teams play on the same matchday dates
 * Groups matches properly by round number for realistic league scheduling
 */

interface Team {
  id: string;
  name: string;
}

interface ScheduledFixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  matchday: number;
  competition: string;
  status: string;
}

export class FixtureScheduler {
  /**
   * Generate a complete season fixture list with proper matchday grouping
   * All teams play on the same date for each matchday
   * Ensures EVERY team has a match in EVERY matchweek
   */
  static generateSeasonFixtures(
    teams: Team[],
    seasonStartDate: Date,
    competition: string = "League"
  ): ScheduledFixture[] {
    const fixtures: ScheduledFixture[] = [];
    const teamCount = teams.length;
    
    // Validate team count (must be even for round-robin)
    if (teamCount % 2 !== 0) {
      console.error('Team count must be even for proper fixture generation');
      return fixtures;
    }
    
    const rounds = teamCount - 1; // Each team plays every other team once
    const matchesPerRound = teamCount / 2;
    
    console.log(`[FIXTURE SCHEDULER] Generating fixtures for ${teamCount} teams, ${rounds} rounds, ${matchesPerRound} matches per round`);

    // Create rotation schedule (round-robin algorithm)
    const schedule: number[][] = [];
    const teamIndices = Array.from({ length: teamCount }, (_, i) => i);

    for (let round = 0; round < rounds; round++) {
      const roundMatches: number[] = [];
      
      for (let match = 0; match < matchesPerRound; match++) {
        const home = (round + match) % (teamCount - 1);
        const away = (teamCount - 1 - match + round) % (teamCount - 1);
        
        // Last team (index teamCount-1) stays fixed
        if (match === 0) {
          roundMatches.push(teamCount - 1, home);
        } else {
          roundMatches.push(home, away);
        }
      }
      
      schedule.push(roundMatches);
    }

    // Generate fixtures with consistent matchday dates
    let currentMatchday = 1;
    const currentDate = new Date(seasonStartDate);
    
    // First half of season (each team plays each other once)
    schedule.forEach((roundMatches, roundIndex) => {
      // Schedule date: every Saturday (adjust by 7 days per matchday)
      const matchDate = new Date(currentDate);
      matchDate.setDate(matchDate.getDate() + (roundIndex * 7));
      const dateString = matchDate.toISOString().split('T')[0];

      // Create matches for this round (all on the same date)
      const matchdayFixtures: ScheduledFixture[] = [];
      for (let i = 0; i < roundMatches.length; i += 2) {
        const homeIdx = roundMatches[i];
        const awayIdx = roundMatches[i + 1];
        
        matchdayFixtures.push({
          id: crypto.randomUUID(),
          homeTeamId: teams[homeIdx].id,
          awayTeamId: teams[awayIdx].id,
          homeTeam: teams[homeIdx].name,
          awayTeam: teams[awayIdx].name,
          date: dateString,
          matchday: currentMatchday,
          competition,
          status: 'scheduled'
        });
      }
      
      // Validate: ensure all teams are included in this matchday
      const teamsInMatchday = new Set<string>();
      matchdayFixtures.forEach(f => {
        teamsInMatchday.add(f.homeTeamId);
        teamsInMatchday.add(f.awayTeamId);
      });
      
      if (teamsInMatchday.size !== teamCount) {
        console.warn(`Matchday ${currentMatchday}: Only ${teamsInMatchday.size}/${teamCount} teams have matches!`);
      }
      
      fixtures.push(...matchdayFixtures);
      console.log(`[FIXTURE SCHEDULER] Matchday ${currentMatchday}: ${matchdayFixtures.length} matches created, ${teamsInMatchday.size} teams involved`);
      currentMatchday++;
    });

    // Second half of season (reverse fixtures - return matches)
    schedule.forEach((roundMatches, roundIndex) => {
      const matchDate = new Date(currentDate);
      matchDate.setDate(matchDate.getDate() + ((rounds + roundIndex) * 7));
      const dateString = matchDate.toISOString().split('T')[0];

      // Create return matches (home/away swapped) all on the same date
      const matchdayFixtures: ScheduledFixture[] = [];
      for (let i = 0; i < roundMatches.length; i += 2) {
        const homeIdx = roundMatches[i];
        const awayIdx = roundMatches[i + 1];
        
        // Swap home and away for return fixture
        matchdayFixtures.push({
          id: crypto.randomUUID(),
          homeTeamId: teams[awayIdx].id,
          awayTeamId: teams[homeIdx].id,
          homeTeam: teams[awayIdx].name,
          awayTeam: teams[homeIdx].name,
          date: dateString,
          matchday: currentMatchday,
          competition,
          status: 'scheduled'
        });
      }
      
      // Validate return fixtures
      const teamsInMatchday = new Set<string>();
      matchdayFixtures.forEach(f => {
        teamsInMatchday.add(f.homeTeamId);
        teamsInMatchday.add(f.awayTeamId);
      });
      
      if (teamsInMatchday.size !== teamCount) {
        console.warn(`Matchday ${currentMatchday}: Only ${teamsInMatchday.size}/${teamCount} teams have matches!`);
      }
      
      fixtures.push(...matchdayFixtures);
      console.log(`[FIXTURE SCHEDULER] Matchday ${currentMatchday}: ${matchdayFixtures.length} matches created, ${teamsInMatchday.size} teams involved`);
      currentMatchday++;
    });

    console.log(`[FIXTURE SCHEDULER] Season complete: ${fixtures.length} total fixtures across ${currentMatchday - 1} matchdays`);
    
    // Final validation
    this.validateSeasonFixtures(fixtures, teams.length, currentMatchday - 1);
    
    return fixtures;
  }

  /**
   * Get all matches for a specific matchday
   */
  static getMatchdayFixtures(
    allFixtures: ScheduledFixture[],
    matchday: number
  ): ScheduledFixture[] {
    return allFixtures.filter(f => f.matchday === matchday);
  }

  /**
   * Check if a matchday is complete (all matches finished)
   */
  static isMatchdayComplete(
    allFixtures: ScheduledFixture[],
    matchday: number
  ): boolean {
    const matchdayFixtures = this.getMatchdayFixtures(allFixtures, matchday);
    return matchdayFixtures.length > 0 && matchdayFixtures.every(f => f.status === 'finished');
  }

  /**
   * Get next incomplete matchday
   */
  static getNextIncompleteMatchday(allFixtures: ScheduledFixture[]): number | null {
    const matchdays = new Set(allFixtures.map(f => f.matchday));
    
    for (const matchday of Array.from(matchdays).sort((a, b) => a - b)) {
      if (!this.isMatchdayComplete(allFixtures, matchday)) {
        return matchday;
      }
    }
    
    return null;
  }

  /**
   * Validate that season fixtures are correctly generated
   * - Every team should have exactly (teamCount - 1) * 2 matches total
   * - Every matchday should have exactly teamCount / 2 matches
   */
  private static validateSeasonFixtures(
    fixtures: ScheduledFixture[],
    teamCount: number,
    totalMatchdays: number
  ): void {
    console.log('[FIXTURE SCHEDULER] Validating season fixtures...');
    
    // Count matches per team
    const teamMatchCounts = new Map<string, number>();
    fixtures.forEach(f => {
      teamMatchCounts.set(f.homeTeamId, (teamMatchCounts.get(f.homeTeamId) || 0) + 1);
      teamMatchCounts.set(f.awayTeamId, (teamMatchCounts.get(f.awayTeamId) || 0) + 1);
    });
    
    const expectedMatchesPerTeam = (teamCount - 1) * 2; // Each team plays every other team home and away
    const expectedMatchesPerMatchday = teamCount / 2;
    
    // Validate each team has correct number of matches
    teamMatchCounts.forEach((count, teamId) => {
      if (count !== expectedMatchesPerTeam) {
        console.error(`Team ${teamId} has ${count} matches, expected ${expectedMatchesPerTeam}`);
      }
    });
    
    // Validate each matchday has correct number of matches
    const matchdayFixtureCounts = new Map<number, number>();
    fixtures.forEach(f => {
      matchdayFixtureCounts.set(f.matchday, (matchdayFixtureCounts.get(f.matchday) || 0) + 1);
    });
    
    matchdayFixtureCounts.forEach((count, matchday) => {
      if (count !== expectedMatchesPerMatchday) {
        console.error(`Matchday ${matchday} has ${count} matches, expected ${expectedMatchesPerMatchday}`);
      }
    });
    
    console.log('[FIXTURE SCHEDULER] Validation complete:', {
      totalFixtures: fixtures.length,
      expectedTotal: expectedMatchesPerTeam * teamCount / 2,
      totalMatchdays,
      teamsTracked: teamMatchCounts.size
    });
  }

  /**
   * Get matchweek status summary
   */
  static getMatchdayStatus(allFixtures: ScheduledFixture[], matchday: number): {
    total: number;
    finished: number;
    scheduled: number;
    isComplete: boolean;
  } {
    const matchdayFixtures = this.getMatchdayFixtures(allFixtures, matchday);
    const finished = matchdayFixtures.filter(f => f.status === 'finished').length;
    const scheduled = matchdayFixtures.filter(f => f.status === 'scheduled').length;
    
    return {
      total: matchdayFixtures.length,
      finished,
      scheduled,
      isComplete: this.isMatchdayComplete(allFixtures, matchday)
    };
  }
}
