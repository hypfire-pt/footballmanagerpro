import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { FinancialSummaryWidget } from "@/components/widgets/FinancialSummaryWidget";
import { TopScorersWidget } from "@/components/widgets/TopScorersWidget";
import LeagueTable from "@/components/LeagueTable";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { MatchweekSummaryModal } from "@/components/MatchweekSummaryModal";
import { useSeason } from "@/contexts/SeasonContext";
import { useSave } from "@/contexts/SaveContext";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Dashboard = () => {
  const { currentDate, seasonStartDate, currentMatchweek } = useSeason();
  const { currentSave: contextSave } = useSave();
  const { currentSave } = useCurrentSave();
  const { seasonData, loading: seasonLoading, refetch } = useSeasonData(currentSave?.id);
  const navigate = useNavigate();
  const [continuing, setContinuing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  const standings = (seasonData?.standings_state as any[]) || [];
  const fixtures = (seasonData?.fixtures_state as any[]) || [];

  // Check if user has played their match this matchweek
  const userMatchStatus = (() => {
    if (!currentSave || !fixtures.length) return { played: false, exists: false };
    
    const userMatch = fixtures.find(f => 
      (f.homeTeamId === currentSave.team_id || f.awayTeamId === currentSave.team_id) &&
      (f.matchweek === currentMatchweek || f.matchday === currentMatchweek)
    );

    return {
      played: userMatch?.status === 'finished',
      exists: !!userMatch,
      match: userMatch
    };
  })();

  // Check if all AI matches are complete
  const aiMatchesComplete = (() => {
    const matchweekFixtures = fixtures.filter(f => 
      (f.matchweek === currentMatchweek || f.matchday === currentMatchweek)
    );
    const finished = matchweekFixtures.filter(f => f.status === 'finished').length;
    return {
      complete: finished === matchweekFixtures.length,
      finished,
      total: matchweekFixtures.length
    };
  })();

  const canContinue = userMatchStatus.played && userMatchStatus.exists;

  const handleContinue = async () => {
    if (!currentSave || !seasonData) return;
    
    setContinuing(true);
    try {
      // Store old standings before simulating
      const oldStandings = [...standings];

      // Calculate how many AI matches need to be simulated
      const matchweekFixtures = fixtures.filter(f => 
        (f.matchweek === currentMatchweek || f.matchday === currentMatchweek)
      );
      const pendingMatches = matchweekFixtures.filter(f => 
        f.status === 'scheduled' && 
        f.homeTeamId !== currentSave.team_id && 
        f.awayTeamId !== currentSave.team_id
      );

      console.log(`[CONTINUE] Matchweek ${currentMatchweek}: ${pendingMatches.length} AI matches pending`);

      // Always simulate remaining AI matches in current matchweek
      if (pendingMatches.length > 0) {
        toast({
          title: "⚽ Simulating AI Matches",
          description: `Processing ${pendingMatches.length} remaining match${pendingMatches.length > 1 ? 'es' : ''} in Matchweek ${currentMatchweek}...`,
        });

        const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
        const simulated = await AIMatchSimulator.simulateMatchdayAIMatches(
          seasonData.id,
          currentSave.id,
          currentMatchweek,
          currentSave.team_id
        );

        console.log(`[CONTINUE] Simulated ${simulated} AI matches`);

        // Refresh data to get updated fixtures and standings
        await refetch();
        
        toast({
          title: "✅ Simulation Complete",
          description: `${simulated} match${simulated > 1 ? 'es' : ''} simulated successfully`,
        });
      }

      // Get refreshed season data
      const { data: refreshedSeason } = await supabase
        .from('save_seasons')
        .select('*')
        .eq('id', seasonData.id)
        .single();

      if (!refreshedSeason) return;

      const updatedFixtures = (refreshedSeason.fixtures_state as any[]) || [];
      const updatedStandings = (refreshedSeason.standings_state as any[]) || [];

      // Prepare summary data
      const matchweekResults = updatedFixtures.filter(f => 
        (f.matchweek === currentMatchweek || f.matchday === currentMatchweek) &&
        f.status === 'finished'
      );

      // Extract goal scorers
      const goalScorers: { player: string; team: string; goals: number }[] = [];
      matchweekResults.forEach(match => {
        if (match.match_data?.events) {
          match.match_data.events.forEach((event: any) => {
            if (event.type === 'goal' && event.player) {
              const existing = goalScorers.find(g => g.player === event.player);
              if (existing) {
                existing.goals++;
              } else {
                goalScorers.push({ 
                  player: event.player, 
                  team: event.team === 'home' ? match.homeTeam : match.awayTeam,
                  goals: 1 
                });
              }
            }
          });
        }
      });

      // Calculate position changes
      const standingChanges = updatedStandings.map((team: any) => {
        const oldTeam = oldStandings.find((t: any) => t.team_id === team.team_id);
        const oldPosition = oldTeam?.position || team.position;
        const oldPoints = oldTeam?.points || 0;
        
        return {
          team_name: team.team_name,
          old_position: oldPosition,
          new_position: team.position,
          points_gained: team.points - oldPoints,
          change: oldPosition - team.position
        };
      });

      // Set summary data and show modal
      setSummaryData({
        matchweek: currentMatchweek,
        results: matchweekResults.map((m: any) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId
        })),
        topScorers: goalScorers.sort((a, b) => b.goals - a.goals),
        standingChanges
      });

      setShowSummary(true);
      setContinuing(false);

    } catch (error) {
      console.error('Error continuing:', error);
      toast({
        title: "Error",
        description: "Failed to continue to next matchweek",
        variant: "destructive"
      });
      setContinuing(false);
    }
  };

  const handleAdvanceToNextMatchweek = async () => {
    if (!currentSave || !seasonData) return;

    try {
      const nextMatchweek = currentMatchweek + 1;
      
      // Find next matchweek's first fixture date
      const nextMatchweekFixtures = fixtures.filter(f => 
        (f.matchweek === nextMatchweek || f.matchday === nextMatchweek)
      );

      if (nextMatchweekFixtures.length > 0) {
        const nextDate = nextMatchweekFixtures[0].date;
        
        await supabase
          .from('save_seasons')
          .update({
            current_matchday: nextMatchweek,
            season_current_date: nextDate
          })
          .eq('id', seasonData.id);

        await supabase
          .from('game_saves')
          .update({
            game_date: nextDate
          })
          .eq('id', currentSave.id);

        toast({
          title: "✅ Matchweek Complete",
          description: `Advanced to Matchweek ${nextMatchweek}`,
        });

        // Refresh data and close modal
        await refetch();
        setShowSummary(false);
      } else {
        toast({
          title: "Season Complete",
          description: "No more matchweeks remaining",
        });
        setShowSummary(false);
      }
    } catch (error) {
      console.error('Error advancing matchweek:', error);
      toast({
        title: "Error",
        description: "Failed to advance to next matchweek",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <MatchweekSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        onContinue={handleAdvanceToNextMatchweek}
        matchweek={summaryData?.matchweek || currentMatchweek}
        results={summaryData?.results || []}
        topScorers={summaryData?.topScorers || []}
        standingChanges={summaryData?.standingChanges || []}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold gradient-text">Manager Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(currentDate, "EEEE, MMMM d, yyyy")} • Season {format(seasonStartDate, "yyyy")}/{format(seasonStartDate, "yy")} • Matchweek {currentMatchweek}
            </p>
          </div>
        </div>

        {/* Next Match - Featured */}
        <NextMatchWidget />

        {/* Continue Button */}
        {canContinue && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm mb-1">Ready to Continue</h3>
                <p className="text-xs text-muted-foreground">
                  {aiMatchesComplete.complete 
                    ? `Matchweek ${currentMatchweek} complete. Advance to Matchweek ${currentMatchweek + 1}.`
                    : `Complete ${aiMatchesComplete.total - aiMatchesComplete.finished} remaining AI matches and advance to next matchweek.`
                  }
                </p>
              </div>
              <Button 
                onClick={handleContinue}
                disabled={continuing}
                className="shrink-0"
              >
                {continuing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => navigate('/squad')}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Manage Squad</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => navigate('/competitions')}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-medium">League Table</span>
          </Button>
        </div>

        {/* Calendar & Fixtures */}
        <DashboardCalendar />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaguePositionWidget />
          <SquadStatusWidget />
          <FinancialSummaryWidget />
        </div>

        {/* League Table */}
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-3">League Table</h2>
          {seasonLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : standings.length > 0 ? (
            <LeagueTable standings={standings} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No standings data available</p>
          )}
        </Card>

        {/* Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopScorersWidget />
          <RecentResultsWidget />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
