export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'shot' | 'shot_on_target' | 'save' | 'foul' | 'yellow_card' | 'red_card' | 'substitution' | 'corner' | 'offside' | 'injury';
  team: 'home' | 'away';
  player?: string;
  playerOut?: string;
  playerIn?: string;
  description: string;
  additionalInfo?: string;
}

export interface PlayerMovement {
  playerId: string;
  targetX: number;
  targetY: number;
  speed: number;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

export interface TeamLineup {
  formation: string;
  players: {
    id: string;
    name: string;
    position: string;
    overall: number;
    pace: number;
    shooting: number;
    passing: number;
    defending: number;
    physical: number;
    fitness: number;
    morale: number;
  }[];
  tactics: {
    mentality: 'defensive' | 'balanced' | 'attacking';
    tempo: 'slow' | 'standard' | 'fast';
    width: 'narrow' | 'standard' | 'wide';
    pressing: 'low' | 'medium' | 'high';
  };
}

export interface SimulationResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  stats: MatchStats;
  momentumByMinute: Record<number, number>; // -100 to +100 per minute
  playerRatings: {
    home: Record<string, number>;
    away: Record<string, number>;
  };
  playerPerformance: {
    home: PlayerPerformanceData[];
    away: PlayerPerformanceData[];
  };
}

export interface PlayerPerformanceData {
  playerId: string;
  name: string;
  position: string;
  distanceCovered: number;
  sprints: number;
  passesCompleted: number;
  passesAttempted: number;
  duelsWon: number;
  duelsAttempted: number;
  tackles: number;
  interceptions: number;
  rating: number;
}
