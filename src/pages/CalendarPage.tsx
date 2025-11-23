import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Play, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentSave } from "@/hooks/useCurrentSave";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load season and fixtures from database
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
    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      toast({
        title: "Error",
        description: "This match cannot be played. Team data missing.",
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

      setSelectedDate(newDate);
      setSeason({ ...season, season_current_date: newDate.toISOString().split('T')[0] });

      toast({
        title: "Time Advanced",
        description: `Advanced ${daysToAdvance} day(s) to ${format(newDate, "PPP")}`,
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

      setSeason({ ...season, season_current_date: newDate.toISOString().split('T')[0] });

      toast({
        title: "Time Advanced",
        description: `Advanced ${days} day(s)`,
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
            <Button onClick={handleAdvanceToNextMatch} variant="default" size="sm" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Next Match
            </Button>
            <Button onClick={() => handleAdvanceDays(1)} variant="outline" size="sm" className="text-xs">+1 Day</Button>
            <Button onClick={() => handleAdvanceDays(7)} variant="outline" size="sm" className="text-xs">+1 Week</Button>
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
                            <Button onClick={() => handleSimulateMatch(fixture)} className="w-full gap-1 h-7 text-xs">
                              <Play className="h-3 w-3" />
                              Play
                            </Button>
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
                      <Button onClick={() => handleSimulateMatch(fixture)} size="sm" className="gap-1 text-xs">
                        <Play className="h-3 w-3" />
                        Play
                      </Button>
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
    </DashboardLayout>
  );
};

export default CalendarPage;
