import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { europeanLeagues } from "@/data/leagues";
import { europeanTeams } from "@/data/teams";
import { Trophy, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompetitionsPage = () => {
  const navigate = useNavigate();
  
  const domesticLeagues = europeanLeagues.filter(l => l.tier > 0);
  const europeanCompetitions = europeanLeagues.filter(l => l.tier === 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Competitions</h1>
          <p className="text-muted-foreground">
            View all domestic leagues and European competitions
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            European Competitions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {europeanCompetitions.map(comp => (
              <Card key={comp.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Trophy className="h-8 w-8 text-primary" />
                    <Badge variant="default">Rep: {comp.reputation}</Badge>
                  </div>
                  <CardTitle className="mt-4">{comp.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Founded {comp.founded}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/calendar")} 
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4" />
                    View Fixtures
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Domestic Leagues
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domesticLeagues.map(league => {
              const leagueTeams = europeanTeams.filter(t => t.leagueId === league.id);
              
              return (
                <Card key={league.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{league.country}</Badge>
                      <Badge variant="secondary">Rep: {league.reputation}</Badge>
                    </div>
                    <CardTitle className="text-lg">{league.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{leagueTeams.length} teams</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {league.id === "premier-league" ? (
                          <>
                            <Button 
                              onClick={() => navigate("/league")}
                              className="flex-1 gap-2" 
                              size="sm"
                            >
                              <Trophy className="h-3 w-3" />
                              Table
                            </Button>
                            <Button 
                              onClick={() => navigate("/calendar")}
                              className="flex-1 gap-2" 
                              size="sm"
                              variant="outline"
                            >
                              <Calendar className="h-3 w-3" />
                              Fixtures
                            </Button>
                          </>
                        ) : (
                          <Button disabled className="w-full" size="sm" variant="outline">
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="mt-8 p-6">
          <h3 className="font-bold mb-4">Competition Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-3xl font-bold text-primary">{europeanLeagues.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Domestic</p>
              <p className="text-3xl font-bold text-primary">{domesticLeagues.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">European</p>
              <p className="text-3xl font-bold text-primary">{europeanCompetitions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Teams</p>
              <p className="text-3xl font-bold text-primary">{europeanTeams.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompetitionsPage;
