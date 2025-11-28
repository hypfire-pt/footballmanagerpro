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
import { HalfTimeModal } from "@/components/HalfTimeModal";
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
  const [showHalfTime, setShowHalfTime] = useState(false);
  const [plannedSubstitutions, setPlannedSubstitutions] = useState<any[]>([]);
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

  // Update match speed dynamically during simulation
  useEffect(() => {
    if (isSimulating && !isPaused && intervalRef.current) {
      // Clear existing interval and restart with new speed
      clearTimeout(intervalRef.current);
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

      // Animate the events
      let minute = 0;
      let eventIndex = 0;
      const intervalTime = speed === 'fast' ? 200 : 1000;

      const updateMatch = () => {
        if (isPaused) return;
        
        minute += speed === 'fast' ? 2 : 1;
        setCurrentMinute(minute);

        // Pause match at half-time (minute 45)
        if (minute === 45 && !showHalfTime) {
          setIsPaused(true);
          setShowHalfTime(true);
        }

        // Execute planned substitutions
        plannedSubstitutions.forEach((sub) => {
          if (sub.minute === minute || (sub.minute === 'auto' && minute >= 60 && minute <= 75 && Math.random() < 0.1)) {
            toast({
              title: "Substitution",
              description: `${sub.playerIn} replaces ${sub.playerOut}`,
            });
          }
        });

        // Update momentum from simulation data
        if (hybridResult.momentumByMinute[minute] !== undefined) {
          const engineMomentum = hybridResult.momentumByMinute[minute];
          const homeAttackPercentage = Math.min(80, Math.max(20, 50 + engineMomentum * 0.3));
          const awayAttackPercentage = Math.min(80, Math.max(20, 50 - engineMomentum * 0.3));
          
          setMomentum({
            home: homeAttackPercentage,
            away: awayAttackPercentage
          });
        }

        while (eventIndex < hybridResult.events.length && hybridResult.events[eventIndex].minute <= minute) {
          const event = hybridResult.events[eventIndex];
          setCurrentEventIndex(eventIndex);
          
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

          if (minute >= 85 && minute <= 90 && event.type === 'shot_on_target') {
            setTenseMoment('final_minutes');
          }
          
          // All events now appear in the match events box only
          
          eventIndex++;
        }

        if (minute >= 90) {
          if (intervalRef.current) clearTimeout(intervalRef.current);
          setIsSimulating(false);
          setMatchEnded(true);
          
          processMatchResult(matchId, homeTeamName, awayTeamName, hybridResult);
          
          setShowResultSummary(true);
        }
      };

      const scheduleNext = () => {
        const intervalTime = speed === 'fast' ? 200 : 1000;
        intervalRef.current = setTimeout(() => {
          updateMatch();
          if (minute < 90) {
            scheduleNext();
          }
        }, intervalTime);
      };

      scheduleNext();
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

  const handleContinueToNextMatch = async () => {
    setShowResultSummary(false);
    
    // Navigate to dashboard after match completion - do NOT auto-advance date
    navigate("/dashboard");
    
    toast({
      title: "✅ Match Complete",
      description: "Returning to dashboard. Use Continue to advance to next matchweek.",
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
    setIsPaused(false); // Resume the match
    
    toast({
      title: "⚽ Second Half Started",
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
            currentMinute === 0 ? 'first_half' :
            currentMinute === 45 ? 'half_time' :
            currentMinute > 45 && currentMinute < 90 ? 'second_half' :
            'full_time'
          }
        />

        {/* Main Layout: 3 Columns */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 flex-1 min-h-0">
          {/* Left Column: Controls + Tactics */}
          <div className="space-y-2 overflow-auto">

            {/* Controls */}
            <Card className="glass p-2 border-border/50 flex-shrink-0">
              <h3 className="text-xs font-heading font-semibold mb-2">Controls</h3>
              <div className="space-y-1.5">
                {!matchEnded && (
                  <>
                    {isSimulating && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Game Speed</label>
                          <div className="flex gap-1">
                            <Button 
                              variant={speed === 'normal' ? 'default' : 'outline'} 
                              size="sm" 
                              onClick={() => setSpeed('normal')} 
                              className="flex-1 text-xs h-7"
                              disabled={!isSimulating}
                            >
                              <Play className="h-3 w-3" />
                              <span className="ml-1">1x</span>
                            </Button>
                            <Button 
                              variant={speed === 'fast' ? 'default' : 'outline'} 
                              size="sm" 
                              onClick={() => setSpeed('fast')} 
                              className="flex-1 text-xs h-7"
                              disabled={!isSimulating}
                            >
                              <FastForward className="h-3 w-3" />
                              <span className="ml-1">2x</span>
                            </Button>
                          </div>
                        </div>
                        <Button onClick={togglePause} variant="outline" size="sm" className="w-full gap-1 text-xs h-7">
                          {isPaused ? <><Play className="h-3 w-3" />Resume</> : <><Pause className="h-3 w-3" />Pause</>}
                        </Button>
                      </>
                    )}
                    {!isSimulating && !result && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Match Mode</label>
                        <div className="flex gap-1">
                          <Button variant={speed === 'normal' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('normal')} className="flex-1 text-xs h-7">
                            <Play className="h-3 w-3" />
                            <span className="ml-1">Normal</span>
                          </Button>
                          <Button variant={speed === 'fast' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('fast')} className="flex-1 text-xs h-7">
                            <FastForward className="h-3 w-3" />
                            <span className="ml-1">Fast</span>
                          </Button>
                          <Button variant={speed === 'instant' ? 'default' : 'outline'} size="sm" onClick={() => setSpeed('instant')} className="flex-1 text-xs h-7">
                            <Zap className="h-3 w-3" />
                            <span className="ml-1">Instant</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Hybrid Engine Info */}
                {!result && (
                  <div className="space-y-1 py-2 border-t border-border/30">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded">
                        <Calculator className="h-3 w-3" />
                        <span className="font-semibold">Math</span>
                      </div>
                      <span className="text-muted-foreground">+</span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent-foreground rounded">
                        <Sparkles className="h-3 w-3" />
                        <span className="font-semibold">AI</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Hybrid engine for realistic results</p>
                  </div>
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
