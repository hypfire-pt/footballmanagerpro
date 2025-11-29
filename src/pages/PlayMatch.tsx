import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import PitchVisualization from "@/components/PitchVisualization";
import SubstitutionPanel from "@/components/SubstitutionPanel";
import MatchCommentary from "@/components/MatchCommentary";
import PlayerPerformanceTracker from "@/components/PlayerPerformanceTracker";
import TacticalAdjustmentPanel from "@/components/TacticalAdjustmentPanel";
import CrowdAtmosphere from "@/components/CrowdAtmosphere";
import MatchEventOverlay from "@/components/MatchEventOverlay";
import { MatchEventNotifications } from "@/components/MatchEventNotification";
import { ImprovedAttackDefenseBar } from "@/components/ImprovedAttackDefenseBar";
import { MatchResultSummary } from "@/components/MatchResultSummary";
import { GoalCelebration } from "@/components/GoalCelebration";
import { TenseMomentEffect } from "@/components/TenseMomentEffect";
import { TeamLogo } from "@/components/TeamLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamLineup, SimulationResult, MatchEvent } from "@/types/match";
import { Play, Pause, FastForward, Zap, Activity, Clock, CheckCircle, ArrowRight, Sparkles, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSeason } from "@/contexts/SeasonContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { matchSounds } from "@/services/matchSoundEffects";
import { HybridMatchEngine } from "@/services/hybridMatchEngine";

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
  const [benchPlayers, setBenchPlayers] = useState<any[]>([]);
  const [goalCelebration, setGoalCelebration] = useState<{ team: 'home' | 'away'; playerName: string } | null>(null);
  const [tenseMoment, setTenseMoment] = useState<'close_call' | 'final_minutes' | 'dangerous_attack' | null>(null);
  const [currentOverlay, setCurrentOverlay] = useState<{ type: 'goal' | 'yellow_card' | 'red_card' | 'shot' | 'save'; playerName: string; team: string } | null>(null);
  const [teamColors, setTeamColors] = useState<{ home: { primary: string; secondary: string; logoUrl?: string }; away: { primary: string; secondary: string; logoUrl?: string } }>({
    home: { primary: '#22c55e', secondary: '#ffffff' },
    away: { primary: '#3b82f6', secondary: '#ffffff' }
  });
  const [stadiumImageUrl, setStadiumImageUrl] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef(speed);
  const isPausedRef = useRef(isPaused);
  const minuteRef = useRef(0);
  const eventIndexRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Restart interval when speed changes during simulation
  useEffect(() => {
    if (isSimulating && !isPaused && intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
      // The interval will be restarted on the next tick with the new speed
    }
  }, [speed, isSimulating, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

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
          .select("capacity, reputation, primary_color, secondary_color, logo_url, stadium_image_url")
          .eq("id", homeTeamId)
          .single();

        const { data: awayTeamData } = await supabase
          .from("teams")
          .select("primary_color, secondary_color, logo_url")
          .eq("id", awayTeamId)
          .single();

        if (homeError || awayError) throw homeError || awayError;

        if (homeTeamData) {
          setStadiumCapacity(homeTeamData.capacity);
          setHomeReputation(homeTeamData.reputation);
          setStadiumImageUrl(homeTeamData.stadium_image_url || '');
          setTeamColors(prev => ({
            ...prev,
            home: {
              primary: homeTeamData.primary_color,
              secondary: homeTeamData.secondary_color,
              logoUrl: homeTeamData.logo_url || undefined
            }
          }));
        }

        if (awayTeamData) {
          setTeamColors(prev => ({
            ...prev,
            away: {
              primary: awayTeamData.primary_color,
              secondary: awayTeamData.secondary_color,
              logoUrl: awayTeamData.logo_url || undefined
            }
          }));
        }

        // Load saved tactics from TacticsPage
        const savedTacticsRaw = localStorage.getItem('savedTactics');
        let userTactics: {
          mentality: 'balanced' | 'attacking' | 'defensive';
          tempo: 'standard' | 'fast' | 'slow';
          width: 'standard' | 'wide' | 'narrow';
          pressing: 'medium' | 'high' | 'low';
        } = {
          mentality: 'balanced',
          tempo: 'standard',
          width: 'standard',
          pressing: 'medium',
        };

        if (savedTacticsRaw) {
          try {
            const savedTactics = JSON.parse(savedTacticsRaw);
            // Convert slider values to match engine format
            const mentalityValue = savedTactics.mentality || 50;
            const tempoValue = savedTactics.tempo || 50;
            const widthValue = savedTactics.width || 50;
            const pressingValue = savedTactics.pressing || 50;

            userTactics = {
              mentality: mentalityValue < 40 ? 'defensive' : mentalityValue < 60 ? 'balanced' : 'attacking',
              tempo: tempoValue < 33 ? 'slow' : tempoValue < 67 ? 'standard' : 'fast',
              width: widthValue < 33 ? 'narrow' : widthValue < 67 ? 'standard' : 'wide',
              pressing: pressingValue < 33 ? 'low' : pressingValue < 67 ? 'medium' : 'high',
            };
          } catch (e) {
            console.error('Failed to parse saved tactics', e);
          }
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
          tactics: isHome ? userTactics : {
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
          tactics: !isHome ? userTactics : {
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

  const startSimulation = async () => {
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
    toast({ 
      title: "⚽ Match Started", 
      description: '🎯 Hybrid Mode: Math Engine + AI Commentary'
    });

    // Use Hybrid Engine (Math + AI)
    if (speed === 'instant') {
      try {
        const hybridResult = await HybridMatchEngine.simulate(
          homeLineupState,
          awayLineupState,
          homeTeamName,
          awayTeamName,
          stadiumCapacity,
          homeReputation,
          false
        );
        
        setResult(hybridResult);
        setCurrentMinute(90);
        setCurrentEventIndex(hybridResult.events.length);
        setIsSimulating(false);
        setMatchEnded(true);
        
        processMatchResult(matchId, homeTeamName, awayTeamName, hybridResult);
        
        setShowResultSummary(true);
      } catch (error) {
        console.error('Hybrid simulation error:', error);
        toast({
          title: "Error",
          description: "Match simulation failed",
          variant: "destructive",
        });
        setIsSimulating(false);
      }
    } else {
      // Animated hybrid simulation
      startHybridSimulation();
    }
  };

  const startHybridSimulation = async () => {
    if (!homeLineupState || !awayLineupState) return;

    try {
      // Generate full match result using hybrid engine
      const hybridResult = await HybridMatchEngine.simulate(
        homeLineupState,
        awayLineupState,
        homeTeamName,
        awayTeamName,
        stadiumCapacity,
        homeReputation,
        false
      );
      
      setResult(hybridResult);

      // Reset refs
      minuteRef.current = 0;
      eventIndexRef.current = 0;

      const updateMatch = () => {
        // Always check the current ref values for pause and speed
        if (isPausedRef.current) {
          // When paused, keep scheduling to check for resume
          scheduleNext();
          return;
        }

        // Increment minute based on current speed
        const increment = speedRef.current === 'fast' ? 2 : 1;
        minuteRef.current += increment;
        setCurrentMinute(minuteRef.current);
        
        console.log('[Clock Debug]', {
          minute: minuteRef.current,
          isPaused: isPausedRef.current,
          speed: speedRef.current
        });

        // Update momentum from simulation data
        if (hybridResult.momentumByMinute[minuteRef.current] !== undefined) {
          const engineMomentum = hybridResult.momentumByMinute[minuteRef.current];
          const homeAttackPercentage = Math.min(80, Math.max(20, 50 + engineMomentum * 0.3));
          const awayAttackPercentage = Math.min(80, Math.max(20, 50 - engineMomentum * 0.3));
          
          setMomentum({
            home: homeAttackPercentage,
            away: awayAttackPercentage
          });
        }

        // Process events for current minute
        while (eventIndexRef.current < hybridResult.events.length && hybridResult.events[eventIndexRef.current].minute <= minuteRef.current) {
          const event = hybridResult.events[eventIndexRef.current];
          setCurrentEventIndex(eventIndexRef.current);
          
          // Update momentum dynamically based on events
          if (event.type === 'goal' || event.type === 'shot_on_target') {
            setMomentum(prev => {
              if (event.team === 'home') {
                return { home: Math.min(85, prev.home + 12), away: Math.max(15, prev.away - 12) };
              } else {
                return { home: Math.max(15, prev.home - 12), away: Math.min(85, prev.away + 12) };
              }
            });
          } else if (event.type === 'save') {
            setMomentum(prev => {
              if (event.team === 'home') {
                return { home: Math.max(20, prev.home - 8), away: Math.min(80, prev.away + 8) };
              } else {
                return { home: Math.min(80, prev.home + 8), away: Math.max(20, prev.away - 8) };
              }
            });
          } else if (event.type === 'corner') {
            setMomentum(prev => {
              if (event.team === 'home') {
                return { home: Math.min(75, prev.home + 5), away: Math.max(25, prev.away - 5) };
              } else {
                return { home: Math.max(25, prev.home - 5), away: Math.min(75, prev.away + 5) };
              }
            });
          }
          
          // Play sound effects and visual overlays
          if (event.type === 'goal') {
            matchSounds.goal();
            setCurrentOverlay({
              type: 'goal',
              playerName: event.player || 'Unknown',
              team: event.team === 'home' ? homeTeamName : awayTeamName
            });
          } else if (event.type === 'shot_on_target') {
            matchSounds.shotOnTarget();
          } else if (event.type === 'shot') {
            matchSounds.missedShot();
            if (Math.random() < 0.4) {
              setCurrentOverlay({
                type: 'shot',
                playerName: event.player || 'Unknown',
                team: event.team === 'home' ? homeTeamName : awayTeamName
              });
            }
          } else if (event.type === 'yellow_card') {
            matchSounds.yellowCard();
            setCurrentOverlay({
              type: 'yellow_card',
              playerName: event.player || 'Unknown',
              team: event.team === 'home' ? homeTeamName : awayTeamName
            });
          } else if (event.type === 'red_card') {
            matchSounds.redCard();
            setCurrentOverlay({
              type: 'red_card',
              playerName: event.player || 'Unknown',
              team: event.team === 'home' ? homeTeamName : awayTeamName
            });
          } else if (event.type === 'save') {
            matchSounds.save();
            if (Math.random() < 0.5) {
              setCurrentOverlay({
                type: 'save',
                playerName: event.player || 'Unknown',
                team: event.team === 'home' ? homeTeamName : awayTeamName
              });
            }
          } else if (event.type === 'corner') {
            matchSounds.corner();
          } else if (event.type === 'injury') {
            matchSounds.whistle();
          }

          if (minuteRef.current >= 85 && minuteRef.current <= 90 && event.type === 'shot_on_target') {
            setTenseMoment('final_minutes');
          }
          
          eventIndexRef.current++;
        }

        // Check for match end
        if (minuteRef.current >= 90) {
          if (intervalRef.current) clearTimeout(intervalRef.current);
          setIsSimulating(false);
          setMatchEnded(true);
          
          processMatchResult(matchId, homeTeamName, awayTeamName, hybridResult);
          
          setShowResultSummary(true);
          return;
        }
        
        // Schedule next update
        scheduleNext();
      };

      const scheduleNext = () => {
        // Always use current speed ref value
        const intervalTime = speedRef.current === 'fast' ? 200 : 1000;
        intervalRef.current = setTimeout(() => {
          updateMatch();
        }, intervalTime);
      };

      // Start the simulation
      updateMatch();
    } catch (error) {
      console.error('Hybrid simulation error:', error);
      toast({
        title: "Simulation Error",
        description: "Failed to simulate match",
        variant: "destructive",
      });
      setIsSimulating(false);
    }
  };


  const togglePause = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      toast({
        title: "⏸️ Match Paused",
        description: "Click Resume to continue"
      });
    } else {
      toast({
        title: "▶️ Match Resumed",
        description: "Match continues"
      });
    }
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

  const handleContinueToNextMatch = async () => {
    setShowResultSummary(false);
    
    // Navigate to dashboard after match completion - do NOT auto-advance date
    navigate("/dashboard");
    
    toast({
      title: "✅ Match Complete",
      description: "Returning to dashboard. Use Continue to advance to next matchweek.",
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
      <div className="h-screen overflow-hidden p-2 flex flex-col relative">
        {/* Stadium Background */}
        {stadiumImageUrl && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{ backgroundImage: `url(${stadiumImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
          </div>
        )}
        {/* Match Event Overlays */}
        {currentOverlay && (
          <MatchEventOverlay
            type={currentOverlay.type}
            playerName={currentOverlay.playerName}
            team={currentOverlay.team}
            onComplete={() => setCurrentOverlay(null)}
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
            homeLogoUrl={teamColors.home.logoUrl}
            awayLogoUrl={teamColors.away.logoUrl}
            homeColor={teamColors.home.primary}
            awayColor={teamColors.away.primary}
          />
        )}

        {/* Event Notifications - Disabled, all events show in match events box */}

        <div className="flex justify-between items-center mb-2">
          <h1 className="text-lg font-heading font-bold gradient-text">Play Match</h1>
          <Badge variant="outline" className="text-xs">{competition}</Badge>
        </div>

        {/* Match Progress with Animated Attack/Defense Bar */}
        <ImprovedAttackDefenseBar
          homeTeam={homeTeamName}
          awayTeam={awayTeamName}
          homeAttack={momentum.home}
          awayAttack={momentum.away}
          currentMinute={currentMinute}
          homeColor={teamColors.home.primary}
          awayColor={teamColors.away.primary}
          homeLogoUrl={teamColors.home.logoUrl}
          awayLogoUrl={teamColors.away.logoUrl}
          homeScore={currentHomeScore}
          awayScore={currentAwayScore}
          matchPeriod={
            currentMinute <= 45 ? 'first_half' :
            currentMinute > 45 && currentMinute <= 90 ? 'second_half' :
            'full_time'
          }
          isSimulating={isSimulating}
          isPaused={isPaused}
          speed={speed}
          loading={loading}
          matchEnded={matchEnded}
          canStart={!!homeLineupState && !!awayLineupState}
          onStartMatch={startSimulation}
          onTogglePause={togglePause}
          onSpeedChange={setSpeed}
          onNextMatch={() => navigate('/dashboard')}
        />

        {/* Main Layout: 3 Columns */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 flex-1 min-h-0">
          {/* Left Column: Tactics */}
          <div className="space-y-2 overflow-auto">
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
                homeLogoUrl={teamColors.home.logoUrl}
                awayLogoUrl={teamColors.away.logoUrl}
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
