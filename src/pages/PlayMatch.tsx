import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import PitchVisualization from "@/components/PitchVisualization";
import SubstitutionPanel from "@/components/SubstitutionPanel";
import MatchCommentary from "@/components/MatchCommentary";
import PlayerPerformanceTracker from "@/components/PlayerPerformanceTracker";
import TacticalAdjustmentPanel from "@/components/TacticalAdjustmentPanel";
import CrowdAtmosphere from "@/components/CrowdAtmosphere";
import { MatchEventNotification } from "@/components/MatchEventNotification";
import { MomentumVisualizer } from "@/components/MomentumVisualizer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProbabilisticMatchEngine } from "@/services/probabilisticMatchEngine";
import { TeamLineup, SimulationResult, MatchEvent } from "@/types/match";
import { Play, Pause, ArrowLeft, Gauge, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSeason } from "@/contexts/SeasonContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentSave } from "@/hooks/useCurrentSave";

const PlayMatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { advanceDate, processMatchResult } = useSeason();
  const { currentSave } = useCurrentSave();
  const fixture = location.state?.fixture;
  
  const homeTeamName = fixture?.homeTeam || "Manchester City";
  const awayTeamName = fixture?.awayTeam || "Liverpool";
  const homeTeamId = fixture?.homeTeamId;
  const awayTeamId = fixture?.awayTeamId;
  const matchId = fixture?.id || "1";
  const competition = fixture?.competition || "Premier League";
  const [matchEnded, setMatchEnded] = useState(false);
  
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
  const [stadiumCapacity, setStadiumCapacity] = useState(60000);
  const [homeReputation, setHomeReputation] = useState(85);
  const [activeEventNotifications, setActiveEventNotifications] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const matchEngineRef = useRef<ProbabilisticMatchEngine | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real players from database
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!currentSave || !homeTeamId || !awayTeamId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch home team players
        const { data: homePlayers, error: homeError } = await supabase
          .from("save_players")
          .select(`
            *,
            players:player_id (*)
          `)
          .eq("save_id", currentSave.id)
          .eq("team_id", homeTeamId);

        // Fetch away team players
        const { data: awayPlayers, error: awayError } = await supabase
          .from("save_players")
          .select(`
            *,
            players:player_id (*)
          `)
          .eq("save_id", currentSave.id)
          .eq("team_id", awayTeamId);

        // Fetch team info
        const { data: homeTeamData } = await supabase
          .from("teams")
          .select("capacity, reputation")
          .eq("id", homeTeamId)
          .single();

        if (homeError || awayError) throw homeError || awayError;

        if (homeTeamData) {
          setStadiumCapacity(homeTeamData.capacity);
          setHomeReputation(homeTeamData.reputation);
        }

        // Map to TeamLineup format
        const homeLineup: TeamLineup = {
          formation: "4-2-3-1",
          players: (homePlayers || []).slice(0, 11).map((sp: any) => ({
            id: sp.player_id,
            name: sp.players.name,
            position: sp.players.position,
            overall: sp.players.overall,
            pace: sp.players.pace,
            shooting: sp.players.shooting,
            passing: sp.players.passing,
            defending: sp.players.defending,
            physical: sp.players.physical,
            fitness: sp.fitness,
            morale: sp.morale,
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
          players: (awayPlayers || []).slice(0, 11).map((sp: any) => ({
            id: sp.player_id,
            name: sp.players.name,
            position: sp.players.position,
            overall: sp.players.overall,
            pace: sp.players.pace,
            shooting: sp.players.shooting,
            passing: sp.players.passing,
            defending: sp.players.defending,
            physical: sp.players.physical,
            fitness: sp.fitness,
            morale: sp.morale,
          })),
          tactics: {
            mentality: 'defensive',
            tempo: 'slow',
            width: 'narrow',
            pressing: 'low',
          },
        };

        setHomeLineupState(homeLineup);
        setAwayLineupState(awayLineup);
        console.log('Lineups loaded:', {
          home: homeLineup.players.length,
          away: awayLineup.players.length
        });
      } catch (error) {
        console.error("Error fetching match data:", error);
        toast({
          title: "Error",
          description: "Failed to load match data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [currentSave, homeTeamId, awayTeamId]);

  const startSimulation = () => {
    console.log('Start simulation called');
    console.log('Home lineup state:', homeLineupState);
    console.log('Away lineup state:', awayLineupState);
    console.log('Home players count:', homeLineupState?.players.length);
    console.log('Away players count:', awayLineupState?.players.length);
    
    if (!homeLineupState || !awayLineupState) {
      console.error('Lineups not loaded!');
      toast({
        title: "Error",
        description: "Match data not loaded",
        variant: "destructive",
      });
      return;
    }
    
    if (homeLineupState.players.length < 11) {
      console.error('Not enough home players:', homeLineupState.players.length);
      toast({
        title: "Error",
        description: `Not enough home players (${homeLineupState.players.length}/11)`,
        variant: "destructive",
      });
      return;
    }
    
    if (awayLineupState.players.length < 11) {
      console.error('Not enough away players:', awayLineupState.players.length);
      toast({
        title: "Error",
        description: `Not enough away players (${awayLineupState.players.length}/11)`,
        variant: "destructive",
      });
      return;
    }

    console.log('Starting match simulation...');
    setIsSimulating(true);
    setIsPaused(false);
    toast({
      title: "⚽ Match Started",
    });

    if (speed === 'instant') {
      const engine = new ProbabilisticMatchEngine(
        homeLineupState,
        awayLineupState,
        stadiumCapacity,
        homeReputation,
        false // isDerby
      );
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);
      setCurrentMinute(90);
      setCurrentEventIndex(simResult.events.length);
      setIsSimulating(false);
      setMatchEnded(true);
      
      // Process match result to update standings and fixtures
      processMatchResult(matchId, homeTeamName, awayTeamName, simResult);
      
      // Advance calendar by 1 day
      advanceDate(1);
      
      toast({
        title: "⏱️ Full Time",
        description: `Final Score: ${homeTeamName} ${simResult.homeScore} - ${simResult.awayScore} ${awayTeamName}`,
        });
    } else {
      const engine = new ProbabilisticMatchEngine(
        homeLineupState,
        awayLineupState,
        stadiumCapacity,
        homeReputation,
        false // isDerby
      );
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
          
          // Show animated notification for important events
          if (['goal', 'yellow_card', 'red_card', 'shot_on_target', 'substitution'].includes(event.type)) {
            setActiveEventNotifications(prev => [...prev, event]);
          }
          
          eventIndex++;
        }

        if (minute >= 90) {
          clearInterval(intervalRef.current!);
          setIsSimulating(false);
          setMatchEnded(true);
          
          // Process match result to update standings and fixtures
          processMatchResult(matchId, homeTeamName, awayTeamName, simResult);
          
          // Advance calendar by 1 day
          advanceDate(1);
          
          toast({
            title: "⏱️ Full Time",
            description: `Final Score: ${homeTeamName} ${simResult.homeScore} - ${simResult.awayScore} ${awayTeamName}`,
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
          
          // Show animated notification for important events
          if (['goal', 'yellow_card', 'red_card', 'shot_on_target', 'substitution'].includes(event.type)) {
            setActiveEventNotifications(prev => [...prev, event]);
          }
          
          eventIndex++;
        }

      if (minute >= 90) {
        clearInterval(intervalRef.current!);
        setIsSimulating(false);
        setMatchEnded(true);
        
        // Process match result to update standings and fixtures
        processMatchResult(matchId, homeTeamName, awayTeamName, result);
        
        // Advance calendar by 1 day
        advanceDate(1);
        
        toast({
          title: "⏱️ Full Time",
          description: `Final Score: ${homeTeamName} ${result.homeScore} - ${result.awayScore} ${awayTeamName}`,
        });
      }
    }, intervalTime);
  };

  const handleSubstitution = (playerOut: any, playerIn: any, team: 'home' | 'away') => {
    // Note: ProbabilisticMatchEngine doesn't support live substitutions yet
    // This updates the UI state only
    
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
    
    toast({
      title: "Substitution Made",
      description: `${playerIn.name} replaces ${playerOut.name}`,
    });
  };

  const handleTacticsChange = (team: 'home' | 'away', newTactics: any) => {
    // Note: ProbabilisticMatchEngine doesn't support live tactics changes yet
    // This updates the UI state only
    
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
    
    toast({
      title: "Tactics Updated",
      description: `${team === 'home' ? homeTeamName : awayTeamName} tactics adjusted`,
    });
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

  const matchweek = fixture?.matchweek || 29;

  const handleEventNotificationComplete = (event: MatchEvent) => {
    setActiveEventNotifications(prev => prev.filter(e => e.id !== event.id));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading match data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in-up">
        {/* Event Notifications */}
        {activeEventNotifications.map((event, index) => (
          <div key={event.id} style={{ top: `${6 + index * 5}rem` }}>
            <MatchEventNotification
              event={event}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              onComplete={() => handleEventNotificationComplete(event)}
            />
          </div>
        ))}

        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/calendar')}
            className="gap-2 btn-glow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
        </div>

        <Card className="glass gaming-card p-6 mb-6 border-border/50">
          <div className="text-center mb-4">
            <Badge variant="outline" className="mb-2">{competition}</Badge>
            <p className="text-sm text-muted-foreground font-medium">Matchweek {matchweek}</p>
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex-1 text-right">
              <h2 className="text-3xl font-heading font-bold mb-2 gradient-text">{homeTeamName}</h2>
              <p className="text-sm text-muted-foreground">4-2-3-1 • Balanced</p>
            </div>

            <div className="px-8">
              {result ? (
                <div className="text-center">
                  <p className="score-display">
                    {currentHomeScore} - {currentAwayScore}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-semibold">
                    {currentMinute < 90 ? `${currentMinute}'` : "FT"}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl font-heading font-bold text-muted-foreground">vs</p>
                </div>
              )}
            </div>

            <div className="flex-1 text-left">
              <h2 className="text-3xl font-heading font-bold mb-2 gradient-text">{awayTeamName}</h2>
              <p className="text-sm text-muted-foreground">4-4-2 • Defensive</p>
            </div>
          </div>

          {result && (
            <div className="mt-6">
              <Progress value={(currentMinute / 90) * 100} className="h-3 bg-muted/30" />
            </div>
          )}
        </Card>

        <Card className="glass gaming-card p-4 mb-6 border-border/50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {!result && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant={speed === 'normal' ? 'default' : 'outline'}
                      onClick={() => setSpeed('normal')}
                      size="sm"
                      className="font-heading"
                    >
                      Normal
                    </Button>
                    <Button
                      variant={speed === 'fast' ? 'default' : 'outline'}
                      onClick={() => setSpeed('fast')}
                      size="sm"
                      className="font-heading"
                    >
                      Fast
                    </Button>
                    <Button
                      variant={speed === 'instant' ? 'default' : 'outline'}
                      onClick={() => setSpeed('instant')}
                      size="sm"
                      className="font-heading"
                    >
                      Instant
                    </Button>
                  </div>

                  <Button
                    onClick={startSimulation}
                    disabled={isSimulating || loading || !homeLineupState || !awayLineupState}
                    className="gap-2 btn-glow font-heading"
                  >
                    <Play className="h-4 w-4" />
                    {loading ? 'Loading...' : 'Play Match'}
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
              
              {result && matchEnded && (
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
              {homeLineupState && awayLineupState && (
                <PitchVisualization
                  homeLineup={homeLineupState}
                  awayLineup={awayLineupState}
                  currentEvent={currentEvent}
                  currentMinute={currentMinute}
                  isPlaying={isSimulating && !isPaused}
                  showHeatMap={showHeatMap}
                />
              )}
            </Card>

            <CrowdAtmosphere
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              currentEvent={currentEvent}
              currentMinute={currentMinute}
              homeScore={currentHomeScore}
              awayScore={currentAwayScore}
              stadiumCapacity={stadiumCapacity}
              homeReputation={homeReputation}
            />
          </div>

          <div className="space-y-6">
            {/* Momentum Visualizer */}
            {result && isSimulating && (
              <MomentumVisualizer
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
                homeMomentum={momentum.home}
                awayMomentum={momentum.away}
                currentMinute={currentMinute}
              />
            )}

            <PlayerPerformanceTracker
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              homePlayers={result?.playerPerformance.home || []}
              awayPlayers={result?.playerPerformance.away || []}
            />

            {isSimulating && (
              <>
                <TacticalAdjustmentPanel
                  team="home"
                  teamName={homeTeamName}
                  currentTactics={homeLineupState ? {
                    formation: homeLineupState.formation,
                    ...homeLineupState.tactics
                  } : undefined}
                  onTacticsChange={(tactics) => handleTacticsChange('home', tactics)}
                  isMatchRunning={isSimulating}
                />

                {homeLineupState && (
                  <SubstitutionPanel
                    team="home"
                    teamName={homeTeamName}
                    players={homeLineupState.players}
                    onSubstitute={(playerOutId, playerInId) => {
                      const playerOut = homeLineupState.players.find(p => p.id === playerOutId);
                      const playerIn = homeLineupState.players.find(p => p.id === playerInId);
                      if (playerOut && playerIn) {
                        handleSubstitution(playerOut, playerIn, 'home');
                      }
                    }}
                    substitutionsRemaining={3}
                    isMatchRunning={isSimulating}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {result && (
          <Card className="mt-6 p-6">
            <MatchCommentary 
              events={eventsUpToCurrentMinute}
              currentMinute={currentMinute}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              momentum={momentum}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlayMatch;
