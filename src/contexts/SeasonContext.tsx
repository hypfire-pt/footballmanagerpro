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

  const processMatchResult = (
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    result: SimulationResult
  ) => {
    const processed = MatchResultProcessor.processMatchResult(
      matchId,
      homeTeam,
      awayTeam,
      result,
      leagueStandings,
      fixtures
    );

    setLeagueStandings(processed.updatedStandings);
    setFixtures(processed.updatedFixtures);
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
