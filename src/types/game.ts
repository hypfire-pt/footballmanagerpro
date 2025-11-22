export interface Player {
  id: string;
  name: string;
  position: string;
  nationality: string;
  age: number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
  technical: number;
  mental: number;
  potential: number;
  marketValue: number;
  wage: number;
  contract: string;
  fitness: number;
  morale: number;
  form: number;
}

export interface Club {
  id: string;
  name: string;
  country: string;
  league: string;
  reputation: number;
  finances: number;
  stadium: string;
  capacity: number;
}

export interface LeagueStanding {
  position: number;
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  competition: string;
  status: 'scheduled' | 'live' | 'finished';
}
