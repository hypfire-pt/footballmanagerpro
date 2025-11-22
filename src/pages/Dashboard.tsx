import { DashboardLayout } from "@/components/DashboardLayout";
import { NextMatchWidget } from "@/components/widgets/NextMatchWidget";
import { SquadStatusWidget } from "@/components/widgets/SquadStatusWidget";
import { LeaguePositionWidget } from "@/components/widgets/LeaguePositionWidget";
import { RecentResultsWidget } from "@/components/widgets/RecentResultsWidget";
import { NewsFeedWidget } from "@/components/widgets/NewsFeedWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FastForward, Save } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Manager</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Quick Save
            </Button>
            <Button size="sm">
              <FastForward className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>
        </div>

        {/* Next Match - Full Width */}
        <NextMatchWidget />

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SquadStatusWidget />
          <LeaguePositionWidget />
          
          {/* Transfer Activity Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Transfer Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Offers Received</span>
                  <Badge>2</Badge>
                </div>
                <div className="text-xs text-muted-foreground pl-4 space-y-1">
                  <p>• Real Madrid interested in E. Haaland (£150M)</p>
                  <p>• PSG monitoring B. Silva (£75M)</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transfer Budget</span>
                  <span className="text-sm font-bold text-green-600">£180M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wage Budget</span>
                  <span className="text-sm font-bold">£250k/week</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Open Transfer Centre
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results & News - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentResultsWidget />
          <NewsFeedWidget />
        </div>

        {/* Upcoming Fixtures */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
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
