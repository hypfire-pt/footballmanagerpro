import React, { createContext, useContext, useState, useEffect } from "react";
import { addDays, startOfMonth, format } from "date-fns";

interface SeasonContextType {
  currentDate: Date;
  seasonStartDate: Date;
  seasonEndDate: Date;
  advanceDate: (days: number) => void;
  resetSeason: () => void;
  currentMatchweek: number;
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

  // Save to localStorage whenever date changes
  useEffect(() => {
    localStorage.setItem("seasonCurrentDate", currentDate.toISOString());
    localStorage.setItem("seasonStartDate", seasonStartDate.toISOString());
  }, [currentDate, seasonStartDate]);

  const advanceDate = (days: number) => {
    setCurrentDate(prev => addDays(prev, days));
  };

  const resetSeason = () => {
    const newStart = getCurrentSeasonStart();
    setCurrentDate(newStart);
    localStorage.setItem("seasonStartDate", newStart.toISOString());
    localStorage.setItem("seasonCurrentDate", newStart.toISOString());
  };

  return (
    <SeasonContext.Provider
      value={{
        currentDate,
        seasonStartDate,
        seasonEndDate,
        advanceDate,
        resetSeason,
        currentMatchweek
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
