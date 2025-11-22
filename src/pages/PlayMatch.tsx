import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import PitchVisualization from "@/components/PitchVisualization";
import SubstitutionPanel from "@/components/SubstitutionPanel";
import MatchCommentary from "@/components/MatchCommentary";
import PlayerPerformanceTracker from "@/components/PlayerPerformanceTracker";
import TacticalAdjustmentPanel from "@/components/TacticalAdjustmentPanel";
import CrowdAtmosphere from "@/components/CrowdAtmosphere";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MatchEngine } from "@/services/matchEngine";
import { TeamLineup, SimulationResult } from "@/types/match";
import { mockPlayers } from "@/data/mockData";
import { Play, Pause, ArrowLeft, Gauge, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSeason } from "@/contexts/SeasonContext";

const PlayMatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { advanceDate } = useSeason();
  const fixture = location.state?.fixture;
  
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
  const [stadiumCapacity] = useState(60000);
  const [homeReputation] = useState(85);
  const matchEngineRef = useRef<MatchEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create sample lineups
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
      title: "⚽ Match Started",
    });

    if (speed === 'instant') {
      const engine = new MatchEngine(homeLineup, awayLineup, stadiumCapacity, homeReputation);
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);
      setCurrentMinute(90);
      setCurrentEventIndex(simResult.events.length);
      setIsSimulating(false);
      
      if (fixture) {
        const matchDate = new Date(fixture.date);
        const today = new Date();
        const daysToAdvance = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (daysToAdvance > 0) {
          advanceDate(daysToAdvance);
        }
      }
      
      toast({
        title: "⏱️ Full Time",
        description: `Final Score: ${simResult.homeScore} - ${simResult.awayScore}`,
      });
    } else {
      const engine = new MatchEngine(homeLineup, awayLineup, stadiumCapacity, homeReputation);
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);

      let minute = 0;
      let eventIndex = 0;
      const intervalTime = speed === 'fast' ? 200 : 1000;

      intervalRef.current = setInterval(() => {
        if (isPaused) return;
        
        minute += speed === 'fast' ? 2 : 1;
        setCurrentMinute(minute);

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

        while (eventIndex < simResult.events.length && simResult.events[eventIndex].minute <= minute) {
          const event = simResult.events[eventIndex];
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
          
          if (fixture) {
            const matchDate = new Date(fixture.date);
            const today = new Date();
            const daysToAdvance = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            if (daysToAdvance > 0) {
              advanceDate(daysToAdvance);
            }
          }
          
          toast({
            title: "⏱️ Full Time",
            description: `Final Score: ${simResult.homeScore} - ${simResult.awayScore}`,
          });
        }
      }, intervalTime);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "▶️ Match Resumed" : "⏸️ Match Paused",
    });
  };

  const changeSpeed = (newSpeed: 'normal' | 'fast') => {
    if (!isSimulating || !intervalRef.current) return;
    
    setSpeed(newSpeed);
    clearInterval(intervalRef.current);
    
    const engine = matchEngineRef.current;
    if (!engine || !result) return;

    let minute = currentMinute;
    let eventIndex = currentEventIndex;
    const intervalTime = newSpeed === 'fast' ? 200 : 1000;

    intervalRef.current = setInterval(() => {
      if (isPaused) return;
      
      minute += newSpeed === 'fast' ? 2 : 1;
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
        
        if (fixture) {
          const matchDate = new Date(fixture.date);
          const today = new Date();
          const daysToAdvance = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysToAdvance > 0) {
            advanceDate(daysToAdvance);
          }
        }
        
        toast({
          title: "⏱️ Full Time",
          description: `Final Score: ${result.homeScore} - ${result.awayScore}`,
        });
      }
    }, intervalTime);
  };

  const handleSubstitution = (playerOut: any, playerIn: any, team: 'home' | 'away') => {
    if (!matchEngineRef.current) return;

    matchEngineRef.current.makeSubstitution(playerOut.id, playerIn.id, team);
    
    if (team === 'home' && homeLineupState) {
      const updatedPlayers = homeLineupState.players.map(p =>
        p.id === playerOut.id ? { ...playerIn, ...p } : p
      );
      setHomeLineupState({ ...homeLineupState, players: updatedPlayers });
    } else if (team === 'away' && awayLineupState) {
      const updatedPlayers = awayLineupState.players.map(p =>
        p.id === playerOut.id ? { ...playerIn, ...p } : p
      );
      setAwayLineupState({ ...awayLineupState, players: updatedPlayers });
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

  const homeTeamName = fixture?.homeTeam || "Manchester City";
  const awayTeamName = fixture?.awayTeam || "Arsenal";
  const competition = fixture?.competition || "Premier League";
  const matchweek = fixture?.matchweek || 29;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/calendar')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <Badge variant="outline" className="mb-2">{competition}</Badge>
            <p className="text-sm text-muted-foreground">Matchweek {matchweek}</p>
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex-1 text-right">
              <h2 className="text-2xl font-bold mb-2">{homeTeamName}</h2>
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
              <h2 className="text-2xl font-bold mb-2">{awayTeamName}</h2>
              <p className="text-sm text-muted-foreground">4-4-2 • Defensive</p>
            </div>
          </div>

          {result && (
            <div className="mt-6">
              <Progress value={(currentMinute / 90) * 100} className="h-2" />
            </div>
          )}
        </Card>

        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
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
                    Play Match
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
              
              {result && currentMinute >= 90 && (
                <Button
                  onClick={() => navigate('/calendar')}
                  className="gap-2"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4" />
                  Continue to Calendar
                </Button>
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

        {result && eventsUpToCurrentMinute.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Latest Events</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {eventsUpToCurrentMinute.slice(-5).reverse().map((event, idx) => (
                <div
                  key={idx}
                  className="min-w-[200px] p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getEventIcon(event.type)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {event.minute}'
                    </Badge>
                  </div>
                  <p className="text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <PitchVisualization
                homeLineup={homeLineupState || homeLineup}
                awayLineup={awayLineupState || awayLineup}
                currentEvent={currentEvent}
                showHeatMap={showHeatMap}
              />
            </Card>

            <CrowdAtmosphere
              homeScore={currentHomeScore}
              awayScore={currentAwayScore}
              momentum={momentum}
              stadiumCapacity={stadiumCapacity}
              homeReputation={homeReputation}
            />
          </div>

          <div className="space-y-6">
            <PlayerPerformanceTracker
              homeLineup={homeLineupState || homeLineup}
              awayLineup={awayLineupState || awayLineup}
              events={eventsUpToCurrentMinute}
            />

            {isSimulating && (
              <>
                <TacticalAdjustmentPanel
                  team="home"
                  currentTactics={homeLineupState?.tactics || homeLineup.tactics}
                  onTacticsChange={(tactics) => handleTacticsChange('home', tactics)}
                />

                <SubstitutionPanel
                  team="home"
                  lineup={homeLineupState || homeLineup}
                  onSubstitution={(playerOut, playerIn) =>
                    handleSubstitution(playerOut, playerIn, 'home')
                  }
                />
              </>
            )}
          </div>
        </div>

        {result && (
          <Card className="mt-6 p-6">
            <MatchCommentary events={eventsUpToCurrentMinute} />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlayMatch;
