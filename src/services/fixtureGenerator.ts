import { addDays, addWeeks } from "date-fns";
import { Match } from "@/types/game";
import { Team } from "@/data/teams";

export interface Fixture extends Omit<Match, 'id'> {
  id: string;
  matchweek: number;
  importance: 'low' | 'medium' | 'high';
}

// Round-robin algorithm for generating fixtures
function generateRoundRobin(teams: Team[]): { home: Team; away: Team }[][] {
  const n = teams.length;
  const rounds: { home: Team; away: Team }[][] = [];
  
  if (n % 2 !== 0) {
    // Add a "bye" team for odd number of teams
    teams = [...teams];
  }
  
  const numRounds = n - 1;
  const matchesPerRound = n / 2;
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches: { home: Team; away: Team }[] = [];
    
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (n - 1);
      const away = (n - 1 - match + round) % (n - 1);
      
      if (match === 0) {
        roundMatches.push({
          home: teams[away],
          away: teams[n - 1]
        });
      } else {
        roundMatches.push({
          home: teams[home],
          away: teams[away]
        });
      }
    }
    
    rounds.push(roundMatches);
  }
  
  return rounds;
}

export function generateLeagueFixtures(
  teams: Team[],
  seasonStartDate: Date,
  leagueId: string,
  leagueName: string
): Fixture[] {
  const fixtures: Fixture[] = [];
  
  // Generate home and away fixtures
  const firstHalf = generateRoundRobin(teams);
  const secondHalf = firstHalf.map(round =>
    round.map(match => ({ home: match.away, away: match.home }))
  );
  
  const allRounds = [...firstHalf, ...secondHalf];
  
  // Schedule matches (one matchweek per week, typically on weekends)
  allRounds.forEach((round, matchweek) => {
    const matchDate = addWeeks(seasonStartDate, matchweek);
    
    round.forEach((match, idx) => {
      // Check if this is a derby/important match
      const isDerby = match.home.country === match.away.country && 
                      (match.home.reputation > 85 || match.away.reputation > 85);
      
      const importance: 'low' | 'medium' | 'high' = 
        isDerby ? 'high' : 
        (match.home.reputation > 90 || match.away.reputation > 90) ? 'medium' : 
        'low';
      
      fixtures.push({
        id: `${leagueId}-${matchweek + 1}-${idx}`,
        homeTeam: match.home.name,
        awayTeam: match.away.name,
        date: matchDate.toISOString().split('T')[0],
        competition: leagueName,
        status: 'scheduled',
        matchweek: matchweek + 1,
        importance
      });
    });
  });
  
  return fixtures;
}

export function generateCupFixtures(
  teams: Team[],
  seasonStartDate: Date,
  competitionName: string,
  competitionId: string
): Fixture[] {
  const fixtures: Fixture[] = [];
  
  // Simple knockout format
  // Group stage (if Champions League/Europa League style)
  if (competitionId === 'ucl' || competitionId === 'uel') {
    // Generate 8 groups of 4 teams each (simplified)
    const groupSize = 4;
    const numGroups = Math.min(8, Math.floor(teams.length / groupSize));
    
    for (let group = 0; group < numGroups; group++) {
      const groupTeams = teams.slice(group * groupSize, (group + 1) * groupSize);
      
      // Each team plays each other twice (home and away)
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          // Home match
          fixtures.push({
            id: `${competitionId}-group-${group}-${i}-${j}`,
            homeTeam: groupTeams[i].name,
            awayTeam: groupTeams[j].name,
            date: addWeeks(seasonStartDate, group * 2).toISOString().split('T')[0],
            competition: competitionName,
            status: 'scheduled',
            matchweek: group + 1,
            importance: 'high'
          });
          
          // Away match
          fixtures.push({
            id: `${competitionId}-group-${group}-${j}-${i}`,
            homeTeam: groupTeams[j].name,
            awayTeam: groupTeams[i].name,
            date: addWeeks(seasonStartDate, group * 2 + 1).toISOString().split('T')[0],
            competition: competitionName,
            status: 'scheduled',
            matchweek: group + 2,
            importance: 'high'
          });
        }
      }
    }
  }
  
  return fixtures;
}

export function getUpcomingFixtures(
  fixtures: Fixture[],
  currentDate: Date,
  count: number = 10
): Fixture[] {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  
  return fixtures
    .filter(f => f.date >= currentDateStr && f.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getFixturesForDate(
  fixtures: Fixture[],
  date: Date
): Fixture[] {
  const dateStr = date.toISOString().split('T')[0];
  return fixtures.filter(f => f.date === dateStr);
}

export function getFixturesForMonth(
  fixtures: Fixture[],
  year: number,
  month: number
): Fixture[] {
  return fixtures.filter(f => {
    const fixtureDate = new Date(f.date);
    return fixtureDate.getFullYear() === year && fixtureDate.getMonth() === month;
  });
}
