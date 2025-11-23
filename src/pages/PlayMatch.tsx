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
import { AttackDefenseBar } from "@/components/AttackDefenseBar";
import { MatchResultSummary } from "@/components/MatchResultSummary";
import { HalfTimeModal } from "@/components/HalfTimeModal";
import { GoalCelebration } from "@/components/GoalCelebration";
import { TenseMomentEffect } from "@/components/TenseMomentEffect";
import { TeamLogo } from "@/components/TeamLogo";
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
import { matchSounds } from "@/services/matchSoundEffects";

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
  
  // Determine if user's team is home or away
  const isHome = currentSave?.team_id === homeTeamId;
  const userTeamName = isHome ? homeTeamName : awayTeamName;
  const opponentTeamName = isHome ? awayTeamName : homeTeamName;
  
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
  const [showResultSummary, setShowResultSummary] = useState(false);
  const [showHalfTime, setShowHalfTime] = useState(false);
  const [plannedSubstitutions, setPlannedSubstitutions] = useState<any[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<any[]>([]);
  const [goalCelebration, setGoalCelebration] = useState<{ team: 'home' | 'away'; playerName: string } | null>(null);
  const [tenseMoment, setTenseMoment] = useState<'close_call' | 'final_minutes' | 'dangerous_attack' | null>(null);
  const [teamColors, setTeamColors] = useState<{ home: { primary: string; secondary: string }; away: { primary: string; secondary: string } }>({
    home: { primary: '#22c55e', secondary: '#ffffff' },
    away: { primary: '#3b82f6', secondary: '#ffffff' }
  });
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
          .select("capacity, reputation, primary_color, secondary_color")
          .eq("id", homeTeamId)
          .single();

        const { data: awayTeamData } = await supabase
          .from("teams")
          .select("primary_color, secondary_color")
          .eq("id", awayTeamId)
          .single();

        if (homeError || awayError) throw homeError || awayError;

        if (homeTeamData) {
          setStadiumCapacity(homeTeamData.capacity);
          setHomeReputation(homeTeamData.reputation);
          setTeamColors(prev => ({
            ...prev,
            home: {
              primary: homeTeamData.primary_color,
              secondary: homeTeamData.secondary_color
            }
          }));
        }

        if (awayTeamData) {
          setTeamColors(prev => ({
            ...prev,
            away: {
              primary: awayTeamData.primary_color,
              secondary: awayTeamData.secondary_color
            }
          }));
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

        // Store bench players (next 7 players after starting 11) for user's team
        const userPlayers = isHome ? homePlayers : awayPlayers;
        const bench = (userPlayers || []).slice(11, 18).map((sp: any) => ({
          id: sp.player_id,
          name: sp.players.name,
          position: sp.players.position,
        }));
        setBenchPlayers(bench);

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
      
      setShowResultSummary(true);
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

        // Show half-time modal at minute 45 but keep match running
        if (minute === 45 && !showHalfTime) {
          setShowHalfTime(true);
        }

        // Execute planned substitutions
        plannedSubstitutions.forEach((sub) => {
          if (sub.minute === minute || (sub.minute === 'auto' && minute >= 60 && minute <= 75 && Math.random() < 0.1)) {
            // Execute substitution
            toast({
              title: "Substitution",
              description: `${sub.playerIn} replaces ${sub.playerOut}`,
            });
          }
        });

        // Update momentum from simulation data
        if (simResult.momentumByMinute[minute] !== undefined) {
          const engineMomentum = simResult.momentumByMinute[minute];
          // Convert -100 to +100 range to home/away attack percentages
          const homeAttackPercentage = Math.min(80, Math.max(20, 50 + engineMomentum * 0.3));
          const awayAttackPercentage = Math.min(80, Math.max(20, 50 - engineMomentum * 0.3));
          
          setMomentum({
            home: homeAttackPercentage,
            away: awayAttackPercentage
          });
        }
        if (simResult.momentumByMinute[minute] !== undefined) {
          const engineMomentum = simResult.momentumByMinute[minute];
          // Convert -100 to +100 range to home/away attack percentages
          const homeAttackPercentage = Math.min(80, Math.max(20, 50 + engineMomentum * 0.3));
          const awayAttackPercentage = Math.min(80, Math.max(20, 50 - engineMomentum * 0.3));
          
          setMomentum({
            home: homeAttackPercentage,
            away: awayAttackPercentage
          });
        }

        while (eventIndex < simResult.events.length && simResult.events[eventIndex].minute <= minute) {
          const event = simResult.events[eventIndex];
          setCurrentEventIndex(eventIndex);
          
          // Play sound effects and visual effects
          if (event.type === 'goal') {
            matchSounds.goal();
            setGoalCelebration({
              team: event.team,
              playerName: event.player || 'Unknown'
            });
          } else if (event.type === 'shot_on_target') {
            matchSounds.shotOnTarget();
            if (Math.random() < 0.3) { // 30% chance for tense moment
              setTenseMoment('close_call');
            }
          } else if (event.type === 'shot') {
            matchSounds.missedShot();
          } else if (event.type === 'yellow_card') {
            matchSounds.yellowCard();
          } else if (event.type === 'red_card') {
            matchSounds.redCard();
          } else if (event.type === 'save') {
            matchSounds.save();
            setTenseMoment('dangerous_attack');
          } else if (event.type === 'corner') {
            matchSounds.corner();
          }

          // Final minutes tension
          if (minute >= 85 && minute <= 90 && event.type === 'shot_on_target') {
            setTenseMoment('final_minutes');
          }
          
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
          
          setShowResultSummary(true);
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

  const handleSubstitution = (playerOut: any, playerIn: any) => {
    // Apply substitution to user's team
    if (isHome && homeLineupState) {
      const updatedPlayers = homeLineupState.players.map(p =>
        p.id === playerOut.id ? { ...playerIn, ...p } : p
      );
      setHomeLineupState({ ...homeLineupState, players: updatedPlayers });
    } else if (!isHome && awayLineupState) {
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
    // Apply tactics to user's team
    if (isHome && homeLineupState) {
      setHomeLineupState({
        ...homeLineupState,
        tactics: { ...homeLineupState.tactics, ...adjustment }
      });
    } else if (!isHome && awayLineupState) {
      setAwayLineupState({
        ...awayLineupState,
        tactics: { ...awayLineupState.tactics, ...adjustment }
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

  const handleContinueToNextMatch = async () => {
    advanceDate(1);
    setShowResultSummary(false);
    
    // Navigate to dashboard after match completion
    navigate("/dashboard");
    
    toast({
      title: "✅ Match Complete",
      description: "Returning to dashboard",
    });
  };

  const handleHalfTimeContinue = (substitutions: any[], tacticsChanges: any) => {
    setPlannedSubstitutions(substitutions);
    
    // Apply tactical changes to user's team
    const userLineup = isHome ? homeLineupState : awayLineupState;
    const setUserLineup = isHome ? setHomeLineupState : setAwayLineupState;
    
    if (userLineup && Object.keys(tacticsChanges).length > 0) {
      const updatedLineup = { ...userLineup };
      
      // Update formation if changed
      if (tacticsChanges.formation) {
        updatedLineup.formation = tacticsChanges.formation;
      }
      
      // Update tactics
      updatedLineup.tactics = { ...userLineup.tactics };
      if (tacticsChanges.mentality) updatedLineup.tactics.mentality = tacticsChanges.mentality;
      if (tacticsChanges.tempo) updatedLineup.tactics.tempo = tacticsChanges.tempo;
      if (tacticsChanges.width) updatedLineup.tactics.width = tacticsChanges.width;
      if (tacticsChanges.pressing) updatedLineup.tactics.pressing = tacticsChanges.pressing;
      
      setUserLineup(updatedLineup);
    }
    
    setShowHalfTime(false);
    
    toast({
      title: "Second Half Started",
      description: `${substitutions.length > 0 ? `${substitutions.length} substitution(s) planned. ` : ''}${Object.keys(tacticsChanges).length > 0 ? 'Tactical changes applied.' : 'No changes made.'}`,
    });
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
        {/* Tense Moment Effects */}
        {tenseMoment && (
          <TenseMomentEffect
            type={tenseMoment}
            onComplete={() => setTenseMoment(null)}
          />
        )}

        {/* Goal Celebration */}
        {goalCelebration && (
          <GoalCelebration
            team={goalCelebration.team}
            playerName={goalCelebration.playerName}
            onComplete={() => setGoalCelebration(null)}
          />
        )}

        {/* Half Time Modal */}
        {result && showHalfTime && (isHome ? homeLineupState : awayLineupState) && (
          <HalfTimeModal
            homeTeam={homeTeamName}
            awayTeam={awayTeamName}
            partialResult={{
              homeScore: result.events.filter(e => e.type === 'goal' && e.team === 'home' && e.minute <= 45).length,
              awayScore: result.events.filter(e => e.type === 'goal' && e.team === 'away' && e.minute <= 45).length,
              events: result.events.filter(e => e.minute <= 45),
              stats: {
                possession: result.stats.possession,
                shotsOnTarget: result.stats.shotsOnTarget,
                corners: result.stats.corners,
              },
            }}
            availablePlayers={benchPlayers}
            currentPlayers={(isHome ? homeLineupState : awayLineupState)!.players.map(p => ({
              id: p.id,
              name: p.name,
              position: p.position,
            }))}
            currentTactics={{
              formation: (isHome ? homeLineupState : awayLineupState)!.formation,
              mentality: (isHome ? homeLineupState : awayLineupState)!.tactics.mentality,
              tempo: (isHome ? homeLineupState : awayLineupState)!.tactics.tempo,
              width: (isHome ? homeLineupState : awayLineupState)!.tactics.width,
              pressing: (isHome ? homeLineupState : awayLineupState)!.tactics.pressing,
            }}
            open={showHalfTime}
            onContinue={handleHalfTimeContinue}
          />
        )}

        {/* Match Result Summary Modal */}
        {result && (
          <MatchResultSummary
            homeTeam={homeTeamName}
            awayTeam={awayTeamName}
            result={result}
            open={showResultSummary}
            onContinue={handleContinueToNextMatch}
          />
        )}

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

        {/* Main Layout: 3 Columns */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 flex-1 min-h-0">
          {/* Left Column: Match Result + Controls + Tactics */}
          <div className="space-y-2 overflow-auto">
            {/* Match Header */}
            <Card className="glass p-2 border-border/50 flex-shrink-0">
            <div className="flex flex-col items-center mb-1">
              <TeamLogo
                teamName={homeTeamName}
                primaryColor={teamColors.home.primary}
                secondaryColor={teamColors.home.secondary}
                size="sm"
                className="mb-1"
              />
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
            <div className="flex flex-col items-center mt-1">
              <TeamLogo
                teamName={awayTeamName}
                primaryColor={teamColors.away.primary}
                secondaryColor={teamColors.away.secondary}
                size="sm"
                className="mb-1"
              />
              <h3 className="text-sm font-heading font-bold">{awayTeamName}</h3>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
          </Card>

            {/* Controls */}
            <Card className="glass p-2 border-border/50 flex-shrink-0">
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

            {/* Tactics */}
            {(isHome ? homeLineupState : awayLineupState) && (
              <Card className="glass p-2 border-border/50">
                <h3 className="text-xs font-heading font-semibold mb-2">Tactics - {userTeamName}</h3>
                <TacticalAdjustmentPanel 
                  team={isHome ? "home" : "away"}
                  teamName={userTeamName}
                  currentTactics={{
                    formation: (isHome ? homeLineupState : awayLineupState)!.formation,
                    mentality: (isHome ? homeLineupState : awayLineupState)!.tactics.mentality as any,
                    tempo: (isHome ? homeLineupState : awayLineupState)!.tactics.tempo as any,
                    width: (isHome ? homeLineupState : awayLineupState)!.tactics.width as any,
                    pressing: (isHome ? homeLineupState : awayLineupState)!.tactics.pressing as any,
                  }}
                  onTacticsChange={handleTacticalAdjustment}
                  isMatchRunning={isSimulating}
                />
              </Card>
            )}
          </div>

          {/* Center Column: Pitch + Atmosphere */}
          <div className="space-y-2 overflow-auto">
            <Card className="glass p-2 border-border/50 flex-shrink-0">
            {homeLineupState && awayLineupState && (
              <PitchVisualization
                homeLineup={homeLineupState}
                awayLineup={awayLineupState}
                currentMinute={currentMinute}
                isPlaying={isSimulating && !isPaused}
                currentEvent={result?.events[currentEventIndex]}
                attackMomentum={momentum}
                homeColor={teamColors.home.primary}
                awayColor={teamColors.away.primary}
                homeSecondaryColor={teamColors.home.secondary}
                awaySecondaryColor={teamColors.away.secondary}
              />
              )}
            </Card>

            {/* Atmosphere */}
            <Card className="glass p-2 border-border/50">
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
            </Card>
          </div>

          {/* Right Column: Match Events + Substitutions */}
          <div className="space-y-2 overflow-auto">
            <Card className="glass p-2 border-border/50 flex-shrink-0">
            <h3 className="text-xs font-heading font-semibold mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-accent" />
              Match Events
            </h3>
            <div className="h-[240px]">
              <MatchCommentary 
                events={events} 
                currentMinute={currentMinute}
                homeTeam={homeTeamName}
                awayTeam={awayTeamName}
                momentum={momentum}
                />
              </div>
            </Card>

            {/* Attack/Defense */}
            <Card className="glass p-2 border-border/50 flex-shrink-0">
              <h3 className="text-xs font-heading font-semibold mb-2">Attack/Defense</h3>
              <AttackDefenseBar 
                homeTeam={isHome ? userTeamName : opponentTeamName}
                awayTeam={isHome ? opponentTeamName : userTeamName}
                homeAttack={isHome ? momentum.home : momentum.away}
                awayAttack={isHome ? momentum.away : momentum.home}
                currentMinute={currentMinute}
                homeColor={isHome ? teamColors.home.primary : teamColors.away.primary}
                awayColor={isHome ? teamColors.away.primary : teamColors.home.primary}
              />
            </Card>

            {/* Substitutions */}
            {(isHome ? homeLineupState : awayLineupState) && (
              <Card className="glass p-2 border-border/50">
                <h3 className="text-xs font-heading font-semibold mb-2">Substitutions - {userTeamName}</h3>
                <SubstitutionPanel 
                  team={isHome ? "home" : "away"}
                  teamName={userTeamName}
                  players={(isHome ? homeLineupState : awayLineupState)!.players}
                  onSubstitute={(playerOutId, playerInId) => {
                    const userLineup = isHome ? homeLineupState : awayLineupState;
                    const playerOut = userLineup!.players.find(p => p.id === playerOutId);
                    const playerIn = userLineup!.players.find(p => p.id === playerInId);
                    if (playerOut && playerIn) {
                      handleSubstitution(playerOut, playerIn);
                    }
                  }}
                  substitutionsRemaining={3}
                  isMatchRunning={isSimulating}
                />
              </Card>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayMatch;
