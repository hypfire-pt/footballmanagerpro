import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PitchVisualization from "@/components/PitchVisualization";
import SubstitutionPanel from "@/components/SubstitutionPanel";
import MatchCommentary from "@/components/MatchCommentary";
import PlayerPerformanceTracker from "@/components/PlayerPerformanceTracker";
import TacticalAdjustmentPanel from "@/components/TacticalAdjustmentPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MatchEngine } from "@/services/matchEngine";
import { TeamLineup, SimulationResult } from "@/types/match";
import { mockPlayers } from "@/data/mockData";
import { Play, Pause, ArrowLeft, Gauge } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MatchSimulation = () => {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [speed, setSpeed] = useState<'normal' | 'fast' | 'instant'>('normal');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [homeLineupState, setHomeLineupState] = useState<TeamLineup | null>(null);
  const [awayLineupState, setAwayLineupState] = useState<TeamLineup | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [momentum, setMomentum] = useState({ home: 50, away: 50 });
  const matchEngineRef = useRef<MatchEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create sample lineups (in real app, this would come from state/props)
  const homeLineup: TeamLineup = {
    formation: "4-2-3-1",
    players: mockPlayers.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      overall: p.overall,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      defending: p.defending,
      physical: p.physical,
      fitness: p.fitness,
      morale: p.morale,
    })),
    tactics: {
      mentality: 'balanced',
      tempo: 'standard',
      width: 'standard',
      pressing: 'medium',
    },
  };

  const awayLineup: TeamLineup = {
    formation: "4-4-2",
    players: mockPlayers.map(p => ({
      id: `away_${p.id}`,
      name: `${p.name} (Away)`,
      position: p.position,
      overall: p.overall - 2,
      pace: p.pace - 2,
      shooting: p.shooting - 2,
      passing: p.passing - 2,
      defending: p.defending - 2,
      physical: p.physical - 2,
      fitness: p.fitness - 5,
      morale: p.morale - 5,
    })),
    tactics: {
      mentality: 'defensive',
      tempo: 'slow',
      width: 'narrow',
      pressing: 'low',
    },
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setIsPaused(false);
    setHomeLineupState(homeLineup);
    setAwayLineupState(awayLineup);
    toast({
      title: "Match started!",
    });

    if (speed === 'instant') {
      // Instant simulation
      const engine = new MatchEngine(homeLineup, awayLineup);
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);
      setCurrentMinute(90);
      setCurrentEventIndex(simResult.events.length);
      setIsSimulating(false);
      toast({
        title: "Full Time",
        description: `${simResult.homeScore} - ${simResult.awayScore}`,
      });
    } else {
      // Animated simulation
      const engine = new MatchEngine(homeLineup, awayLineup);
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);

      const intervalTime = speed === 'fast' ? 100 : 500;
      let minute = 0;
      let eventIndex = 0;

      intervalRef.current = setInterval(() => {
        if (isPaused) return;

        minute += 1;
        setCurrentMinute(minute);

        // Calculate momentum based on recent events
        const recentEvents = simResult.events.filter(e => e.minute >= minute - 5 && e.minute <= minute);
        const homeEvents = recentEvents.filter(e => e.team === 'home' && ['shot', 'shot_on_target', 'corner'].includes(e.type)).length;
        const awayEvents = recentEvents.filter(e => e.team === 'away' && ['shot', 'shot_on_target', 'corner'].includes(e.type)).length;
        const totalEvents = homeEvents + awayEvents;
        
        if (totalEvents > 0) {
          setMomentum({
            home: Math.min(80, Math.max(20, 50 + ((homeEvents - awayEvents) / totalEvents) * 30)),
            away: Math.min(80, Math.max(20, 50 + ((awayEvents - homeEvents) / totalEvents) * 30))
          });
        }

        // Update events up to current minute
        while (eventIndex < simResult.events.length && simResult.events[eventIndex].minute <= minute) {
          const event = simResult.events[eventIndex];
          setCurrentEventIndex(eventIndex);
          
          // Show goal notifications
          if (event.type === 'goal') {
            toast({
              title: "⚽ GOAL!",
              description: event.description,
            });
          }
          
          eventIndex++;
        }

        if (minute >= 90) {
          clearInterval(intervalRef.current!);
          setIsSimulating(false);
          toast({
            title: "Full Time",
            description: `${simResult.homeScore} - ${simResult.awayScore}`,
          });
        }
      }, intervalTime);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Match resumed" : "Match paused",
    });
  };

  const changeSpeed = (newSpeed: 'normal' | 'fast') => {
    if (!isSimulating || !intervalRef.current) return;
    
    setSpeed(newSpeed);
    
    // Restart interval with new speed
    if (result) {
      clearInterval(intervalRef.current);
      const intervalTime = newSpeed === 'fast' ? 100 : 500;
      let minute = currentMinute;
      let eventIndex = currentEventIndex;

      intervalRef.current = setInterval(() => {
        if (isPaused) return;
        minute += 1;
        setCurrentMinute(minute);

        while (eventIndex < result.events.length && result.events[eventIndex].minute <= minute) {
          const event = result.events[eventIndex];
          setCurrentEventIndex(eventIndex);
          if (event.type === 'goal') {
            toast({
              title: "⚽ GOAL!",
              description: event.description,
            });
          }
          eventIndex++;
        }

        if (minute >= 90) {
          clearInterval(intervalRef.current!);
          setIsSimulating(false);
        }
      }, intervalTime);
    }
    
    toast({
      title: `Speed changed to ${newSpeed}`,
    });
  };

  const handleSubstitution = (team: 'home' | 'away', playerOutId: string, playerInId: string) => {
    if (!matchEngineRef.current || !result) return;

    const success = matchEngineRef.current.makeSubstitution(team, playerOutId, playerInId, currentMinute);
    
    if (success) {
      // Update lineup state
      if (team === 'home' && homeLineupState) {
        setHomeLineupState({ ...homeLineupState });
      } else if (team === 'away' && awayLineupState) {
        setAwayLineupState({ ...awayLineupState });
      }
      
      toast({
        title: "Substitution made!",
      });
    } else {
      toast({
        title: "Substitution failed",
        description: "No substitutions remaining",
        variant: "destructive"
      });
    }
  };

  const handleTacticsChange = (team: 'home' | 'away', newTactics: any) => {
    if (!matchEngineRef.current) return;

    matchEngineRef.current.updateTactics(team, newTactics);
    
    if (team === 'home' && homeLineupState) {
      setHomeLineupState({
        ...homeLineupState,
        formation: newTactics.formation || homeLineupState.formation,
        tactics: { ...homeLineupState.tactics, ...newTactics }
      });
    } else if (team === 'away' && awayLineupState) {
      setAwayLineupState({
        ...awayLineupState,
        formation: newTactics.formation || awayLineupState.formation,
        tactics: { ...awayLineupState.tactics, ...newTactics }
      });
    }
  };

  const eventsUpToCurrentMinute = result?.events.filter(e => e.minute <= currentMinute) || [];
  const currentEvent = result?.events[currentEventIndex];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '⚠️';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      default:
        return '•';
    }
  };

  const currentHomeScore = eventsUpToCurrentMinute.filter(
    e => e.type === 'goal' && e.team === 'home'
  ).length;

  const currentAwayScore = eventsUpToCurrentMinute.filter(
    e => e.type === 'goal' && e.team === 'away'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Match Header */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <Badge variant="outline" className="mb-2">Premier League</Badge>
            <p className="text-sm text-muted-foreground">Matchweek 29</p>
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold mb-2">Manchester City</h2>
              <p className="text-sm text-muted-foreground">4-2-3-1 • Balanced</p>
            </div>

            <div className="px-8">
              {result ? (
                <div className="text-center">
                  <p className="text-5xl font-bold">
                    {currentHomeScore} - {currentAwayScore}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentMinute < 90 ? `${currentMinute}'` : "FT"}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-bold text-muted-foreground">vs</p>
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <h2 className="text-2xl font-bold mb-2">Arsenal</h2>
              <p className="text-sm text-muted-foreground">4-4-2 • Defensive</p>
            </div>
          </div>

          {/* Match Progress */}
          {result && (
            <div className="mt-6">
              <Progress value={(currentMinute / 90) * 100} className="h-2" />
            </div>
          )}
        </Card>

        {/* Controls */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!result && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant={speed === 'normal' ? 'default' : 'outline'}
                      onClick={() => setSpeed('normal')}
                      size="sm"
                    >
                      Normal
                    </Button>
                    <Button
                      variant={speed === 'fast' ? 'default' : 'outline'}
                      onClick={() => setSpeed('fast')}
                      size="sm"
                    >
                      Fast
                    </Button>
                    <Button
                      variant={speed === 'instant' ? 'default' : 'outline'}
                      onClick={() => setSpeed('instant')}
                      size="sm"
                    >
                      Instant
                    </Button>
                  </div>

                  <Button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Match
                  </Button>
                </>
              )}

              {result && isSimulating && currentMinute < 90 && (
                <>
                  <Button
                    onClick={togglePause}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 border-l pl-3">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant={speed === 'normal' ? 'default' : 'outline'}
                      onClick={() => changeSpeed('normal')}
                      size="sm"
                    >
                      1x
                    </Button>
                    <Button
                      variant={speed === 'fast' ? 'default' : 'outline'}
                      onClick={() => changeSpeed('fast')}
                      size="sm"
                    >
                      2x
                    </Button>
                  </div>
                </>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-3">
                <Label htmlFor="heat-map" className="text-sm">Heat Map</Label>
                <Switch
                  id="heat-map"
                  checked={showHeatMap}
                  onCheckedChange={setShowHeatMap}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Recent Match Events */}
        {result && eventsUpToCurrentMinute.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Latest Events</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {eventsUpToCurrentMinute.slice(-5).reverse().map((event) => (
                <div
                  key={event.id}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg min-w-[200px] ${
                    event.type === 'goal' ? 'bg-pitch-green/20 border border-pitch-green' : 'bg-muted'
                  }`}
                >
                  <Badge variant="outline" className="w-10 justify-center flex-shrink-0">
                    {event.minute}'
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getEventIcon(event.type)} {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Match Visualization & Statistics */}
        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Pitch Visualization - Takes 2 columns */}
              <div className="xl:col-span-2">
                <PitchVisualization
                  homeLineup={homeLineupState || homeLineup}
                  awayLineup={awayLineupState || awayLineup}
                  currentEvent={currentEvent}
                  currentMinute={currentMinute}
                  isPlaying={isSimulating && !isPaused}
                  showHeatMap={showHeatMap}
                />
              </div>
            
            {/* Statistics - Takes 1 column */}
            <Card className="p-6 xl:col-span-1">
              <h3 className="text-xl font-bold mb-4">Match Statistics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">{Math.round(result.stats.possession.home)}%</span>
                    <span className="text-muted-foreground">Possession</span>
                    <span className="font-semibold">{Math.round(result.stats.possession.away)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2 bg-pitch-green rounded" style={{ width: `${result.stats.possession.home}%` }} />
                    <div className="h-2 bg-blue-500 rounded" style={{ width: `${result.stats.possession.away}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{result.stats.shots.home}</span>
                    <span className="text-muted-foreground">Shots</span>
                    <span className="font-semibold">{result.stats.shots.away}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{result.stats.shotsOnTarget.home}</span>
                    <span className="text-muted-foreground">Shots on Target</span>
                    <span className="font-semibold">{result.stats.shotsOnTarget.away}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{result.stats.corners.home}</span>
                    <span className="text-muted-foreground">Corners</span>
                    <span className="font-semibold">{result.stats.corners.away}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{result.stats.fouls.home}</span>
                    <span className="text-muted-foreground">Fouls</span>
                    <span className="font-semibold">{result.stats.fouls.away}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{result.stats.yellowCards.home}</span>
                    <span className="text-muted-foreground">Yellow Cards</span>
                    <span className="font-semibold">{result.stats.yellowCards.away}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{Math.round(result.stats.passAccuracy.home)}%</span>
                    <span className="text-muted-foreground">Pass Accuracy</span>
                    <span className="font-semibold">{Math.round(result.stats.passAccuracy.away)}%</span>
                  </div>
                </div>
              </div>

              {/* Player Ratings */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Player Ratings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Home</h4>
                    {Object.entries(result.playerRatings.home).slice(0, 5).map(([name, rating]) => (
                      <div key={name} className="flex justify-between text-sm mb-1">
                        <span>{name}</span>
                        <Badge variant="outline">{rating.toFixed(1)}</Badge>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Away</h4>
                    {Object.entries(result.playerRatings.away).slice(0, 5).map(([name, rating]) => (
                      <div key={name} className="flex justify-between text-sm mb-1">
                        <span>{name}</span>
                        <Badge variant="outline">{rating.toFixed(1)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="xl:col-span-1 space-y-4">
              <TacticalAdjustmentPanel
                team="home"
                teamName="Manchester City"
                currentTactics={{
                  formation: (homeLineupState || homeLineup).formation,
                  ...(homeLineupState || homeLineup).tactics
                }}
                onTacticsChange={(tactics) => handleTacticsChange('home', tactics)}
                isMatchRunning={isSimulating && currentMinute < 90}
              />
              <SubstitutionPanel
                team="home"
                teamName="Manchester City"
                players={(homeLineupState || homeLineup).players}
                onSubstitute={(out, in_) => handleSubstitution('home', out, in_)}
                substitutionsRemaining={matchEngineRef.current?.getSubstitutionsRemaining('home') || 5}
                isMatchRunning={isSimulating && currentMinute < 90}
              />
            </div>
          </div>

          {/* Commentary and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <MatchCommentary
              events={eventsUpToCurrentMinute}
              currentMinute={currentMinute}
              homeTeam="Manchester City"
              awayTeam="Arsenal"
              momentum={momentum}
            />
            <PlayerPerformanceTracker
              homeTeam="Manchester City"
              awayTeam="Arsenal"
              homePlayers={result.playerPerformance.home}
              awayPlayers={result.playerPerformance.away}
            />
          </div>

          {/* Tactical Adjustment for Away Team */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TacticalAdjustmentPanel
              team="away"
              teamName="Arsenal"
              currentTactics={{
                formation: (awayLineupState || awayLineup).formation,
                ...(awayLineupState || awayLineup).tactics
              }}
              onTacticsChange={(tactics) => handleTacticsChange('away', tactics)}
              isMatchRunning={isSimulating && currentMinute < 90}
            />
            <SubstitutionPanel
              team="away"
              teamName="Arsenal"
              players={(awayLineupState || awayLineup).players}
              onSubstitute={(out, in_) => handleSubstitution('away', out, in_)}
              substitutionsRemaining={matchEngineRef.current?.getSubstitutionsRemaining('away') || 5}
              isMatchRunning={isSimulating && currentMinute < 90}
            />
          </div>
        </div>
        )}

        {/* Full Match Timeline */}
        {result && eventsUpToCurrentMinute.length > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Full Match Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {eventsUpToCurrentMinute.map((event) => (
                <div
                  key={event.id}
                  className={`flex gap-2 p-3 rounded-lg ${
                    event.type === 'goal' ? 'bg-pitch-green/10 border border-pitch-green/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="w-10 justify-center">
                      {event.minute}'
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getEventIcon(event.type)} {event.description}
                    </p>
                    {event.additionalInfo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MatchSimulation;
