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

  private selectWeightedScorer(lineup: TeamLineup): any {
    // Create weighted pool based on position and shooting ability
    const weightedPlayers: { player: any; weight: number }[] = [];
    
    lineup.players.forEach(player => {
      let positionWeight = 1;
      
      // Position weights
      if (['ST', 'CF'].includes(player.position)) {
        positionWeight = 50; // Strikers most likely
      } else if (['LW', 'RW'].includes(player.position)) {
        positionWeight = 35; // Wingers quite likely
      } else if (player.position === 'CAM') {
        positionWeight = 25; // Attacking mids regularly
      } else if (['CM', 'LM', 'RM'].includes(player.position)) {
        positionWeight = 12; // Central/wide mids occasionally
      } else if (['CDM', 'LWB', 'RWB'].includes(player.position)) {
        positionWeight = 5; // Defensive mids/wing-backs rarely
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        positionWeight = 2; // Defenders very rarely
      } else {
        positionWeight = 0.1; // Goalkeeper almost never
      }
      
      // Multiply by shooting attribute (normalized)
      const shootingFactor = (player.shooting || 50) / 75; // Normalize around 75
      const finalWeight = positionWeight * shootingFactor * (player.fitness / 100);
      
      weightedPlayers.push({ player, weight: finalWeight });
    });
    
    // Select based on cumulative weights
    const totalWeight = weightedPlayers.reduce((sum, wp) => sum + wp.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const wp of weightedPlayers) {
      random -= wp.weight;
      if (random <= 0) {
        return wp.player;
      }
    }
    
    // Fallback
    return lineup.players[0];
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

    // Late match drama amplifier (minutes 75-90+)
    let urgencyBonus = 1.0;
    let dramaProbability = 1.0;
    
    if (minute > 75) {
      // Trailing team gets urgency bonus
      if (attackingTeam === 'home' && this.homeScore < this.awayScore) {
        urgencyBonus = 1.20; // +20% attacking urgency
      } else if (attackingTeam === 'away' && this.awayScore < this.homeScore) {
        urgencyBonus = 1.20;
      }
      
      // Late match drama amplifier
      dramaProbability = 1.4; // +40% event probability after 75'
    }
    
    if (minute > 85) {
      dramaProbability = 1.6; // +60% event probability after 85'
    }

    const finalQuality = attackQuality * urgencyBonus;

    // Calculate foul probability based on pressure and tactics
    let foulProbability = 0.06; // Base 6%
    
    if (this.isDerby) foulProbability += 0.04; // Derby = +40% fouls
    if (minute > 75) foulProbability += 0.03; // Late match tension
    if (Math.abs(this.momentum) > 50) foulProbability += 0.02; // High pressure
    if (defending.tactics.pressing === 'high') foulProbability += 0.02; // Aggressive pressing
    
    foulProbability *= dramaProbability;

    // Event probabilities with drama multiplier
    const rand = Math.random();

    if (finalQuality > 1.4 && rand < 0.12 * dramaProbability) {
      // High quality chance - likely on target
      this.generateShot(attackingTeam, minute, true, context);
    } else if (finalQuality > 1.1 && rand < 0.20 * dramaProbability) {
      // Good chance - variable accuracy
      const onTargetChance = 0.50 + (finalQuality - 1.1) * 0.5; // 50-65% on target
      const onTarget = Math.random() < onTargetChance;
      this.generateShot(attackingTeam, minute, onTarget, context);
    } else if (finalQuality > 0.8 && rand < 0.15 * dramaProbability) {
      // Moderate chance - likely off target
      const onTarget = Math.random() < 0.35; // 35% on target
      this.generateShot(attackingTeam, minute, onTarget, context);
    } else if (rand < 0.08 * dramaProbability) {
      this.generateCorner(attackingTeam, minute);
    } else if (rand < 0.04 * dramaProbability) {
      this.generateOffside(attackingTeam, minute);
    } else if (rand < foulProbability) {
      // Defending team commits foul
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
    
    // Weighted player selection based on position and shooting ability
    const shooter = this.selectWeightedScorer(lineup);
    const goalkeeper = opposingLineup.players.find(p => p.position === 'GK');

    // Calculate shot quality based on multiple factors
    const shooterFitness = shooter.fitness / 100;
    const shooterMorale = shooter.morale / 100;
    const shooterForm = (shooter.fitness + shooter.morale) / 200; // Simplified form
    
    // Technical attributes weight (30%)
    const technicalQuality = (shooter.shooting * 0.6 + shooter.passing * 0.2 + shooter.physical * 0.2) / 100;
    
    // Mental attributes weight (25%)
    const mentalQuality = shooterMorale;
    
    // Physical attributes weight (20%)
    const physicalQuality = (shooter.pace * 0.3 + shooter.physical * 0.7) / 100;
    
    // Dynamic state modifiers
    const stateMultiplier = shooterFitness * 0.5 + shooterMorale * 0.3 + shooterForm * 0.2;
    
    // Overall shooting quality (0-100 scale)
    let shotQuality = (technicalQuality * 30 + mentalQuality * 25 + physicalQuality * 20) * stateMultiplier * 100;
    
    // Context modifiers
    if (minute > 75) {
      // Late match urgency
      const scoreDiff = team === 'home' ? context.homeScore - context.awayScore : context.awayScore - context.homeScore;
      if (scoreDiff < 0) shotQuality *= 1.15; // Losing = +15% desperation
    }
    
    if (minute > 85 && Math.abs(context.homeScore - context.awayScore) === 0) {
      shotQuality *= 1.10; // Drawing late = +10% pressure
    }
    
    // Weather modifiers
    const weatherMods = this.getWeatherModifiers();
    shotQuality *= weatherMods.shotAccuracy;
    
    // Momentum effect
    const teamMomentum = team === 'home' ? context.momentum : -context.momentum;
    if (teamMomentum > 50) shotQuality *= 1.15;
    else if (teamMomentum < -50) shotQuality *= 0.85;

    // Update stats
    if (team === 'home') {
      this.stats.shots.home++;
    } else {
      this.stats.shots.away++;
    }

    // Determine if shot is on target based on shooting quality
    const onTargetProbability = shotQuality / 100 * 0.65; // 65% base for good players
    const actuallyOnTarget = onTarget && Math.random() < onTargetProbability;
    
    if (!actuallyOnTarget) {
      // MISSED SHOT
      if (team === 'home') {
        this.stats.shots.home;
      } else {
        this.stats.shots.away;
      }
      
      // Determine miss type
      const missType = Math.random();
      let missDescription = '';
      
      if (missType < 0.4) {
        missDescription = `${shooter.name} shoots wide of the post!`;
      } else if (missType < 0.7) {
        missDescription = `${shooter.name}'s shot goes over the bar!`;
      } else {
        missDescription = `${shooter.name} completely mishits the shot!`;
      }
      
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'shot',
        team,
        player: shooter.name,
        description: missDescription,
      });
      
      // Small momentum shift for missing
      this.updateMomentum(team === 'home' ? 'away' : 'home', 3);
      return;
    }

    // Shot is ON TARGET
    if (team === 'home') {
      this.stats.shotsOnTarget.home++;
    } else {
      this.stats.shotsOnTarget.away++;
    }

    // Calculate goal probability - INCREASED for more exciting matches
    const gkQuality = goalkeeper ? (goalkeeper.overall * 0.8 + goalkeeper.physical * 0.2) * (goalkeeper.fitness / 100) : 70;
    
    let goalProbability = (shotQuality / gkQuality) * 0.45; // Increased from 0.3 to 0.45 for 50% more goals
    
    // Wonder goal chance (1% base + modifiers)
    let wonderGoalChance = 0.01;
    if (shooter.shooting >= 90) wonderGoalChance = 0.03; // +3% for elite shooters
    if (shooterForm > 0.85) wonderGoalChance += 0.015; // Hot form
    if (context.isDerby) wonderGoalChance += 0.02; // Derby magic
    if (minute > 85) wonderGoalChance += 0.02; // Late drama
    
    if (Math.random() < wonderGoalChance) {
      // WONDER GOAL!
      if (team === 'home') this.homeScore++; else this.awayScore++;
      
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'goal',
        team,
        player: shooter.name,
        description: `⚡ WONDER GOAL! ${shooter.name} scores a spectacular goal!`,
        additionalInfo: team === 'home' ? `${this.homeScore} - ${this.awayScore}` : `${this.homeScore} - ${this.awayScore}`,
      });
      
      this.updateMomentum(team, 50);
      return;
    }

    // Goalkeeper howler check
    let howlerChance = 0.005 * weatherMods.goalkeeperError;
    if (goalkeeper && goalkeeper.morale < 40) howlerChance += 0.02; // Low morale
    if (minute > 80) howlerChance += 0.005; // Pressure
    if (context.isDerby) howlerChance += 0.005; // Derby pressure
    
    if (Math.random() < howlerChance) {
      // GOALKEEPER ERROR!
      if (team === 'home') this.homeScore++; else this.awayScore++;
      
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'goal',
        team,
        player: shooter.name,
        description: `🤦 GOALKEEPER ERROR! ${goalkeeper?.name || 'Goalkeeper'} fumbles - ${shooter.name} scores!`,
        additionalInfo: team === 'home' ? `${this.homeScore} - ${this.awayScore}` : `${this.homeScore} - ${this.awayScore}`,
      });
      
      this.updateMomentum(team, 30);
      return;
    }

    // Normal goal calculation
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
      // SAVE!
      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'save',
        team: team === 'home' ? 'away' : 'home',
        player: goalkeeper?.name || 'Goalkeeper',
        description: `Excellent save by ${goalkeeper?.name || 'the goalkeeper'}!`,
      });
      
      // Small momentum boost for great save
      this.updateMomentum(team === 'home' ? 'away' : 'home', 8);
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
    const player = defenders[Math.floor(Math.random() * defenders.length)] || lineup.players[Math.floor(Math.random() * lineup.players.length)];

    // Calculate base foul probability based on context
    let foulSeverity = Math.random();
    
    // Factors increasing foul severity
    if (context.isDerby) foulSeverity += 0.2; // Derby matches = +40% foul probability
    if (minute > 75 && Math.abs(context.homeScore - context.awayScore) <= 1) foulSeverity += 0.15; // Late match tension
    if (Math.abs(context.momentum) > 50) foulSeverity += 0.1; // High momentum = more desperate defending
    
    // Player attributes affecting fouls
    const playerDiscipline = player.morale / 100; // Higher morale = better discipline
    const playerTackling = player.defending / 100; // Better defending = cleaner tackles
    foulSeverity *= (1.2 - (playerDiscipline * 0.5 + playerTackling * 0.5));

    if (team === 'home') {
      this.stats.fouls.home++;
    } else {
      this.stats.fouls.away++;
    }

    // Referee bias - away team 60% more likely to get cards (home advantage)
    const homeAdvantageBias = team === 'away' ? 1.6 : 1.0;
    
    // Calculate card probability
    let cardProbability = 0.15 * homeAdvantageBias; // Base 15% chance
    
    // Modifiers for card probability
    if (foulSeverity > 0.7) cardProbability += 0.15; // Severe foul
    if (minute > 80) cardProbability += 0.1; // Late match = stricter refereeing
    if (context.isDerby) cardProbability += 0.1; // Derby = stricter control
    if (player.morale < 50) cardProbability += 0.05; // Low morale = poor discipline
    
    const cardRoll = Math.random();
    
    // Red card probability (much lower)
    const redCardProbability = cardProbability * 0.05; // 5% of card probability
    
    if (cardRoll < redCardProbability) {
      // RED CARD
      if (team === 'home') {
        this.stats.redCards.home++;
      } else {
        this.stats.redCards.away++;
      }

      this.events.push({
        id: `event_${Date.now()}_${Math.random()}`,
        minute,
        type: 'red_card',
        team,
        player: player.name,
        description: `🟥 RED CARD! ${player.name} sent off!`,
      });
      
      // Massive momentum swing
      this.updateMomentum(team === 'home' ? 'away' : 'home', 40);
      
    } else if (cardRoll < cardProbability) {
      // YELLOW CARD
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
      // Regular foul (no card)
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

    // Simulate 90 minutes + potential injury time
    const totalMinutes = 90 + Math.floor(Math.random() * 5); // 0-4 minutes injury time
    
    for (let minute = 1; minute <= totalMinutes; minute++) {
      // Determine if this is a key moment
      const isKeyMoment = 
        minute < 5 ||  // Opening minutes
        (minute > 40 && minute < 50) ||  // Around half time
        minute > 80;  // Final push
      
      // Late drama amplifier for injury time
      const isInjuryTime = minute > 90;
      let eventProbability = isKeyMoment ? 0.4 : 0.15;
      
      if (isInjuryTime) {
        eventProbability *= 1.4; // +40% event probability in injury time
      }

      if (Math.random() < eventProbability) {
        const attackingTeam = Math.random() * 100 < this.stats.possession.home ? 'home' : 'away';
        this.simulateAttack(attackingTeam, minute);
      }
      
      // Store momentum for this minute (cap at 90 for display)
      const displayMinute = Math.min(minute, 90);
      this.momentumByMinute[displayMinute] = this.momentum;
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
