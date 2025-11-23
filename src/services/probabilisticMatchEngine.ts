import { TeamLineup, MatchEvent, MatchStats, SimulationResult } from "@/types/match";

type WeatherCondition = 'clear' | 'rain' | 'heavy_rain' | 'snow' | 'windy';

interface MatchContext {
  minute: number;
  homeScore: number;
  awayScore: number;
  momentum: number; // -100 (away dominating) to +100 (home dominating)
  weather: WeatherCondition;
  isDerby: boolean;
}

export class ProbabilisticMatchEngine {
  private homeLineup: TeamLineup;
  private awayLineup: TeamLineup;
  private events: MatchEvent[] = [];
  private homeScore: number = 0;
  private awayScore: number = 0;
  private momentum: number = 0;
  private momentumByMinute: Record<number, number> = {};
  private weather: WeatherCondition;
  private isDerby: boolean = false;
  private homeAdvantage: number = 0;
  private stadiumCapacity: number;
  private homeReputation: number;
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

  constructor(
    homeLineup: TeamLineup,
    awayLineup: TeamLineup,
    stadiumCapacity: number = 60000,
    homeReputation: number = 80,
    isDerby: boolean = false
  ) {
    this.homeLineup = homeLineup;
    this.awayLineup = awayLineup;
    this.stadiumCapacity = stadiumCapacity;
    this.homeReputation = homeReputation;
    this.isDerby = isDerby;
    this.weather = this.generateWeather();
    this.calculateHomeAdvantage();
  }

  private generateWeather(): WeatherCondition {
    const rand = Math.random();
    if (rand < 0.80) return 'clear';
    if (rand < 0.95) return 'rain';
    if (rand < 0.98) return 'heavy_rain';
    if (rand < 0.99) return 'snow';
    return 'windy';
  }

  private calculateHomeAdvantage(): void {
    let advantage = 0;
    
    // Stadium capacity factor (up to +8%)
    if (this.stadiumCapacity < 15000) advantage += 2;
    else if (this.stadiumCapacity < 30000) advantage += 5;
    else if (this.stadiumCapacity < 50000) advantage += 8;
    else if (this.stadiumCapacity < 75000) advantage += 12;
    else advantage += 15;
    
    // Derby bonus
    if (this.isDerby) {
      advantage += 10;
    }
    
    this.homeAdvantage = advantage;
  }

  private getWeatherModifiers() {
    const modifiers = {
      passAccuracy: 1.0,
      shotAccuracy: 1.0,
      pace: 1.0,
      slipProbability: 0.0,
      goalkeeperError: 1.0
    };

    switch (this.weather) {
      case 'rain':
        modifiers.passAccuracy = 0.9;
        modifiers.shotAccuracy = 0.95;
        modifiers.slipProbability = 0.05;
        modifiers.goalkeeperError = 1.5;
        break;
      case 'heavy_rain':
        modifiers.passAccuracy = 0.8;
        modifiers.shotAccuracy = 0.85;
        modifiers.pace = 0.9;
        modifiers.slipProbability = 0.15;
        modifiers.goalkeeperError = 2.0;
        break;
      case 'snow':
        modifiers.passAccuracy = 0.75;
        modifiers.shotAccuracy = 0.8;
        modifiers.pace = 0.85;
        modifiers.slipProbability = 0.2;
        break;
      case 'windy':
        modifiers.shotAccuracy = 0.85;
        break;
    }

    return modifiers;
  }

  private calculateTeamStrength(
    lineup: TeamLineup,
    aspect: 'attack' | 'midfield' | 'defense',
    isHome: boolean,
    minute: number
  ): number {
    const players = lineup.players.slice(0, 11);
    let strength = 0;

    players.forEach(player => {
      // Fitness degradation
      const fatigueMultiplier = this.calculateFatigue(player.fitness, minute, lineup.tactics);
      const moraleMultiplier = this.calculateMoraleEffect(player.morale);

      let baseAttribute = 0;
      if (aspect === 'attack') {
        baseAttribute = player.shooting * 0.4 + player.pace * 0.3 + player.physical * 0.3;
      } else if (aspect === 'midfield') {
        baseAttribute = player.passing * 0.5 + player.physical * 0.3 + player.pace * 0.2;
      } else {
        baseAttribute = player.defending * 0.5 + player.physical * 0.3 + player.pace * 0.2;
      }

      strength += baseAttribute * fatigueMultiplier * moraleMultiplier;
    });

    // Tactical modifiers
    strength = this.applyTacticalModifiers(strength, lineup.tactics, aspect);

    // Home advantage
    if (isHome) {
      strength *= (1 + this.homeAdvantage / 100);
    }

    // Weather impact
    const weatherMods = this.getWeatherModifiers();
    if (aspect === 'attack') {
      strength *= weatherMods.shotAccuracy;
    } else if (aspect === 'midfield') {
      strength *= weatherMods.passAccuracy;
    }

    return strength / players.length;
  }

  private calculateFatigue(fitness: number, minute: number, tactics: TeamLineup['tactics']): number {
    let degradationRate = 0.01; // Base 1% per 10 minutes
    
    // Tactics impact on fatigue
    if (tactics.pressing === 'high') degradationRate *= 1.5;
    if (tactics.tempo === 'fast') degradationRate *= 1.3;
    
    const minutesPassed = minute;
    const currentFitness = Math.max(30, fitness - (degradationRate * minutesPassed * 10));
    
    // Fitness multiplier
    if (currentFitness >= 85) return 1.0;
    if (currentFitness >= 70) return 0.95;
    if (currentFitness >= 50) return 0.85;
    if (currentFitness >= 30) return 0.70;
    return 0.50;
  }

  private calculateMoraleEffect(morale: number): number {
    if (morale >= 90) return 1.15;
    if (morale >= 70) return 1.05;
    if (morale >= 50) return 1.0;
    if (morale >= 30) return 0.90;
    return 0.75;
  }

  private applyTacticalModifiers(
    strength: number,
    tactics: TeamLineup['tactics'],
    aspect: 'attack' | 'midfield' | 'defense'
  ): number {
    let modified = strength;

    // Mentality impact
    if (aspect === 'attack') {
      if (tactics.mentality === 'attacking') modified *= 1.20;
      if (tactics.mentality === 'defensive') modified *= 0.80;
    } else if (aspect === 'defense') {
      if (tactics.mentality === 'defensive') modified *= 1.15;
      if (tactics.mentality === 'attacking') modified *= 0.85;
    }

    // Tempo impact
    if (tactics.tempo === 'fast' && aspect === 'attack') {
      modified *= 1.15;
    }

    // Pressing impact
    if (tactics.pressing === 'high' && aspect === 'midfield') {
      modified *= 1.10;
    }

    return modified;
  }

  private updateMomentum(team: 'home' | 'away', change: number): void {
    if (team === 'home') {
      this.momentum = Math.max(-100, Math.min(100, this.momentum + change));
    } else {
      this.momentum = Math.max(-100, Math.min(100, this.momentum - change));
    }
  }

  private getMomentumEffect(team: 'home' | 'away'): number {
    const teamMomentum = team === 'home' ? this.momentum : -this.momentum;
    
    if (teamMomentum >= 50) return 1.15;
    if (teamMomentum >= 25) return 1.08;
    if (teamMomentum <= -50) return 0.85;
    if (teamMomentum <= -25) return 0.92;
    return 1.0;
  }

  private simulateAttack(attackingTeam: 'home' | 'away', minute: number): void {
    const context: MatchContext = {
      minute,
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      momentum: this.momentum,
      weather: this.weather,
      isDerby: this.isDerby
    };

    const attacking = attackingTeam === 'home' ? this.homeLineup : this.awayLineup;
    const defending = attackingTeam === 'home' ? this.awayLineup : this.homeLineup;

    const attackStrength = this.calculateTeamStrength(attacking, 'attack', attackingTeam === 'home', minute);
    const defenseStrength = this.calculateTeamStrength(defending, 'defense', attackingTeam !== 'home', minute);
    const momentumEffect = this.getMomentumEffect(attackingTeam);

    const attackQuality = (attackStrength / defenseStrength) * momentumEffect * (Math.random() * 0.5 + 0.75);

    // Late match drama
    let urgencyBonus = 1.0;
    if (minute > 75) {
      if (attackingTeam === 'home' && this.homeScore < this.awayScore) urgencyBonus = 1.20;
      if (attackingTeam === 'away' && this.awayScore < this.homeScore) urgencyBonus = 1.20;
    }

    const finalQuality = attackQuality * urgencyBonus;

    // Event probabilities
    const rand = Math.random();

    if (finalQuality > 1.4 && rand < 0.12) {
      // High quality chance
      this.generateShot(attackingTeam, minute, true, context);
    } else if (finalQuality > 1.1 && rand < 0.20) {
      // Good chance
      const onTarget = Math.random() < 0.65;
      this.generateShot(attackingTeam, minute, onTarget, context);
    } else if (rand < 0.08) {
      this.generateCorner(attackingTeam, minute);
    } else if (rand < 0.04) {
      this.generateOffside(attackingTeam, minute);
    } else if (rand < 0.06) {
      this.generateFoul(attackingTeam === 'home' ? 'away' : 'home', minute, context);
    }

    // Update passes
    const passCount = Math.floor(Math.random() * 8) + 3;
    const weatherMods = this.getWeatherModifiers();
    const passSuccessRate = Math.random() * 0.3 + 0.7 * weatherMods.passAccuracy;
    const successfulPasses = Math.floor(passCount * passSuccessRate);
    
    if (attackingTeam === 'home') {
      this.stats.passes.home += passCount;
    } else {
      this.stats.passes.away += passCount;
    }
  }

  private generateShot(team: 'home' | 'away', minute: number, onTarget: boolean, context: MatchContext): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const opposingLineup = team === 'home' ? this.awayLineup : this.homeLineup;
    
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

    // Shot on target - calculate goal probability
    const goalkeeper = opposingLineup.players.find(p => p.position === 'GK');
    const shootingQuality = (shooter.shooting + shooter.physical * 0.3) * (shooter.fitness / 100);
    const saveAbility = goalkeeper ? (goalkeeper.overall * 0.8 + goalkeeper.physical * 0.2) * (goalkeeper.fitness / 100) : 70;

    const weatherMods = this.getWeatherModifiers();
    let goalProbability = (shootingQuality / saveAbility) * 0.3 * weatherMods.shotAccuracy;

    // Wonder goal chance
    if (shooter.shooting >= 85 && Math.random() < 0.03) {
      goalProbability = 1.0;
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'goal',
        team,
        player: shooter.name,
        description: `⚡ WONDER GOAL! ${shooter.name} scores a spectacular goal!`,
        additionalInfo: team === 'home' ? `${this.homeScore + 1} - ${this.awayScore}` : `${this.homeScore} - ${this.awayScore + 1}`,
      });
      if (team === 'home') this.homeScore++; else this.awayScore++;
      this.updateMomentum(team, 50);
      return;
    }

    // Goalkeeper howler
    if (Math.random() < 0.005 * weatherMods.goalkeeperError) {
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'goal',
        team,
        player: shooter.name,
        description: `🤦 GOALKEEPER ERROR! ${goalkeeper?.name || 'Goalkeeper'} fumbles - ${shooter.name} scores!`,
        additionalInfo: team === 'home' ? `${this.homeScore + 1} - ${this.awayScore}` : `${this.homeScore} - ${this.awayScore + 1}`,
      });
      if (team === 'home') this.homeScore++; else this.awayScore++;
      this.updateMomentum(team, 30);
      return;
    }

    if (Math.random() < goalProbability) {
      // GOAL!
      if (team === 'home') this.homeScore++; else this.awayScore++;
      
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
      
      this.updateMomentum(team, 30);
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

  private generateFoul(team: 'home' | 'away', minute: number, context: MatchContext): void {
    const lineup = team === 'home' ? this.homeLineup : this.awayLineup;
    const defenders = lineup.players.filter(p => ['CB', 'LB', 'RB', 'CDM'].includes(p.position));
    const player = defenders[Math.floor(Math.random() * defenders.length)] || lineup.players[0];

    if (team === 'home') {
      this.stats.fouls.home++;
    } else {
      this.stats.fouls.away++;
    }

    // Referee bias - away team more likely to get cards (home advantage)
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
      });
      
      this.updateMomentum(team === 'home' ? 'away' : 'home', 10);
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
    const homeMidfield = this.calculateTeamStrength(this.homeLineup, 'midfield', true, 45);
    const awayMidfield = this.calculateTeamStrength(this.awayLineup, 'midfield', false, 45);
    
    const total = homeMidfield + awayMidfield;
    let homePossession = (homeMidfield / total) * 100;
    
    // Momentum influence on possession
    homePossession += this.momentum * 0.1;
    
    // Add variance
    const variance = (Math.random() - 0.5) * 10;
    homePossession = Math.max(30, Math.min(70, homePossession + variance));
    
    this.stats.possession.home = homePossession;
    this.stats.possession.away = 100 - homePossession;
  }

  private calculatePassAccuracy(): void {
    const weatherMods = this.getWeatherModifiers();
    const homePassingQuality = this.calculateTeamStrength(this.homeLineup, 'midfield', true, 45);
    const awayPassingQuality = this.calculateTeamStrength(this.awayLineup, 'midfield', false, 45);

    this.stats.passAccuracy.home = Math.min(95, Math.max(65, homePassingQuality * 1.1 * weatherMods.passAccuracy + (Math.random() - 0.5) * 10));
    this.stats.passAccuracy.away = Math.min(95, Math.max(65, awayPassingQuality * 1.1 * weatherMods.passAccuracy + (Math.random() - 0.5) * 10));
  }

  public simulate(): SimulationResult {
    this.calculatePossession();

    // Simulate 90 minutes
    for (let minute = 1; minute <= 90; minute++) {
      const isKeyMoment = 
        minute < 5 || 
        (minute > 40 && minute < 50) || 
        minute > 80;

      const eventProbability = isKeyMoment ? 0.4 : 0.15;

      if (Math.random() < eventProbability) {
        const attackingTeam = Math.random() * 100 < this.stats.possession.home ? 'home' : 'away';
        this.simulateAttack(attackingTeam, minute);
      }
      
      // Store momentum for this minute
      this.momentumByMinute[minute] = this.momentum;
    }

    this.calculatePassAccuracy();

    return {
      homeScore: this.homeScore,
      awayScore: this.awayScore,
      events: this.events.sort((a, b) => a.minute - b.minute),
      stats: this.stats,
      momentumByMinute: this.momentumByMinute,
      playerRatings: { home: {}, away: {} },
      playerPerformance: { home: [], away: [] }
    };
  }
}
