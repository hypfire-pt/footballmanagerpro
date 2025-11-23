import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { NewsFeedWidget } from "@/components/widgets/NewsFeedWidget";
import { NextActionPrompt } from "@/components/NextActionPrompt";
import { useSeason } from "@/contexts/SeasonContext";
import { useGameFlow } from "@/contexts/GameFlowContext";
import { useSave } from "@/contexts/SaveContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FastForward, Save, Calendar } from "lucide-react";
import { europeanTeams } from "@/data/teams";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentDate, seasonStartDate, currentMatchweek } = useSeason();
  const { getNextMatchPrompt } = useGameFlow();
  const { currentSave } = useSave();
  const navigate = useNavigate();
  const { manualSave, isSaving } = useAutoSave({ interval: 120000, enabled: true });
  
  const nextMatch = getNextMatchPrompt();

  const handleContinue = () => {
    if (nextMatch) {
      navigate('/calendar');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8 animate-fade-in-up">
        {/* Page Title & Actions with Gaming Flair */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-heading font-bold gradient-text">Manager Dashboard</h1>
            <p className="text-sm text-muted-foreground font-medium">
              {format(currentDate, "EEEE, MMMM d, yyyy")} • <span className="text-primary font-semibold">Season {format(seasonStartDate, "yyyy/yy")}</span> • Matchweek {currentMatchweek}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={manualSave}
              size="sm" 
              variant="outline"
              disabled={isSaving}
              className="font-heading font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Quick Save'}
            </Button>
            <Button 
              onClick={handleContinue}
              size="sm" 
              className="bg-gradient-gaming border-0 btn-glow font-heading font-semibold"
            >
              <FastForward className="h-4 w-4 mr-2" />
              {nextMatch ? 'Next Match' : 'Continue Season'}
            </Button>
          </div>
        </div>

        {/* Next Match - Full Width with Gaming Card */}
        <div className="gaming-card">
          <NextMatchWidget />
        </div>

        {/* Main Grid - 4 Columns with Next Action */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <NextActionPrompt />
          </div>
          
          <div className="gaming-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <SquadStatusWidget />
          </div>
          <div className="gaming-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <LeaguePositionWidget />
          </div>
          
          {/* Transfer Activity Widget with Modern Design */}
          <Card className="glass gaming-card border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <span className="text-primary">💰</span> Transfer Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Offers Received</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30">2</Badge>
                </div>
                <div className="text-xs text-muted-foreground pl-4 space-y-2 font-medium">
                  <p className="hover:text-foreground transition-colors cursor-pointer">• Real Madrid interested in E. Haaland <span className="text-stat-gold">£150M</span></p>
                  <p className="hover:text-foreground transition-colors cursor-pointer">• PSG monitoring B. Silva <span className="text-stat-gold">£75M</span></p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between stat-card">
                  <span className="text-sm font-semibold">Transfer Budget</span>
                  <span className="text-sm font-bold text-result-win">£180M</span>
                </div>
                <div className="flex items-center justify-between stat-card">
                  <span className="text-sm font-semibold">Wage Budget</span>
                  <span className="text-sm font-bold text-primary">£250k/week</span>
                </div>
              </div>

              <Button variant="outline" className="w-full btn-glow hover:border-primary/50 font-heading font-semibold transition-all">
                Open Transfer Centre
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results & News - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="gaming-card animate-slide-in">
            <RecentResultsWidget />
          </div>
          <div className="gaming-card animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <NewsFeedWidget />
          </div>
        </div>

        {/* All Teams Logos */}
        <Card className="glass gaming-card border-border/50">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <span className="text-primary">⚽</span> European Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {europeanTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-all hover:scale-105 cursor-pointer group"
                  title={team.name}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow group-hover:shadow-neon transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${team.colors.primary}, ${team.colors.secondary})`,
                    }}
                  >
                    <span className="text-white font-heading font-bold text-xs drop-shadow-lg">
                      {team.shortName.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                    {team.shortName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
