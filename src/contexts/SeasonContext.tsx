import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, isAfter, parseISO } from "date-fns";
import { LeagueStanding, Match } from "@/types/game";
import { SimulationResult } from "@/types/match";
import { MatchResultProcessor } from "@/services/matchResultProcessor";
import { mockStandings, mockMatches } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCurrentSave } from "@/hooks/useCurrentSave";

interface SeasonContextType {
  currentDate: Date;
  seasonStartDate: Date;
  seasonEndDate: Date;
  advanceDate: (days: number) => void;
  resetSeason: () => void;
  currentMatchweek: number;
  leagueStandings: LeagueStanding[];
  fixtures: Match[];
  processMatchResult: (
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    result: SimulationResult
  ) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const { currentSave } = useCurrentSave();
  // Initialize season to start of current calendar year's football season (August)
  const getCurrentSeasonStart = () => {
    const now = new Date();
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1; // If before August, use previous year
    return new Date(year, 7, 1); // August 1st
  };

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const saved = localStorage.getItem("seasonCurrentDate");
    return saved ? new Date(saved) : getCurrentSeasonStart();
  });

  const [seasonStartDate] = useState<Date>(() => {
    const saved = localStorage.getItem("seasonStartDate");
    return saved ? new Date(saved) : getCurrentSeasonStart();
  });

  const seasonEndDate = new Date(seasonStartDate.getFullYear() + 1, 4, 31); // May 31st next year

  // Calculate current matchweek (roughly 1 week = 1 matchweek)
  const currentMatchweek = Math.floor(
    (currentDate.getTime() - seasonStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  ) + 1;

  // Load or initialize league standings and fixtures
  const [leagueStandings, setLeagueStandings] = useState<LeagueStanding[]>(() => {
    const saved = MatchResultProcessor.loadFromLocalStorage();
    return saved.standings || mockStandings;
  });

  const [fixtures, setFixtures] = useState<Match[]>(() => {
    const saved = MatchResultProcessor.loadFromLocalStorage();
    return saved.fixtures || mockMatches;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("seasonCurrentDate", currentDate.toISOString());
    localStorage.setItem("seasonStartDate", seasonStartDate.toISOString());
  }, [currentDate, seasonStartDate]);

  useEffect(() => {
    MatchResultProcessor.saveToLocalStorage(leagueStandings, fixtures, []);
  }, [leagueStandings, fixtures]);

  const advanceDate = async (days: number) => {
    const newDate = addDays(currentDate, days);
    setCurrentDate(newDate);
    
    // Simulate AI matches for the new date
    if (currentSave?.id) {
      const { data: season } = await supabase
        .from('save_seasons')
        .select('id')
        .eq('save_id', currentSave.id)
        .eq('is_current', true)
        .single();

      if (season) {
        const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
        const simulatedCount = await AIMatchSimulator.simulateAIMatches(
          season.id,
          currentSave.id,
          newDate.toISOString().split('T')[0],
          currentSave.team_id
        );

        console.log(`Simulated ${simulatedCount} AI matches`);

        // Refresh standings and fixtures after AI matches
        const { data: refreshedSeason } = await supabase
          .from('save_seasons')
          .select('standings_state, fixtures_state')
          .eq('id', season.id)
          .single();

        if (refreshedSeason) {
          setLeagueStandings(refreshedSeason.standings_state as any[]);
          setFixtures(refreshedSeason.fixtures_state as any[]);
        }
      }
    }
    
    // Check if season has ended (May 31st)
    if (newDate.getMonth() === 4 && newDate.getDate() === 31) {
      await handleSeasonEnd();
    }
    
    // Check transfer window status
    await checkTransferWindow(newDate);
  };
  
  const handleSeasonEnd = async () => {
    try {
      toast({
        title: "🏆 Season Complete!",
        description: "Preparing next season...",
      });
      
      // Get current save from hook
      const { data: saves } = await supabase
        .from('game_saves')
        .select('id, user_id')
        .eq('is_active', true)
        .single();
        
      if (!saves) return;
      
      const { data: currentSeason } = await supabase
        .from('save_seasons')
        .select('id')
        .eq('save_id', saves.id)
        .eq('is_current', true)
        .single();
        
      if (!currentSeason) return;
      
      // Call edge function to handle season transition
      const { data, error } = await supabase.functions.invoke('manage-season-transition', {
        body: {
          saveId: saves.id,
          currentSeasonId: currentSeason.id,
          userId: saves.user_id
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ New Season Started!",
        description: `${data.fixturesGenerated} fixtures generated for season ${data.newSeasonYear}`,
      });
      
      // Reload page to refresh data
      window.location.reload();
      
    } catch (error) {
      console.error('Season transition error:', error);
      toast({
        title: "Error",
        description: "Failed to transition to new season",
        variant: "destructive"
      });
    }
  };
  
  const checkTransferWindow = async (date: Date) => {
    try {
      const { data: saves } = await supabase
        .from('game_saves')
        .select('id')
        .eq('is_active', true)
        .single();
        
      if (!saves) return;
      
      const { data, error } = await supabase.functions.invoke('check-transfer-window', {
        body: {
          saveId: saves.id,
          currentDate: date.toISOString().split('T')[0]
        }
      });
      
      if (error) throw error;
      
      if (data?.transferWindow?.isOpen) {
        const window = data.transferWindow;
        toast({
          title: `🔄 ${window.type === 'summer' ? 'Summer' : 'Winter'} Transfer Window Open`,
          description: `${window.daysRemaining} days remaining`,
        });
      }
      
    } catch (error) {
      console.error('Transfer window check error:', error);
    }
  };

  const resetSeason = () => {
    const newStart = getCurrentSeasonStart();
    setCurrentDate(newStart);
    setLeagueStandings(mockStandings);
    setFixtures(mockMatches);
    localStorage.setItem("seasonStartDate", newStart.toISOString());
    localStorage.setItem("seasonCurrentDate", newStart.toISOString());
    localStorage.removeItem('leagueStandings');
    localStorage.removeItem('fixtures');
    localStorage.removeItem('playerStats');
  };

  const processMatchResult = async (
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    result: SimulationResult
  ) => {
    if (!currentSave) return;

    try {
      // Get current season
      const { data: season, error: seasonError } = await supabase
        .from('save_seasons')
        .select('*')
        .eq('save_id', currentSave.id)
        .eq('is_current', true)
        .single();

      if (seasonError) throw seasonError;

      // Update match status to finished in save_matches
      const { error: matchError } = await supabase
        .from('save_matches')
        .update({
          status: 'finished',
          home_score: result.homeScore,
          away_score: result.awayScore,
          match_data: result as any
        })
        .eq('id', matchId);

      if (matchError) {
        console.error('Error updating match:', matchError);
      }

      // Update standings in database
      const standings = (season.standings_state as any[]) || [];
      const homeTeamData = standings.find(s => s.team_name === homeTeam);
      const awayTeamData = standings.find(s => s.team_name === awayTeam);

      if (homeTeamData && awayTeamData) {
        const updatedStandings = updateStandingsAfterMatch(
          standings,
          homeTeamData.team_id,
          awayTeamData.team_id,
          result.homeScore,
          result.awayScore
        );

        await supabase
          .from('save_seasons')
          .update({ 
            standings_state: updatedStandings,
            updated_at: new Date().toISOString()
          })
          .eq('id', season.id);

        setLeagueStandings(updatedStandings);
      }

      // Get matchday from the completed fixture
      const fixtures = (season.fixtures_state as any[]) || [];
      const completedMatch = fixtures.find((f: any) => f.id === matchId);
      const matchday = completedMatch?.matchday;

      // Update fixtures_state in season
      const updatedFixtures = fixtures.map((f: any) => {
        if (f.id === matchId) {
          return {
            ...f,
            status: 'finished',
            homeScore: result.homeScore,
            awayScore: result.awayScore
          };
        }
        return f;
      });

      await supabase
        .from('save_seasons')
        .update({ fixtures_state: updatedFixtures })
        .eq('id', season.id);

      setFixtures(updatedFixtures);

      // Update player stats
      const playerStats = MatchResultProcessor.extractPlayerStats(result);
      
      for (const stat of playerStats) {
        const { data: existingPlayer } = await supabase
          .from('save_players')
          .select('*')
          .eq('save_id', currentSave.id)
          .eq('player_id', stat.playerId)
          .maybeSingle();

        if (existingPlayer) {
          const newAppearances = existingPlayer.appearances + stat.appearances;
          const newAvgRating = ((existingPlayer.average_rating || 0) * existingPlayer.appearances + stat.rating) / newAppearances;

          await supabase
            .from('save_players')
            .update({
              goals: existingPlayer.goals + stat.goals,
              assists: existingPlayer.assists + stat.assists,
              appearances: newAppearances,
              average_rating: newAvgRating,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPlayer.id);
        }
      }

      // CRITICAL: Simulate ALL remaining AI matches for this matchday to complete the round
      if (matchday && season.id) {
        console.log(`[SEASON] User match complete for Matchday ${matchday}. Simulating ALL remaining AI matches...`);
        
        const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
        const aiMatchesSimulated = await AIMatchSimulator.simulateMatchdayAIMatches(
          season.id,
          currentSave.id,
          matchday,
          currentSave.team_id
        );

        console.log(`[SEASON] Matchday ${matchday} complete! ${aiMatchesSimulated} AI matches simulated.`);

        // Refresh standings after all AI matches complete
        const { data: refreshedSeason } = await supabase
          .from('save_seasons')
          .select('standings_state, fixtures_state')
          .eq('id', season.id)
          .single();

        if (refreshedSeason) {
          setLeagueStandings(refreshedSeason.standings_state as any[]);
          setFixtures(refreshedSeason.fixtures_state as any[]);
        }

        toast({
          title: "✅ Matchday Complete!",
          description: `All ${aiMatchesSimulated + 1} matches completed. League table updated.`,
        });
      } else {
        toast({
          title: "Match Result Saved",
          description: "Match result and standings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error processing match result:', error);
      toast({
        title: "Error",
        description: "Failed to save match result",
        variant: "destructive",
      });
    }
  };

  const updateStandingsAfterMatch = (
    standings: any[],
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number
  ) => {
    const updated = standings.map(team => {
      if (team.team_id === homeTeamId) {
        return updateTeamStats(team, homeScore, awayScore);
      } else if (team.team_id === awayTeamId) {
        return updateTeamStats(team, awayScore, homeScore);
      }
      return team;
    });

    return recalculatePositions(updated);
  };

  const updateTeamStats = (team: any, goalsFor: number, goalsAgainst: number) => {
    const result = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';
    const points = result === 'W' ? 3 : result === 'D' ? 1 : 0;
    const newForm = [result, ...(team.form || []).slice(0, 4)];

    return {
      ...team,
      played: (team.played || 0) + 1,
      won: (team.won || 0) + (result === 'W' ? 1 : 0),
      drawn: (team.drawn || 0) + (result === 'D' ? 1 : 0),
      lost: (team.lost || 0) + (result === 'L' ? 1 : 0),
      goals_for: (team.goals_for || 0) + goalsFor,
      goals_against: (team.goals_against || 0) + goalsAgainst,
      goal_difference: ((team.goals_for || 0) + goalsFor) - ((team.goals_against || 0) + goalsAgainst),
      points: (team.points || 0) + points,
      form: newForm
    };
  };

  const recalculatePositions = (standings: any[]) => {
    const sorted = [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

    return sorted.map((team, index) => ({
      ...team,
      position: index + 1
    }));
  };

  return (
    <SeasonContext.Provider
      value={{
        currentDate,
        seasonStartDate,
        seasonEndDate,
        advanceDate,
        resetSeason,
        currentMatchweek,
        leagueStandings,
        fixtures,
        processMatchResult
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error("useSeason must be used within SeasonProvider");
  }
  return context;
}
