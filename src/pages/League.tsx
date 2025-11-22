import { DashboardLayout } from "@/components/DashboardLayout";
import LeagueTable from "@/components/LeagueTable";
import { europeanLeagues } from "@/data/leagues";
import { europeanTeams } from "@/data/teams";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeason } from "@/contexts/SeasonContext";

const League = () => {
  const { leagueStandings } = useSeason();
  
  // Get Premier League teams
  const premierLeague = europeanLeagues.find(l => l.id === "premier-league");
  const premierLeagueTeams = europeanTeams.filter(t => t.leagueId === "premier-league");

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{premierLeague?.name}</h1>
          <p className="text-muted-foreground">
            2024/25 Season • Matchweek 28 • {premierLeagueTeams.length} Teams
          </p>
        </div>

        <Tabs defaultValue="table" className="space-y-6">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <LeagueTable standings={leagueStandings} />

            <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pitch-green/20 border-l-4 border-pitch-green rounded-sm" />
                  <span>UEFA Champions League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500/20 border-l-4 border-blue-500 rounded-sm" />
                  <span>UEFA Europa League</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-result-loss/20 border-l-4 border-result-loss rounded-sm" />
                  <span>Relegation</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premierLeagueTeams.map(team => (
                <Card key={team.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{ backgroundColor: team.colors.primary + "20", color: team.colors.primary }}
                    >
                      {team.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.stadium}</p>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>Capacity: {team.capacity.toLocaleString()}</span>
                        <span>Founded: {team.founded}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          Reputation: {team.reputation}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fixtures">
            <Card className="p-6">
              <p className="text-muted-foreground">Fixtures schedule coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-6">
              <p className="text-muted-foreground">League statistics coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default League;
