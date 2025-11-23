import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { FinancialSummaryWidget } from "@/components/widgets/FinancialSummaryWidget";
import { TopScorersWidget } from "@/components/widgets/TopScorersWidget";
import LeagueTable from "@/components/LeagueTable";
import { DashboardCalendar } from "@/components/DashboardCalendar";
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
      // First, simulate any remaining AI matches in current matchweek
      if (!aiMatchesComplete.complete) {
        toast({
          title: "Simulating Remaining Matches",
          description: `Completing ${aiMatchesComplete.total - aiMatchesComplete.finished} remaining matches in Matchweek ${currentMatchweek}...`,
        });

        const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
        await AIMatchSimulator.simulateMatchdayAIMatches(
          seasonData.id,
          currentSave.id,
          currentMatchweek,
          currentSave.team_id
        );

        // Refresh data
        await refetch();
      }

      // Advance to next matchweek
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

        // Refresh data
        await refetch();
      } else {
        toast({
          title: "Season Complete",
          description: "No more matchweeks remaining",
        });
      }

    } catch (error) {
      console.error('Error continuing:', error);
      toast({
        title: "Error",
        description: "Failed to continue to next matchweek",
        variant: "destructive"
      });
    } finally {
      setContinuing(false);
    }
  };

  return (
    <DashboardLayout>
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
