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
import { FastForwardResultsModal } from "@/components/FastForwardResultsModal";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, ArrowRight, Loader2, FastForward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Dashboard = () => {
  const { currentSave } = useCurrentSave();
  const { seasonData, loading: seasonLoading, refetch } = useSeasonData(currentSave?.id);
  const navigate = useNavigate();
  const [continuing, setContinuing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [fastForwarding, setFastForwarding] = useState(false);
  const [showFastForwardResults, setShowFastForwardResults] = useState(false);
  const [fastForwardData, setFastForwardData] = useState<any>(null);
  const [teamColorsCache, setTeamColorsCache] = useState<Record<string, { primary: string; secondary: string; logoUrl?: string }>>({});

  const standings = (seasonData?.standings_state as any[]) || [];
  const fixtures = (seasonData?.fixtures_state as any[]) || [];
  const currentMatchweek = seasonData?.current_matchday || 1;
  const currentDate = seasonData?.season_current_date ? new Date(seasonData.season_current_date) : new Date();
  const seasonYear = seasonData?.season_year || new Date().getFullYear();

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

  const handleFastForward = async () => {
    if (!currentSave || !seasonData) return;

    try {
      setFastForwarding(true);

      // Find the next user team match
      const nextUserMatch = fixtures.find(f => 
        (f.homeTeamId === currentSave.team_id || f.awayTeamId === currentSave.team_id) &&
        f.status === 'scheduled'
      );

      if (!nextUserMatch) {
        toast({
          title: "No Upcoming Matches",
          description: "No more matches scheduled for your team",
          variant: "destructive"
        });
        setFastForwarding(false);
        return;
      }

      const currentDateObj = new Date(seasonData.season_current_date || new Date());
      const matchDate = new Date(nextUserMatch.date);
      const daysToAdvance = Math.ceil(
        (matchDate.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`[FAST FORWARD] Advancing ${daysToAdvance} days to next user match`);

      // Track matches that will be simulated
      const matchesToSimulate = fixtures.filter(f => {
        const fDate = new Date(f.date);
        return f.status === 'scheduled' && 
               fDate <= matchDate && 
               fDate >= currentDateObj &&
               f.homeTeamId !== currentSave.team_id && 
               f.awayTeamId !== currentSave.team_id;
      });

      // Fetch team colors for display
      const teamIds = new Set<string>();
      matchesToSimulate.forEach(m => {
        teamIds.add(m.homeTeamId);
        teamIds.add(m.awayTeamId);
      });

      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, primary_color, secondary_color, logo_url')
        .in('id', Array.from(teamIds));

      const colorsMap: Record<string, { primary: string; secondary: string; logoUrl?: string }> = {};
      teamsData?.forEach(t => {
        colorsMap[t.id] = {
          primary: t.primary_color,
          secondary: t.secondary_color,
          logoUrl: t.logo_url || undefined
        };
      });
      setTeamColorsCache(colorsMap);

      // Update season date
      const newDate = new Date(currentDateObj);
      newDate.setDate(newDate.getDate() + daysToAdvance);

      await supabase
        .from('save_seasons')
        .update({
          season_current_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', seasonData.id);

      await supabase
        .from('game_saves')
        .update({
          game_date: newDate.toISOString().split('T')[0]
        })
        .eq('id', currentSave.id);

      // Simulate all AI matches up to this date
      const { AIMatchSimulator } = await import('@/services/aiMatchSimulator');
      const simulated = await AIMatchSimulator.simulateAIMatches(
        seasonData.id,
        currentSave.id,
        newDate.toISOString().split('T')[0],
        currentSave.team_id
      );

      console.log(`[FAST FORWARD] ${simulated} AI matches simulated`);

      // Refresh data to get updated results
      await refetch();

      // Get the refreshed season data with completed matches
      const { data: refreshedSeason } = await supabase
        .from('save_seasons')
        .select('*')
        .eq('id', seasonData.id)
        .single();

      if (refreshedSeason) {
        const updatedFixtures = (refreshedSeason.fixtures_state as any[]) || [];
        
        // Find the matches that were just completed
        const simulatedMatches = matchesToSimulate.map(originalMatch => {
          const updated = updatedFixtures.find(f => f.id === originalMatch.id);
          return updated || originalMatch;
        }).filter(m => m.status === 'finished');

        // Prepare fast forward results data
        setFastForwardData({
          matches: simulatedMatches.map((m: any) => ({
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            homeScore: m.homeScore || 0,
            awayScore: m.awayScore || 0,
            date: m.date,
            matchweek: m.matchweek || m.matchday,
            competition: m.competition,
            keyEvents: m.match_data?.events || []
          })),
          daysAdvanced: daysToAdvance
        });

        setShowFastForwardResults(true);
      }

      toast({
        title: "⏩ Fast Forward Complete",
        description: `Advanced ${daysToAdvance} days. ${simulated} AI matches simulated.`,
      });

      setFastForwarding(false);

    } catch (error) {
      console.error('[FAST FORWARD] Error:', error);
      toast({
        title: "Error",
        description: "Failed to fast forward",
        variant: "destructive"
      });
      setFastForwarding(false);
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

      <FastForwardResultsModal
        open={showFastForwardResults}
        onClose={() => setShowFastForwardResults(false)}
        matches={fastForwardData?.matches || []}
        daysAdvanced={fastForwardData?.daysAdvanced || 0}
        teamColors={teamColorsCache}
      />

      <div className="container mx-auto p-4 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold gradient-text">Manager Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {format(currentDate, "EEEE, MMMM d, yyyy")} • Season {seasonYear}/{String(seasonYear + 1).slice(-2)} • Matchweek {currentMatchweek}
            </p>
          </div>
        </div>

        {/* Continue Button */}
        {canContinue && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-xs mb-1">Ready to Continue</h3>
                <p className="text-xs text-muted-foreground">
                  {aiMatchesComplete.complete 
                    ? `Matchweek ${currentMatchweek} complete. Advance to Matchweek ${currentMatchweek + 1}.`
                    : `Complete ${aiMatchesComplete.total - aiMatchesComplete.finished} remaining AI matches and advance to next matchweek.`
                  }
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  onClick={handleFastForward}
                  disabled={fastForwarding || continuing}
                  variant="outline"
                  size="sm"
                >
                  {fastForwarding ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Fast Forward...
                    </>
                  ) : (
                    <>
                      <FastForward className="h-3 w-3 mr-2" />
                      Fast Forward
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={continuing || fastForwarding}
                  size="sm"
                >
                  {continuing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Next Match & Actions */}
          <div className="lg:col-span-2 space-y-4">
            <NextMatchWidget />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 justify-center text-xs h-9"
                onClick={() => navigate('/squad')}
              >
                <Users className="h-3 w-3" />
                Manage Squad
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 justify-center text-xs h-9"
                onClick={() => navigate('/competitions')}
              >
                <TrendingUp className="h-3 w-3" />
                League Table
              </Button>
            </div>

            {/* Calendar Section */}
            <DashboardCalendar />
          </div>

          {/* Right Column - Key Widgets */}
          <div className="space-y-4">
            <LeaguePositionWidget />
            <SquadStatusWidget />
            <FinancialSummaryWidget />
          </div>
        </div>

        {/* Bottom Section - Stats & Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecentResultsWidget />
          <TopScorersWidget />
        </div>

        {/* Full League Table */}
        <div id="league-table-section">
          <h2 className="text-lg font-bold mb-3">League Standings</h2>
          {seasonLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : standings.length > 0 ? (
            <LeagueTable standings={standings} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No standings data available</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
