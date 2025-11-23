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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProbabilisticMatchEngine } from "@/services/probabilisticMatchEngine";
import { TeamLineup, SimulationResult, MatchEvent } from "@/types/match";
import { Play, Pause, FastForward, Zap, Activity, Clock, CheckCircle, ArrowRight } from "lucide-react";
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
    if (!homeLineupState || !awayLineupState) {
      toast({
        title: "Error",
        description: "Match data not loaded",
        variant: "destructive",
      });
      return;
    }
    
    if (homeLineupState.players.length < 11 || awayLineupState.players.length < 11) {
      toast({
        title: "Error",
        description: `Not enough players`,
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setIsPaused(false);
    toast({ title: "⚽ Match Started" });

    if (speed === 'instant') {
      const engine = new ProbabilisticMatchEngine(
        homeLineupState,
        awayLineupState,
        stadiumCapacity,
        homeReputation,
        false
      );
      matchEngineRef.current = engine;
      const simResult = engine.simulate();
      setResult(simResult);
      setCurrentMinute(90);
      setCurrentEventIndex(simResult.events.length);
      setIsSimulating(false);
      setMatchEnded(true);
      
      processMatchResult(matchId, homeTeamName, awayTeamName, simResult);
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
        false
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
          
          if (['goal', 'yellow_card', 'red_card', 'shot_on_target', 'substitution'].includes(event.type)) {
            setActiveEventNotifications(prev => [...prev, event]);
          }
          
          eventIndex++;
        }

        if (minute >= 90) {
          clearInterval(intervalRef.current!);
          setIsSimulating(false);
          setMatchEnded(true);
          
          processMatchResult(matchId, homeTeamName, awayTeamName, simResult);
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

  const handleSubstitution = (playerOut: any, playerIn: any, team: 'home' | 'away') => {
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

  const handleTacticalAdjustment = (adjustment: any) => {
    if (homeLineupState) {
      setHomeLineupState({
        ...homeLineupState,
        tactics: { ...homeLineupState.tactics, ...adjustment }
      });
    }
    
    toast({
      title: "Tactics Updated",
      description: `Tactical adjustment applied`,
    });
  };

  const eventsUpToCurrentMinute = result?.events.filter(e => e.minute <= currentMinute) || [];
  const events = result?.events || [];

  const currentHomeScore = eventsUpToCurrentMinute.filter(
    e => e.type === 'goal' && e.team === 'home'
  ).length;

  const currentAwayScore = eventsUpToCurrentMinute.filter(
    e => e.type === 'goal' && e.team === 'away'
  ).length;

  const handleEventNotificationComplete = (event: MatchEvent) => {
    setActiveEventNotifications(prev => prev.filter(e => e.id !== event.id));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading match data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-screen overflow-hidden p-2 flex flex-col">
        {/* Event Notifications */}
        {activeEventNotifications.map((event, index) => (
          <div key={event.id} style={{ top: `${4 + index * 4}rem` }}>
            <MatchEventNotification
              event={event}
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              onComplete={() => handleEventNotificationComplete(event)}
            />
          </div>
        ))}

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-heading font-bold gradient-text">Play Match</h1>
          <Badge variant="outline" className="text-xs">{competition}</Badge>
        </div>

        {/* Top Section: Score, Pitch, Events - All visible without scrolling */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 mb-2 flex-shrink-0">
          {/* Left Column: Match Result + Controls */}
          <div className="space-y-2">
            {/* Match Header */}
            <Card className="glass p-2 border-border/50">
            <div className="text-center mb-1">
              <h3 className="text-sm font-heading font-bold">{homeTeamName}</h3>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-heading font-bold gradient-text">{currentHomeScore}</span>
                <span className="text-lg text-muted-foreground">-</span>
                <span className="text-2xl font-heading font-bold gradient-text">{currentAwayScore}</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-accent" />
                <p className="text-xs font-medium text-accent">{currentMinute}'</p>
              </div>
              {result && <Badge variant="secondary" className="mt-1 text-xs">Full Time</Badge>}
            </div>
            <div className="text-center mt-1">
              <h3 className="text-sm font-heading font-bold">{awayTeamName}</h3>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
          </Card>

          {/* Controls */}
          <Card className="glass p-2 border-border/50">
            <h3 className="text-xs font-heading font-semibold mb-2">Controls</h3>
            <div className="space-y-1.5">
              {!result && (
                <>
                  <div className="flex gap-1">
                    <Button variant={speed === 'normal' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('normal')} className="flex-1 text-xs h-7">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button variant={speed === 'fast' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('fast')} className="flex-1 text-xs h-7">
                      <FastForward className="h-3 w-3" />
                    </Button>
                    <Button variant={speed === 'instant' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('instant')} className="flex-1 text-xs h-7">
                      <Zap className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button onClick={togglePause} variant="outline" size="sm" className="w-full gap-1 text-xs h-7">
                    {isPaused ? <><Play className="h-3 w-3" />Resume</> : <><Pause className="h-3 w-3" />Pause</>}
                  </Button>
                </>
              )}
              <Button onClick={startSimulation} disabled={isSimulating || loading || !homeLineupState || !awayLineupState} className="w-full gap-1 btn-glow text-xs h-7">
                <Play className="h-3 w-3" />
                {loading ? 'Loading...' : 'Play Match'}
              </Button>
              {result && (
                <Button onClick={() => navigate('/calendar')} className="w-full gap-1 text-xs h-7">
                  <ArrowRight className="h-3 w-3" />
                  Next Match
                </Button>
              )}
            </div>
          </Card>
        </div>

          {/* Center: Pitch Visualization */}
          <Card className="glass p-2 border-border/50">
            {homeLineupState && awayLineupState && (
              <PitchVisualization
                homeLineup={homeLineupState}
                awayLineup={awayLineupState}
                currentMinute={currentMinute}
                isPlaying={isSimulating && !isPaused}
              />
            )}
          </Card>

          {/* Right: Match Events */}
          <Card className="glass p-2 border-border/50">
            <h3 className="text-xs font-heading font-semibold mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-accent" />
              Match Events
            </h3>
            <ScrollArea className="h-[240px]">
              <MatchCommentary 
                events={events} 
                currentMinute={currentMinute}
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
                momentum={momentum}
              />
            </ScrollArea>
          </Card>
        </div>

        {/* Bottom Section: Tactics, Substitutions, Atmosphere */}
        <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
          {/* Tactics */}
          {homeLineupState && (
            <Card className="glass p-2 border-border/50 overflow-auto">
              <h3 className="text-xs font-heading font-semibold mb-2">Tactics</h3>
              <TacticalAdjustmentPanel 
                team="home"
                teamName={homeTeamName}
                currentTactics={{
                  formation: homeLineupState.formation,
                  mentality: homeLineupState.tactics.mentality as any,
                  tempo: homeLineupState.tactics.tempo as any,
                  width: homeLineupState.tactics.width as any,
                  pressing: homeLineupState.tactics.pressing as any,
                }}
                onTacticsChange={handleTacticalAdjustment}
                isMatchRunning={isSimulating}
              />
            </Card>
          )}

          {/* Substitutions */}
          {homeLineupState && (
            <Card className="glass p-2 border-border/50 overflow-auto">
              <h3 className="text-xs font-heading font-semibold mb-2">Substitutions</h3>
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
            </Card>
          )}

          {/* Crowd & Momentum */}
          <Card className="glass p-2 border-border/50 overflow-auto">
            <h3 className="text-xs font-heading font-semibold mb-2">Atmosphere</h3>
            <CrowdAtmosphere 
              homeTeam={homeTeamName}
              awayTeam={awayTeamName}
              currentMinute={currentMinute}
              homeScore={currentHomeScore}
              awayScore={currentAwayScore}
              stadiumCapacity={stadiumCapacity}
              homeReputation={homeReputation}
            />
            <div className="mt-2">
              <h4 className="text-xs font-semibold mb-1">Momentum</h4>
              <MomentumVisualizer 
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
                homeMomentum={momentum.home}
                awayMomentum={momentum.away}
                currentMinute={currentMinute}
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayMatch;
