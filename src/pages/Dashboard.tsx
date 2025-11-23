import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { FinancialSummaryWidget } from "@/components/widgets/FinancialSummaryWidget";
import { TopScorersWidget } from "@/components/widgets/TopScorersWidget";
import { useSeason } from "@/contexts/SeasonContext";
import { useSave } from "@/contexts/SaveContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentDate, seasonStartDate, currentMatchweek } = useSeason();
  const { currentSave } = useSave();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!currentSave) return;
    
    try {
      // Get current season
      const { data: season } = await supabase
        .from('save_seasons')
        .select('fixtures_state, season_current_date')
        .eq('save_id', currentSave.id)
        .eq('is_current', true)
        .single();
        
      if (!season) {
        navigate('/calendar');
        return;
      }
      
      const fixtures = (season.fixtures_state as any[]) || [];
      const currentDate = season.season_current_date || new Date().toISOString().split('T')[0];
      
      // Find next match
      const nextMatch = fixtures
        .filter(f => f.date >= currentDate && f.status === 'scheduled')
        .sort((a, b) => a.date.localeCompare(b.date))[0];
        
      if (nextMatch) {
        navigate('/calendar');
      } else {
        toast({
          title: "No Upcoming Matches",
          description: "No scheduled matches found",
        });
      }
    } catch (error) {
      console.error('Error getting next match:', error);
      navigate('/calendar');
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs font-medium">View Calendar</span>
          </Button>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaguePositionWidget />
          <SquadStatusWidget />
          <FinancialSummaryWidget />
        </div>

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
