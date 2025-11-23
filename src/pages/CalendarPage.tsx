import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Play, Calendar as CalendarIcon, Clock, Loader2, FastForward } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { MatchdaySummary } from "@/components/MatchdaySummary";

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  competition: string;
  status: string;
  matchweek: number;
  homeScore?: number;
  awayScore?: number;
}

interface Season {
  id: string;
  season_year: number;
  season_current_date: string;
  current_matchday: number;
  fixtures_state: any;
  standings_state: any;
}

const CalendarPage = () => {
  const { currentSave } = useCurrentSave();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [season, setSeason] = useState<Season | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [fastForwarding, setFastForwarding] = useState(false);
  const [showMatchdaySummary, setShowMatchdaySummary] = useState(false);
  const [matchdaySummaryData, setMatchdaySummaryData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load season and fixtures from database with real-time updates
  useEffect(() => {
    const loadSeasonData = async () => {
      if (!currentSave) return;

      try {
        setLoading(true);

        // Get current season
        const { data: seasonData, error: seasonError } = await supabase
          .from('save_seasons')
          .select('*')
          .eq('save_id', currentSave.id)
          .eq('is_current', true)
          .single();

        if (seasonError) throw seasonError;

        setSeason(seasonData);

        // Get fixtures from fixtures_state
        const fixturesFromState = (seasonData.fixtures_state as any[]) || [];
        setFixtures(fixturesFromState);

        // Set current date from season
        if (seasonData.season_current_date) {
          const currentDate = new Date(seasonData.season_current_date);
          setSelectedDate(currentDate);
          setViewMonth(currentDate);
        }

        console.log('Loaded season data:', {
          seasonYear: seasonData.season_year,
          fixturesCount: fixturesFromState.length,
          currentDate: seasonData.season_current_date
        });

      } catch (error) {
        console.error('Error loading season data:', error);
        toast({
          title: "Error",
          description: "Failed to load season data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSeasonData();

    // Set up real-time subscription for fixture updates
    const channel = supabase
      .channel('season-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'save_seasons',
          filter: `save_id=eq.${currentSave?.id}`
        },
        (payload) => {
          console.log('Season updated:', payload);
          const updatedSeason = payload.new as any;
          setSeason(updatedSeason);
          const updatedFixtures = (updatedSeason.fixtures_state as any[]) || [];
          setFixtures(updatedFixtures);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSave]);

  const currentDate = season?.season_current_date ? new Date(season.season_current_date) : new Date();
  const seasonYear = season?.season_year || new Date().getFullYear();
  const currentMatchweek = season?.current_matchday || 1;

  const selectedDateFixtures = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return fixtures.filter(f => f.date === dateStr);
  }, [fixtures, selectedDate]);

  const upcomingFixtures = useMemo(() => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    return fixtures
      .filter(f => f.date >= currentDateStr && f.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 15);
  }, [fixtures, currentDate]);

  const monthFixtures = useMemo(() => {
    return fixtures.filter(f => {
      const fixtureDate = new Date(f.date);
      return fixtureDate.getFullYear() === viewMonth.getFullYear() &&
             fixtureDate.getMonth() === viewMonth.getMonth();
    });
  }, [fixtures, viewMonth]);

  const datesWithMatches = useMemo(() => {
    const dates = new Set<string>();
    monthFixtures.forEach(fixture => {
      dates.add(fixture.date);
    });
    return dates;
  }, [monthFixtures]);

  const handleSimulateMatch = (fixture: Fixture) => {
    // Check if this is a user team match
    const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                        fixture.awayTeamId === currentSave?.team_id;

    if (!isUserMatch) {
      toast({
        title: "❌ AI Match",
        description: "This match doesn't involve your team. AI matches are simulated automatically.",
        variant: "destructive",
      });
      return;
    }

    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      toast({
        title: "Error",
        description: "This match cannot be played. Team data missing.",
        variant: "destructive",
      });
      return;
    }

    // Find next user team match
    const nextUserMatch = upcomingFixtures.find(f => 
      f.homeTeamId === currentSave?.team_id || f.awayTeamId === currentSave?.team_id
    );

    // Enforce chronological sequence - only allow playing next upcoming user match
    if (!nextUserMatch || fixture.id !== nextUserMatch.id) {
      toast({
        title: "❌ Cannot Play Match",
        description: "Matches must be played in chronological order. Please play the next scheduled match first.",
        variant: "destructive",
      });
      return;
    }

    // Check if match date is in the future relative to current season date
    const matchDate = new Date(fixture.date);
    if (matchDate > currentDate) {
      toast({
        title: "❌ Match Not Available",
        description: "This match is scheduled for a future date. Advance time to reach this match.",
        variant: "destructive",
      });
      return;
    }

    navigate("/match", {
      state: {
        fixture: {
          id: fixture.id,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeTeamId: fixture.homeTeamId,
          awayTeamId: fixture.awayTeamId,
          date: fixture.date,
          competition: fixture.competition,
          matchweek: fixture.matchweek
        }
      }
    });
  };

  const handleAdvanceToNextMatch = async () => {
    if (!currentSave || !season || upcomingFixtures.length === 0) return;

    const nextMatch = upcomingFixtures[0];
    const daysToAdvance = Math.ceil(
      (new Date(nextMatch.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    try {
      // Update season current date
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + daysToAdvance);

      const { error } = await supabase
        .from('save_seasons')
        .update({
          season_current_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', season.id);

      if (error) throw error;

      // Also update game save date
      await supabase
        .from('game_saves')
        .update({
          game_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', currentSave.id);

      // Auto-simulate AI matches
      const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
      const simulated = await AIMatchSimulator.simulateAIMatches(
        season.id,
        currentSave.id,
        newDate.toISOString().split('T')[0],
        currentSave.team_id
      );

      setSelectedDate(newDate);
      setSeason({ ...season, season_current_date: newDate.toISOString().split('T')[0] });

      toast({
        title: "Time Advanced",
        description: `Advanced ${daysToAdvance} day(s). ${simulated} AI matches simulated.`,
      });

    } catch (error) {
      console.error('Error advancing date:', error);
      toast({
        title: "Error",
        description: "Failed to advance date",
        variant: "destructive"
      });
    }
  };

  const handleFastForward = async () => {
    if (!currentSave || !season || upcomingFixtures.length === 0) return;

    try {
      setFastForwarding(true);

      // Find the next user team match
      const nextUserMatch = upcomingFixtures.find(f => 
        f.homeTeamId === currentSave.team_id || f.awayTeamId === currentSave.team_id
      );

      if (!nextUserMatch) {
        toast({
          title: "No Upcoming Matches",
          description: "No more matches scheduled for your team",
          variant: "destructive"
        });
        return;
      }

      const matchDate = new Date(nextUserMatch.date);
      const daysToAdvance = Math.ceil(
        (matchDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`[FAST FORWARD] Advancing ${daysToAdvance} days to next user match`);

      // Update season date
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + daysToAdvance);

      const { error: seasonError } = await supabase
        .from('save_seasons')
        .update({
          season_current_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', season.id);

      if (seasonError) throw seasonError;

      await supabase
        .from('game_saves')
        .update({
          game_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', currentSave.id);

      // Simulate all AI matches up to this date
      const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
      const simulated = await AIMatchSimulator.simulateAIMatches(
        season.id,
        currentSave.id,
        newDate.toISOString().split('T')[0],
        currentSave.team_id
      );

      console.log(`[FAST FORWARD] ${simulated} AI matches simulated`);

      // Get completed matchdays to show summaries
      const { data: refreshedSeason } = await supabase
        .from('save_seasons')
        .select('*')
        .eq('id', season.id)
        .single();

      if (refreshedSeason) {
        setSeason(refreshedSeason);
        setFixtures((refreshedSeason.fixtures_state as any[]) || []);
        setSelectedDate(newDate);

        // Collect matchday summaries for completed rounds
        const fixturesState = (refreshedSeason.fixtures_state as any[]) || [];
        const completedMatchdays = new Set<number>();
        
        fixturesState.forEach(f => {
          if (f.status === 'finished' && f.matchday) {
            completedMatchdays.add(f.matchday);
          }
        });

        // Show summary for the most recent completed matchday
        const latestMatchday = Math.max(...Array.from(completedMatchdays));
        if (latestMatchday > 0) {
          await showMatchdayResults(latestMatchday, fixturesState, (refreshedSeason.standings_state as any[]) || []);
        }
      }

      toast({
        title: "⏩ Fast Forward Complete",
        description: `Advanced ${daysToAdvance} days. ${simulated} AI matches simulated.`,
      });

    } catch (error) {
      console.error('[FAST FORWARD] Error:', error);
      toast({
        title: "Error",
        description: "Failed to fast forward",
        variant: "destructive"
      });
    } finally {
      setFastForwarding(false);
    }
  };

  const showMatchdayResults = async (matchday: number, fixturesState: any[], standingsState: any[]) => {
    // Get all matches from this matchday
    const matchdayMatches = fixturesState.filter(f => f.matchday === matchday && f.status === 'finished');

    // Calculate position changes (simplified - would need previous standings)
    const positionChanges = standingsState.map((team: any) => ({
      team_name: team.team_name,
      old_position: team.position + (Math.random() > 0.5 ? 1 : -1), // Simplified
      new_position: team.position,
      points_gained: 0 // Would calculate from match result
    }));

    // Extract goal scorers
    const goalScorers: { player: string; goals: number }[] = [];
    matchdayMatches.forEach(match => {
      if (match.match_data?.events) {
        match.match_data.events.forEach((event: any) => {
          if (event.type === 'goal' && event.player) {
            const existing = goalScorers.find(g => g.player === event.player);
            if (existing) {
              existing.goals++;
            } else {
              goalScorers.push({ player: event.player, goals: 1 });
            }
          }
        });
      }
    });

    setMatchdaySummaryData({
      matchday,
      matches: matchdayMatches.map((m: any) => ({
        id: m.id,
        home_team_name: m.homeTeam,
        away_team_name: m.awayTeam,
        home_score: m.homeScore,
        away_score: m.awayScore,
        match_data: m.match_data
      })),
      positionChanges,
      topScorers: goalScorers.sort((a, b) => b.goals - a.goals)
    });

    setShowMatchdaySummary(true);
  };

  const handleAdvanceDays = async (days: number) => {
    if (!currentSave || !season) return;

    try {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + days);

      const { error } = await supabase
        .from('save_seasons')
        .update({
          season_current_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', season.id);

      if (error) throw error;

      await supabase
        .from('game_saves')
        .update({
          game_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', currentSave.id);

      // Auto-simulate AI matches
      const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
      const simulated = await AIMatchSimulator.simulateAIMatches(
        season.id,
        currentSave.id,
        newDate.toISOString().split('T')[0],
        currentSave.team_id
      );

      setSeason({ ...season, season_current_date: newDate.toISOString().split('T')[0] });

      toast({
        title: "Time Advanced",
        description: `Advanced ${days} day(s). ${simulated} AI matches simulated.`,
      });

    } catch (error) {
      console.error('Error advancing date:', error);
      toast({
        title: "Error",
        description: "Failed to advance date",
        variant: "destructive"
      });
    }
  };

  const modifiers = {
    matchDay: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return datesWithMatches.has(dateStr);
    },
    today: (date: Date) => isSameDay(date, currentDate)
  };

  const modifiersClassNames = {
    matchDay: "bg-primary/20 font-bold",
    today: "bg-accent text-accent-foreground ring-2 ring-primary"
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1">Calendar & Fixtures</h1>
            <p className="text-xs text-muted-foreground">
              Season {seasonYear}/{(seasonYear + 1).toString().slice(-2)} • 
              Matchweek {currentMatchweek} • 
              {format(currentDate, "PPP")}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleFastForward} 
              variant="default" 
              size="sm" 
              className="gap-1 text-xs"
              disabled={fastForwarding || loading}
            >
              {fastForwarding ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <FastForward className="h-3 w-3" />
                  Continue
                </>
              )}
            </Button>
            <Button onClick={handleAdvanceToNextMatch} variant="outline" size="sm" className="gap-1 text-xs" disabled={loading}>
              <Clock className="h-3 w-3" />
              Next Match
            </Button>
            <Button onClick={() => handleAdvanceDays(1)} variant="outline" size="sm" className="text-xs" disabled={loading}>+1 Day</Button>
            <Button onClick={() => handleAdvanceDays(7)} variant="outline" size="sm" className="text-xs" disabled={loading}>+1 Week</Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="text-xs">
            <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
            <TabsTrigger value="fixtures" className="text-xs">All Fixtures</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Card className="lg:col-span-2 p-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold">{format(viewMonth, "MMMM yyyy")}</h2>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setViewMonth(subMonths(viewMonth, 1))}>
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setViewMonth(currentDate)} className="text-xs">Today</Button>
                    <Button variant="outline" size="sm" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="rounded-md border"
                />

                <div className="mt-3 flex gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-primary/20 rounded" />
                    <span>Match Day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-accent ring-2 ring-primary rounded" />
                    <span>Today</span>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-1 mb-3">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold">{format(selectedDate, "MMM d")}</h2>
                </div>

                {selectedDateFixtures.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateFixtures.map(fixture => (
                      <Card key={fixture.id} className="p-2 hover:bg-accent/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{fixture.competition}</Badge>
                          </div>

                          <div className="text-xs space-y-0.5">
                            <div className="font-bold">{fixture.homeTeam}</div>
                            {fixture.status === 'finished' ? (
                              <div className="text-center py-0.5">
                                <span className="font-bold text-sm">{fixture.homeScore} - {fixture.awayScore}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">vs</div>
                            )}
                            <div className="font-bold">{fixture.awayTeam}</div>
                          </div>

                          {fixture.status === 'scheduled' && (
                            (() => {
                              const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                                                  fixture.awayTeamId === currentSave?.team_id;
                              const nextUserMatch = upcomingFixtures.find(f => 
                                f.homeTeamId === currentSave?.team_id || f.awayTeamId === currentSave?.team_id
                              );
                              const canPlay = isUserMatch && nextUserMatch?.id === fixture.id;

                              if (!isUserMatch) {
                                return (
                                  <div className="w-full text-center text-xs text-muted-foreground py-1">
                                    AI Match
                                  </div>
                                );
                              }

                              return (
                                <Button 
                                  onClick={() => handleSimulateMatch(fixture)} 
                                  className="w-full gap-1 h-7 text-xs"
                                  variant={canPlay ? 'default' : 'ghost'}
                                  disabled={!canPlay}
                                >
                                  {canPlay ? (
                                    <>
                                      <Play className="h-3 w-3" />
                                      Play
                                    </>
                                  ) : (
                                    'Locked'
                                  )}
                                </Button>
                              );
                            })()
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-xs">No matches</div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="space-y-2">
              {upcomingFixtures.map(fixture => (
                <Card key={fixture.id} className="p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{fixture.competition}</Badge>
                        <Badge variant="secondary" className="text-xs">MW {fixture.matchweek}</Badge>
                      </div>

                      <div className="font-bold text-sm">
                        {fixture.homeTeam} vs {fixture.awayTeam}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {format(new Date(fixture.date), "EEEE, MMMM d")}
                      </div>
                    </div>

                    {fixture.status === 'scheduled' && (
                      (() => {
                        const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                                            fixture.awayTeamId === currentSave?.team_id;
                        const nextUserMatch = upcomingFixtures.find(f => 
                          f.homeTeamId === currentSave?.team_id || f.awayTeamId === currentSave?.team_id
                        );
                        const canPlay = isUserMatch && nextUserMatch?.id === fixture.id;

                        if (!isUserMatch) {
                          return (
                            <Badge variant="secondary" className="text-xs">AI Match</Badge>
                          );
                        }

                        return (
                          <Button 
                            onClick={() => handleSimulateMatch(fixture)} 
                            size="sm" 
                            variant={canPlay ? 'default' : 'ghost'}
                            disabled={!canPlay}
                            className="gap-1 text-xs"
                          >
                            {canPlay ? (
                              <>
                                <Play className="h-3 w-3" />
                                Play
                              </>
                            ) : (
                              'Locked'
                            )}
                          </Button>
                        );
                      })()
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fixtures">
            <div className="space-y-4">
              {Array.from({ length: 38 }, (_, mw) => {
                const wf = fixtures.filter(f => f.matchweek === mw + 1);
                if (!wf.length) return null;

                return (
                  <div key={mw}>
                    <h3 className="text-sm font-bold mb-2">
                      Matchweek {mw + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {wf.map(f => (
                        <Card key={f.id} className="p-2 hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground truncate">{f.competition}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1 text-xs">
                            <span className="font-medium truncate">{f.homeTeam}</span>
                            {f.status === 'finished' ? (
                              <span className="text-xs font-bold">{f.homeScore}-{f.awayScore}</span>
                            ) : (
                              <span className="text-xs">vs</span>
                            )}
                            <span className="font-medium truncate">{f.awayTeam}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Matchday Summary Modal */}
      {matchdaySummaryData && (
        <MatchdaySummary
          open={showMatchdaySummary}
          onClose={() => setShowMatchdaySummary(false)}
          matchday={matchdaySummaryData.matchday}
          matches={matchdaySummaryData.matches}
          positionChanges={matchdaySummaryData.positionChanges}
          topScorers={matchdaySummaryData.topScorers}
          userTeamId={currentSave?.team_id}
        />
      )}
    </DashboardLayout>
  );
};

export default CalendarPage;
