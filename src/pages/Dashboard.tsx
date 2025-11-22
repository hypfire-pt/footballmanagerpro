import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { NewsFeedWidget } from "@/components/widgets/NewsFeedWidget";
import { useSeason } from "@/contexts/SeasonContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FastForward, Save, Calendar } from "lucide-react";

const Dashboard = () => {
  const { currentDate, seasonStartDate, currentMatchweek } = useSeason();
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
            <Button variant="outline" size="sm" className="btn-glow hover:border-primary/50 transition-all">
              <Save className="h-4 w-4 mr-2" />
              Quick Save
            </Button>
            <Button size="sm" className="bg-gradient-gaming border-0 btn-glow font-heading font-semibold">
              <FastForward className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        </div>

        {/* Next Match - Full Width with Gaming Card */}
        <div className="gaming-card">
          <NextMatchWidget />
        </div>

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Upcoming Fixtures with Glass Effect */}
        <Card className="glass gaming-card border-border/50">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <span className="text-primary">📅</span> Upcoming Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '17 Jan', comp: 'PL', home: 'Man City', away: 'Arsenal', time: '15:00' },
                { date: '21 Jan', comp: 'UCL', home: 'Bayern Munich', away: 'Man City', time: '20:00' },
                { date: '24 Jan', comp: 'PL', home: 'Man City', away: 'Liverpool', time: '17:30' },
                { date: '28 Jan', comp: 'FA', home: 'Man Utd', away: 'Man City', time: '19:45' },
              ].map((fixture, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-sm text-muted-foreground w-16">{fixture.date}</div>
                    <Badge variant="outline" className="w-10 justify-center">
                      {fixture.comp}
                    </Badge>
                    <div className="flex-1 text-sm">
                      <span className={fixture.home === 'Man City' ? 'font-semibold' : ''}>
                        {fixture.home}
                      </span>
                      <span className="text-muted-foreground mx-2">vs</span>
                      <span className={fixture.away === 'Man City' ? 'font-semibold' : ''}>
                        {fixture.away}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{fixture.time}</span>
                  </div>
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
