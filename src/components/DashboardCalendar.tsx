import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Play, Clock, Loader2, Ban, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { FixtureScheduler } from "@/services/fixtureScheduler";
import { Skeleton } from "@/components/ui/skeleton";

interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  competition: string;
  status: string;
  matchweek?: number;
  matchday?: number;
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

export const DashboardCalendar = () => {
  const { currentSave } = useCurrentSave();
  const [season, setSeason] = useState<Season | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadSeasonData = async () => {
      if (!currentSave) return;

      try {
        setLoading(true);

        const { data: seasonData, error: seasonError } = await supabase
          .from('save_seasons')
          .select('*')
          .eq('save_id', currentSave.id)
          .eq('is_current', true)
          .single();

        if (seasonError) throw seasonError;

        setSeason(seasonData);
        const fixturesFromState = (seasonData.fixtures_state as any[]) || [];
        setFixtures(fixturesFromState);
      } catch (error) {
        console.error('Error loading season data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeasonData();

    const channel = supabase
      .channel('calendar-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'save_seasons',
          filter: `save_id=eq.${currentSave?.id}`
        },
        (payload) => {
          const updatedSeason = payload.new as any;
          setSeason(updatedSeason);
          setFixtures((updatedSeason.fixtures_state as any[]) || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSave]);

  const currentDate = season?.season_current_date ? new Date(season.season_current_date) : new Date();
  const currentMatchweek = season?.current_matchday || 1;

  const upcomingFixtures = useMemo(() => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    return fixtures
      .filter(f => f.date >= currentDateStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [fixtures, currentDate]);

  // Check if current matchweek is complete
  const matchweekStatus = useMemo(() => {
    if (!fixtures.length) return { isComplete: false, finished: 0, total: 0 };
    
    const scheduledFixtures = fixtures as any[];
    return FixtureScheduler.getMatchdayStatus(scheduledFixtures, currentMatchweek);
  }, [fixtures, currentMatchweek]);

  const nextUserMatch = useMemo(() => {
    return upcomingFixtures.find(f => 
      (f.homeTeamId === currentSave?.team_id || f.awayTeamId === currentSave?.team_id) &&
      f.status === 'scheduled'
    );
  }, [upcomingFixtures, currentSave]);

  const canPlayMatch = (fixture: Fixture): boolean => {
    const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                        fixture.awayTeamId === currentSave?.team_id;
    
    if (!isUserMatch) return false;
    if (!nextUserMatch || fixture.id !== nextUserMatch.id) return false;

    // Check if match is in future matchweek - if so, must complete current matchweek first
    const fixtureMatchweek = fixture.matchweek || fixture.matchday || 1;
    if (fixtureMatchweek > currentMatchweek) {
      return matchweekStatus.isComplete;
    }

    // If in current matchweek, allow playing
    return true;
  };

  const getPlayButtonState = (fixture: Fixture) => {
    const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                        fixture.awayTeamId === currentSave?.team_id;
    
    if (!isUserMatch) {
      return { disabled: true, text: "AI Match", icon: Ban, variant: "ghost" as const };
    }

    if (!nextUserMatch || fixture.id !== nextUserMatch.id) {
      return { disabled: true, text: "Locked", icon: Ban, variant: "ghost" as const };
    }

    const fixtureMatchweek = fixture.matchweek || fixture.matchday || 1;
    if (fixtureMatchweek > currentMatchweek && !matchweekStatus.isComplete) {
      return { 
        disabled: true, 
        text: `Finish MW${currentMatchweek}`, 
        icon: Clock, 
        variant: "ghost" as const 
      };
    }

    return { disabled: false, text: "Play Match", icon: Play, variant: "default" as const };
  };

  const handlePlayMatch = (fixture: Fixture) => {
    if (!canPlayMatch(fixture)) {
      const fixtureMatchweek = fixture.matchweek || fixture.matchday || 1;
      if (fixtureMatchweek > currentMatchweek && !matchweekStatus.isComplete) {
        toast({
          title: "❌ Complete Current Matchweek",
          description: `You must complete all matches in Matchweek ${currentMatchweek} before advancing to the next matchweek.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Cannot Play Match",
          description: "Matches must be played in chronological order.",
          variant: "destructive",
        });
      }
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
          matchweek: fixture.matchweek || fixture.matchday
        }
      }
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Fixtures & Calendar</h2>
        <Badge variant="outline" className="text-xs">
          Matchweek {currentMatchweek}
        </Badge>
      </div>

      {/* Matchweek Status */}
      {!matchweekStatus.isComplete && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">Matchweek {currentMatchweek} Progress</span>
            <span className="text-muted-foreground">
              {matchweekStatus.finished} / {matchweekStatus.total} Complete
            </span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(matchweekStatus.finished / matchweekStatus.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {matchweekStatus.isComplete && nextUserMatch && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-500 font-medium">
            Matchweek {currentMatchweek} Complete - Ready for next match
          </span>
        </div>
      )}

      {/* Upcoming Fixtures */}
      <div className="space-y-2">
        {upcomingFixtures.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming fixtures</p>
        ) : (
          upcomingFixtures.map((fixture) => {
            const isUserMatch = fixture.homeTeamId === currentSave?.team_id || 
                               fixture.awayTeamId === currentSave?.team_id;
            const buttonState = getPlayButtonState(fixture);
            const Icon = buttonState.icon;

            return (
              <div
                key={fixture.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isUserMatch 
                    ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        MW{fixture.matchweek || fixture.matchday}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(fixture.date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-sm">
                      <span className={`truncate text-right ${isUserMatch ? 'font-semibold' : ''}`}>
                        {fixture.homeTeam}
                      </span>
                      <span className="text-muted-foreground text-xs">vs</span>
                      <span className={`truncate ${isUserMatch ? 'font-semibold' : ''}`}>
                        {fixture.awayTeam}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={buttonState.variant}
                    disabled={buttonState.disabled}
                    onClick={() => handlePlayMatch(fixture)}
                    className="shrink-0"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {buttonState.text}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
