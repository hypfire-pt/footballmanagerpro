import { Player } from "@/types/game";
import { europeanLeagues } from "./leagues";
import { europeanTeams } from "./teams";
import { generateSquad } from "./playerGenerator";

// Generate all players for all teams
export function generateFullDatabase() {
  const allPlayers: Player[] = [];
  
  // Map nationalities to leagues
  const nationalityMap: Record<string, string> = {
    "England": "England",
    "Spain": "Spain",
    "Germany": "Germany",
    "Italy": "Italy",
    "France": "France",
    "Portugal": "Portugal",
    "Netherlands": "Netherlands",
    "Belgium": "Belgium"
  };
  
  europeanTeams.forEach(team => {
    const primaryNationality = nationalityMap[team.country] || "England";
    const teamSquad = generateSquad(team.id, team.reputation, primaryNationality);
    allPlayers.push(...teamSquad);
  });
  
  return {
    leagues: europeanLeagues,
    teams: europeanTeams,
    players: allPlayers
  };
}

// Export pre-generated database
export const fullDatabase = generateFullDatabase();

// Helper functions to query the database
export function getLeagueTeams(leagueId: string) {
  return fullDatabase.teams.filter(team => team.leagueId === leagueId);
}

export function getTeamPlayers(teamId: string) {
  return fullDatabase.players.filter(player => player.id.startsWith(teamId));
}

export function getPlayersByPosition(teamId: string, position: string) {
  return getTeamPlayers(teamId).filter(player => player.position === position);
}

export function searchPlayers(query: string) {
  const lowerQuery = query.toLowerCase();
  return fullDatabase.players.filter(player => 
    player.name.toLowerCase().includes(lowerQuery) ||
    player.position.toLowerCase().includes(lowerQuery) ||
    player.nationality.toLowerCase().includes(lowerQuery)
  );
}

export function getTopPlayers(count: number = 50) {
  return [...fullDatabase.players]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, count);
}

// Statistics
export function getDatabaseStats() {
  return {
    totalLeagues: fullDatabase.leagues.length,
    totalTeams: fullDatabase.teams.length,
    totalPlayers: fullDatabase.players.length,
    averageOverall: Math.floor(
      fullDatabase.players.reduce((sum, p) => sum + p.overall, 0) / fullDatabase.players.length
    ),
    topPlayer: fullDatabase.players.reduce((top, p) => p.overall > top.overall ? p : top)
  };
}
