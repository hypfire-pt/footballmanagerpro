import { TeamLineup, MatchEvent, MatchStats, SimulationResult } from "@/types/match";

export class MatchEngine {
  private homeLineup: TeamLineup;
  private awayLineup: TeamLineup;
  private events: MatchEvent[] = [];
  private homeScore: number = 0;
  private awayScore: number = 0;
  private homeSubstitutionsUsed: number = 0;
  private awaySubstitutionsUsed: number = 0;
  private maxSubstitutions: number = 5;
  private playerPerformance: Map<string, any> = new Map();
  private homeAdvantage: number = 0;
  private stadiumCapacity: number = 60000;
  private homeReputation: number = 80;
  private stats: MatchStats = {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    passAccuracy: { home: 0, away: 0 },
  };

  constructor(homeLineup: TeamLineup, awayLineup: TeamLineup, stadiumCapacity: number = 60000, homeReputation: number = 80) {
    this.homeLineup = homeLineup;
    this.awayLineup = awayLineup;
    this.stadiumCapacity = stadiumCapacity;
    this.homeReputation = homeReputation;
    this.calculateHomeAdvantage();
    this.initializePlayerPerformance();
  }

  private calculateHomeAdvantage(): void {
    // Home advantage based on stadium capacity and reputation
    const capacityFactor = Math.min(10, this.stadiumCapacity / 6000);
    const reputationFactor = Math.min(10, this.homeReputation / 8);
    this.homeAdvantage = (capacityFactor + reputationFactor) / 2;
  }

  public getHomeAdvantage(): number {
    return this.homeAdvantage;
  }

  private initializePlayerPerformance(): void {
    [...this.homeLineup.players, ...this.awayLineup.players].forEach(player => {
      this.playerPerformance.set(player.id, {
        playerId: player.id,
        name: player.name,
        position: player.position,
        distanceCovered: 0,
        sprints: 0,
        passesCompleted: 0,
        passesAttempted: 0,
        duelsWon: 0,
        duelsAttempted: 0,
        tackles: 0,
        interceptions: 0,
        rating: 6.0
      });
    });
  }

  private updatePlayerPerformance(playerId: string, updates: Partial<any>): void {
    const current = this.playerPerformance.get(playerId);
    if (current) {
      this.playerPerformance.set(playerId, { ...current, ...updates });
    }
  }

  // Calculate team strength based on players and tactics
  private calculateTeamStrength(lineup: TeamLineup, aspect: 'attack' | 'midfield' | 'defense', isHome: boolean = false): number {
    const players = lineup.players;
    let strength = 0;

    players.forEach(player => {
      const fitnessMultiplier = player.fitness / 100;
      const moraleMultiplier = player.morale / 100;

      if (aspect === 'attack') {
        strength += (player.shooting * 0.4 + player.pace * 0.3 + player.physical * 0.3) * fitnessMultiplier * moraleMultiplier;
      } else if (aspect === 'midfield') {
        strength += (player.passing * 0.5 + player.physical * 0.3 + player.pace * 0.2) * fitnessMultiplier * moraleMultiplier;
      } else {
        strength += (player.defending * 0.5 + player.physical * 0.3 + player.pace * 0.2) * fitnessMultiplier * moraleMultiplier;
      }
    });

    // Apply tactical modifiers
    const tactics = lineup.tactics;
    if (aspect === 'attack' && tactics.mentality === 'attacking') strength *= 1.15;
    if (aspect === 'attack' && tactics.mentality === 'defensive') strength *= 0.85;
    if (aspect === 'midfield' && tactics.tempo === 'fast') strength *= 1.1;
    if (aspect === 'defense' && tactics.pressing === 'high') strength *= 1.1;

    // Apply home advantage
    if (isHome) {
      strength *= (1 + this.homeAdvantage / 100);
    }

    return strength / players.length;
  }

  // Simulate a single attack
  private simulateAttack(attackingTeam: 'home' | 'away', minute: number): void {
    const attacking = attackingTeam === 'home' ? this.homeLineup : this.awayLineup;
    const defending = attackingTeam === 'home' ? this.awayLineup : this.homeLineup;

    // Update player performance - distance and sprints
    attacking.players.slice(0, 11).forEach(player => {
      const perf = this.playerPerformance.get(player.id);
      if (perf) {
        perf.distanceCovered += Math.random() * 0.05;
        if (Math.random() < 0.1) perf.sprints++;
      }
    });

    const attackStrength = this.calculateTeamStrength(attacking, 'attack', attackingTeam === 'home');
    const defenseStrength = this.calculateTeamStrength(defending, 'defense', attackingTeam !== 'home');
    const midfieldControl = this.calculateTeamStrength(attacking, 'midfield', attackingTeam === 'home');

    // Calculate possession influence
    const possessionAdvantage = attackingTeam === 'home' 
      ? this.stats.possession.home / 50 
      : this.stats.possession.away / 50;

    const attackQuality = (attackStrength / defenseStrength) * possessionAdvantage * (Math.random() * 0.5 + 0.75);

    // Random event selection with weighted probabilities
    const rand = Math.random();

    if (attackQuality > 1.3 && rand < 0.15) {
      // High quality chance - shot on target
      this.generateShot(attackingTeam, minute, true);
    } else if (attackQuality > 1.0 && rand < 0.25) {
      // Good chance - shot (may be on/off target)
      const onTarget = Math.random() < 0.6;
      this.generateShot(attackingTeam, minute, onTarget);
    } else if (rand < 0.1) {
      // Corner kick
      this.generateCorner(attackingTeam, minute);
    } else if (rand < 0.05) {
      // Offside
      this.generateOffside(attackingTeam, minute);
    } else if (rand < 0.08 && defenseStrength > attackStrength) {
      // Foul (more likely when defense is under pressure)
      this.generateFoul(attackingTeam === 'home' ? 'away' : 'home', minute);
    }

    // Update passes
    const passCount = Math.floor(Math.random() * 8) + 3;
    const successfulPasses = Math.floor(passCount * (Math.random() * 0.3 + 0.7));
    
    // Update player performance for passer
    const passer = attacking.players[Math.floor(Math.random() * Math.min(11, attacking.players.length))];
    const perf = this.playerPerformance.get(passer.id);
    if (perf) {
      perf.passesAttempted += passCount;
      perf.passesCompleted += successfulPasses;
    }
    
    if (attackingTeam === 'home') {
      this.stats.passes.home += passCount;
    } else {
      this.stats.passes.away += passCount;
    }
  }

  private generateShot(team: 'home' | 'away', minute: number, onTarget: boolean): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const opposingLineup = team === 'home' ? this.awayLineup : this.homeLineup;
    
    // Pick a random attacker/midfielder
    const attackers = lineup.players.filter(p => 
      ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.position)
    );
    const shooter = attackers[Math.floor(Math.random() * attackers.length)] || lineup.players[0];

    // Update stats
    if (team === 'home') {
      this.stats.shots.home++;
      if (onTarget) this.stats.shotsOnTarget.home++;
    } else {
      this.stats.shots.away++;
      if (onTarget) this.stats.shotsOnTarget.away++;
    }

    if (!onTarget) {
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'shot',
        team,
        player: shooter.name,
        description: `${shooter.name} shoots wide!`,
      });
      return;
    }

    // Shot on target - check if it's a goal
    const goalkeeper = opposingLineup.players.find(p => p.position === 'GK');
    const shootingQuality = (shooter.shooting + shooter.physical * 0.3) * (shooter.fitness / 100);
    const saveAbility = goalkeeper ? (goalkeeper.overall * 0.8 + goalkeeper.physical * 0.2) * (goalkeeper.fitness / 100) : 70;

    const goalProbability = Math.max(0.1, Math.min(0.85, (shootingQuality / saveAbility) * 0.3));

    if (Math.random() < goalProbability) {
      // GOAL!
      if (team === 'home') {
        this.homeScore++;
      } else {
        this.awayScore++;
      }

      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'goal',
        team,
        player: shooter.name,
        description: `⚽ GOAL! ${shooter.name} scores!`,
        additionalInfo: team === 'home' 
          ? `${this.homeScore} - ${this.awayScore}`
          : `${this.homeScore} - ${this.awayScore}`,
      });
    } else {
      // Save
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'save',
        team: team === 'home' ? 'away' : 'home',
        player: goalkeeper?.name || 'Goalkeeper',
        description: `Great save by ${goalkeeper?.name || 'the goalkeeper'}!`,
      });
    }
  }

  private generateCorner(team: 'home' | 'away', minute: number): void {
    if (team === 'home') {
      this.stats.corners.home++;
    } else {
      this.stats.corners.away++;
    }

    this.events.push({
      id: `event_${Date.now()}_${Math.random()}`,
      minute,
      type: 'corner',
      team,
      description: `Corner kick for ${team === 'home' ? 'home' : 'away'} team`,
    });
  }

  private generateOffside(team: 'home' | 'away', minute: number): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const attackers = lineup.players.filter(p => ['ST', 'CF', 'LW', 'RW'].includes(p.position));
    const player = attackers[Math.floor(Math.random() * attackers.length)] || lineup.players[0];

    if (team === 'home') {
      this.stats.offsides.home++;
    } else {
      this.stats.offsides.away++;
    }

    this.events.push({
      id: `event_${Date.now()}_${Math.random()}`,
      minute,
      type: 'offside',
      team,
      player: player.name,
      description: `${player.name} caught offside`,
    });
  }

  private generateFoul(team: 'home' | 'away', minute: number): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const defenders = lineup.players.filter(p => ['CB', 'LB', 'RB', 'CDM'].includes(p.position));
    const player = defenders[Math.floor(Math.random() * defenders.length)] || lineup.players[0];

    // Update duel stats
    const perf = this.playerPerformance.get(player.id);
    if (perf) {
      perf.duelsAttempted++;
      perf.tackles++;
    }

    if (team === 'home') {
      this.stats.fouls.home++;
    } else {
      this.stats.fouls.away++;
    }

    // Referee bias - away team more likely to get cards due to crowd pressure
    const cardChance = team === 'away' ? 0.25 : 0.15;
    
    if (Math.random() < cardChance) {
      if (team === 'home') {
        this.stats.yellowCards.home++;
      } else {
        this.stats.yellowCards.away++;
      }

      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'yellow_card',
        team,
        player: player.name,
        description: `⚠️ Yellow card for ${player.name}`,
        additionalInfo: team === 'away' ? 'Crowd pressure influences referee decision' : undefined
      });
    } else {
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'foul',
        team,
        player: player.name,
        description: `Foul by ${player.name}`,
      });
    }
  }

  private calculatePossession(): void {
    const homeMidfield = this.calculateTeamStrength(this.homeLineup, 'midfield', true);
    const awayMidfield = this.calculateTeamStrength(this.awayLineup, 'midfield', false);
    
    const total = homeMidfield + awayMidfield;
    const homePossession = (homeMidfield / total) * 100;
    const awayPossession = (awayMidfield / total) * 100;

    // Add some randomness
    const variance = (Math.random() - 0.5) * 10;
    
    this.stats.possession.home = Math.max(30, Math.min(70, homePossession + variance));
    this.stats.possession.away = 100 - this.stats.possession.home;
  }

  private calculatePassAccuracy(): void {
    const homePassingQuality = this.calculateTeamStrength(this.homeLineup, 'midfield');
    const awayPassingQuality = this.calculateTeamStrength(this.awayLineup, 'midfield');

    this.stats.passAccuracy.home = Math.min(95, Math.max(65, homePassingQuality * 1.1 + (Math.random() - 0.5) * 10));
    this.stats.passAccuracy.away = Math.min(95, Math.max(65, awayPassingQuality * 1.1 + (Math.random() - 0.5) * 10));
  }

  private calculatePlayerRatings(): Record<'home' | 'away', Record<string, number>> {
    const ratings: Record<'home' | 'away', Record<string, number>> = {
      home: {},
      away: {},
    };

    // Calculate ratings based on performance, goals, assists, etc.
    ['home', 'away'].forEach((team) => {
      const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
      lineup.players.forEach((player) => {
        let rating = 6.0; // Base rating
        
        const perf = this.playerPerformance.get(player.id);

        // Bonus for goals
        const goals = this.events.filter(
          e => e.type === 'goal' && e.team === team && e.player === player.name
        ).length;
        rating += goals * 1.5;

        // Bonus for saves (goalkeepers)
        if (player.position === 'GK') {
          const saves = this.events.filter(
            e => e.type === 'save' && e.team === team && e.player === player.name
          ).length;
          rating += saves * 0.3;
        }

        // Pass accuracy bonus
        if (perf && perf.passesAttempted > 0) {
          const accuracy = perf.passesCompleted / perf.passesAttempted;
          rating += (accuracy - 0.7) * 2;
        }

        // Duel success bonus
        if (perf && perf.duelsAttempted > 0) {
          const success = perf.duelsWon / perf.duelsAttempted;
          rating += (success - 0.5) * 1.5;
        }

        // Penalty for yellow cards
        const yellows = this.events.filter(
          e => e.type === 'yellow_card' && e.team === team && e.player === player.name
        ).length;
        rating -= yellows * 0.5;

        // Add some randomness based on overall
        rating += (Math.random() - 0.5) * 1.5 + (player.overall / 100);

        const finalRating = Math.max(4.0, Math.min(10.0, rating));
        ratings[team][player.name] = finalRating;
        
        // Update performance rating
        if (perf) {
          perf.rating = finalRating;
        }
      });
    });

    return ratings;
  }

  public makeSubstitution(
    team: 'home' | 'away',
    playerOutId: string,
    playerInId: string,
    minute: number
  ): boolean {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const subsUsed = team === 'home' ? this.homeSubstitutionsUsed : this.awaySubstitutionsUsed;

    // Check substitution limit
    if (subsUsed >= this.maxSubstitutions) {
      return false;
    }

    // Find players
    const playerOutIndex = lineup.players.findIndex(p => p.id === playerOutId);
    const playerInIndex = lineup.players.findIndex(p => p.id === playerInId);

    if (playerOutIndex === -1 || playerInIndex === -1) {
      return false;
    }

    // Don't allow substituting bench players
    if (playerOutIndex > 10) {
      return false;
    }

    // Swap players in lineup
    const playerOut = lineup.players[playerOutIndex];
    const playerIn = lineup.players[playerInIndex];
    
    [lineup.players[playerOutIndex], lineup.players[playerInIndex]] = 
    [lineup.players[playerInIndex], lineup.players[playerOutIndex]];

    // Add substitution event
    this.events.push({
      id: `event_${Date.now()}_${Math.random()}`,
      minute,
      type: 'substitution',
      team,
      playerOut: playerOut.name,
      playerIn: playerIn.name,
      description: `🔄 Substitution: ${playerIn.name} replaces ${playerOut.name}`,
    });

    // Increment substitution count
    if (team === 'home') {
      this.homeSubstitutionsUsed++;
    } else {
      this.awaySubstitutionsUsed++;
    }

    return true;
  }

  public getSubstitutionsRemaining(team: 'home' | 'away'): number {
    const used = team === 'home' ? this.homeSubstitutionsUsed : this.awaySubstitutionsUsed;
    return this.maxSubstitutions - used;
  }

  public simulate(): SimulationResult {
    // Calculate initial possession
    this.calculatePossession();

    // Simulate 90 minutes (create events at key moments)
    for (let minute = 1; minute <= 90; minute++) {
      // More events in certain periods
      const isKeyMoment = 
        minute < 5 || // Opening minutes
        (minute > 40 && minute < 50) || // Around half time
        minute > 80; // Final push

      const eventsInMinute = isKeyMoment ? Math.random() < 0.4 : Math.random() < 0.15;

      if (eventsInMinute) {
        // Determine which team attacks based on possession
        const attackingTeam = Math.random() * 100 < this.stats.possession.home ? 'home' : 'away';
        this.simulateAttack(attackingTeam, minute);
      }
    }

    // Calculate final stats
    this.calculatePassAccuracy();
    const playerRatings = this.calculatePlayerRatings();

    // Compile player performance
    const homePerformance = this.homeLineup.players.slice(0, 11).map(p => 
      this.playerPerformance.get(p.id)!
    );
    const awayPerformance = this.awayLineup.players.slice(0, 11).map(p => 
      this.playerPerformance.get(p.id)!
    );

    return {
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      events: this.events.sort((a, b) => a.minute - b.minute),
      stats: this.stats,
      playerRatings,
      playerPerformance: {
        home: homePerformance,
        away: awayPerformance
      }
    };
  }

  public updateTactics(team: 'home' | 'away', newTactics: Partial<TeamLineup['tactics']>): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    lineup.tactics = { ...lineup.tactics, ...newTactics };
  }
}
