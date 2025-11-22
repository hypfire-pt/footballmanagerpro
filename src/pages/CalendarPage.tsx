import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useSeason } from "@/contexts/SeasonContext";
import { useState, useMemo } from "react";
import { format, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Play, Calendar as CalendarIcon, Trophy, Clock } from "lucide-react";
import { europeanTeams } from "@/data/teams";
import { europeanLeagues } from "@/data/leagues";
import { generateLeagueFixtures, getFixturesForDate, getFixturesForMonth, getUpcomingFixtures, Fixture } from "@/services/fixtureGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CalendarPage = () => {
  const { currentDate, seasonStartDate, advanceDate, currentMatchweek } = useSeason();
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
  const [viewMonth, setViewMonth] = useState<Date>(currentDate);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const allFixtures = useMemo(() => {
    const premierLeague = europeanLeagues.find(l => l.id === "premier-league");
    const premierLeagueTeams = europeanTeams.filter(t => t.leagueId === "premier-league");
    
    if (!premierLeague || premierLeagueTeams.length === 0) return [];
    
    return generateLeagueFixtures(
      premierLeagueTeams,
      seasonStartDate,
      premierLeague.id,
      premierLeague.name
    );
  }, [seasonStartDate]);
  
  const selectedDateFixtures = useMemo(() => 
    getFixturesForDate(allFixtures, selectedDate),
    [allFixtures, selectedDate]
  );
  
  const upcomingFixtures = useMemo(() => 
    getUpcomingFixtures(allFixtures, currentDate, 15),
    [allFixtures, currentDate]
  );
  
  const monthFixtures = useMemo(() => 
    getFixturesForMonth(allFixtures, viewMonth.getFullYear(), viewMonth.getMonth()),
    [allFixtures, viewMonth]
  );
  
  const datesWithMatches = useMemo(() => {
    const dates = new Set<string>();
    monthFixtures.forEach(fixture => {
      dates.add(fixture.date);
    });
    return dates;
  }, [monthFixtures]);

  const handleSimulateMatch = (fixture: Fixture) => {
    toast({
      title: "Match Simulation",
      description: `Simulating ${fixture.homeTeam} vs ${fixture.awayTeam}...`,
    });
    
    navigate("/match", { 
      state: { 
        fixture,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam
      } 
    });
  };

  const handleAdvanceToNextMatch = () => {
    if (upcomingFixtures.length > 0) {
      const nextMatch = upcomingFixtures[0];
      const daysToAdvance = Math.ceil(
        (new Date(nextMatch.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      advanceDate(daysToAdvance);
      setSelectedDate(new Date(nextMatch.date));
      
      toast({
        title: "Time Advanced",
        description: `Advanced ${daysToAdvance} day(s) to ${format(new Date(nextMatch.date), "PPP")}`,
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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar & Fixtures</h1>
            <p className="text-muted-foreground">
              Season {format(seasonStartDate, "yyyy/yy")} • Matchweek {currentMatchweek} • {format(currentDate, "PPP")}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAdvanceToNextMatch} variant="default" className="gap-2">
              <Clock className="h-4 w-4" />
              Next Match
            </Button>
            <Button onClick={() => advanceDate(1)} variant="outline">+1 Day</Button>
            <Button onClick={() => advanceDate(7)} variant="outline">+1 Week</Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="fixtures">All Fixtures</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{format(viewMonth, "MMMM yyyy")}</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewMonth(subMonths(viewMonth, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setViewMonth(currentDate)}>Today</Button>
                    <Button variant="outline" size="icon" onClick={() => setViewMonth(addMonths(viewMonth, 1))}>
                      <ChevronRight className="h-4 w-4" />
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
                  className="rounded-md border pointer-events-auto"
                />
                
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary/20 rounded" />
                    <span>Match Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-accent ring-2 ring-primary rounded" />
                    <span>Today</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">{format(selectedDate, "MMM d")}</h2>
                </div>
                
                {selectedDateFixtures.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateFixtures.map(fixture => (
                      <Card key={fixture.id} className="p-3 hover:bg-accent/50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">{fixture.competition}</Badge>
                            <Badge variant={fixture.importance === 'high' ? 'default' : 'outline'} className="text-xs">
                              {fixture.importance}
                            </Badge>
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div className="font-bold">{fixture.homeTeam}</div>
                            <div className="text-xs text-muted-foreground">vs</div>
                            <div className="font-bold">{fixture.awayTeam}</div>
                          </div>
                          
                          <Button onClick={() => handleSimulateMatch(fixture)} className="w-full gap-2" size="sm">
                            <Play className="h-3 w-3" />
                            Simulate
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">No matches</div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {upcomingFixtures.map(fixture => (
                <Card key={fixture.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{fixture.competition}</Badge>
                        <Badge variant="secondary">MW {fixture.matchweek}</Badge>
                        {fixture.importance === 'high' && <Badge>Important</Badge>}
                      </div>
                      
                      <div className="font-bold text-lg">
                        {fixture.homeTeam} vs {fixture.awayTeam}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(fixture.date), "EEEE, MMMM d, yyyy")}
                      </div>
                    </div>
                    
                    <Button onClick={() => handleSimulateMatch(fixture)} className="gap-2">
                      <Play className="h-4 w-4" />
                      Simulate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fixtures">
            <div className="space-y-6">
              {Array.from({ length: 38 }, (_, mw) => {
                const wf = allFixtures.filter(f => f.matchweek === mw + 1);
                if (!wf.length) return null;
                
                return (
                  <div key={mw}>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Matchweek {mw + 1} - {format(new Date(wf[0].date), "PPP")}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {wf.map(f => (
                        <Card key={f.id} className="p-3 hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{f.competition}</span>
                            <Badge variant="outline" className="text-xs">MW {f.matchweek}</Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="font-medium truncate">{f.homeTeam}</span>
                            <span className="text-xs">vs</span>
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
