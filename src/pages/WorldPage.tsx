import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { europeanLeagues } from "@/data/leagues";
import { europeanTeams } from "@/data/teams";
import { fullDatabase } from "@/data/fullDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Globe } from "lucide-react";

const WorldPage = () => {
  // Group leagues by country
  const leaguesByCountry = europeanLeagues.reduce((acc, league) => {
    if (league.tier > 0) {
      if (!acc[league.country]) acc[league.country] = [];
      acc[league.country].push(league);
    }
    return acc;
  }, {} as Record<string, typeof europeanLeagues>);
  
  const uefaCompetitions = europeanLeagues.filter(l => l.tier === 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">World Football</h1>
          <p className="text-muted-foreground">
            {europeanLeagues.length} leagues • {europeanTeams.length} teams • {fullDatabase.players.length.toLocaleString()} players
          </p>
        </div>

        <Tabs defaultValue="leagues" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leagues">Leagues</TabsTrigger>
            <TabsTrigger value="uefa">UEFA Competitions</TabsTrigger>
            <TabsTrigger value="stats">Global Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="leagues">
            <div className="space-y-6">
              {Object.entries(leaguesByCountry).map(([country, leagues]) => (
                <Card key={country} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{country}</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leagues.map(league => {
                      const leagueTeams = europeanTeams.filter(t => t.leagueId === league.id);
                      return (
                        <div 
                          key={league.id}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold">{league.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Founded {league.founded}
                              </p>
                            </div>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              Rep: {league.reputation}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{leagueTeams.length} teams</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="uefa">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {uefaCompetitions.map(comp => (
                <Card key={comp.id} className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{comp.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Since {comp.founded}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reputation</span>
                      <span className="font-bold">{comp.reputation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confederation</span>
                      <span className="font-bold">{comp.confederation}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 p-6">
              <h3 className="font-bold mb-4">Competition Format</h3>
              <p className="text-muted-foreground">
                Detailed competition brackets, fixtures, and qualification paths coming soon...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Leagues</p>
                  <p className="text-4xl font-bold text-primary">{europeanLeagues.length}</p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Teams</p>
                  <p className="text-4xl font-bold text-primary">{europeanTeams.length}</p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Players</p>
                  <p className="text-4xl font-bold text-primary">
                    {fullDatabase.players.length.toLocaleString()}
                  </p>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Avg Overall</p>
                  <p className="text-4xl font-bold text-primary">
                    {Math.floor(fullDatabase.players.reduce((sum, p) => sum + p.overall, 0) / fullDatabase.players.length)}
                  </p>
                </div>
              </Card>
            </div>

            <Card className="mt-6 p-6">
              <h3 className="font-bold mb-4">League Reputation Rankings</h3>
              <div className="space-y-2">
                {[...europeanLeagues]
                  .filter(l => l.tier > 0)
                  .sort((a, b) => b.reputation - a.reputation)
                  .map((league, idx) => (
                    <div key={league.id} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <span className="font-medium">{league.name}</span>
                        <span className="text-sm text-muted-foreground">({league.country})</span>
                      </div>
                      <span className="text-sm font-bold">{league.reputation}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WorldPage;
