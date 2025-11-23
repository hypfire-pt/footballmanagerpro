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
   */
  static generateSeasonFixtures(
    teams: Team[],
    seasonStartDate: Date,
    competition: string = "League"
  ): ScheduledFixture[] {
    const fixtures: ScheduledFixture[] = [];
    const teamCount = teams.length;
    const rounds = teamCount - 1; // Each team plays every other team once
    const matchesPerRound = teamCount / 2;

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
      for (let i = 0; i < roundMatches.length; i += 2) {
        const homeIdx = roundMatches[i];
        const awayIdx = roundMatches[i + 1];
        
        fixtures.push({
          id: `match-${currentMatchday}-${i/2}`,
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
      
      currentMatchday++;
    });

    // Second half of season (reverse fixtures - return matches)
    schedule.forEach((roundMatches, roundIndex) => {
      const matchDate = new Date(currentDate);
      matchDate.setDate(matchDate.getDate() + ((rounds + roundIndex) * 7));
      const dateString = matchDate.toISOString().split('T')[0];

      // Create return matches (home/away swapped) all on the same date
      for (let i = 0; i < roundMatches.length; i += 2) {
        const homeIdx = roundMatches[i];
        const awayIdx = roundMatches[i + 1];
        
        // Swap home and away for return fixture
        fixtures.push({
          id: `match-${currentMatchday}-${i/2}`,
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
      
      currentMatchday++;
    });

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
}
