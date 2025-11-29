import { DashboardLayout } from "@/components/DashboardLayout";
import LeagueTable from "@/components/LeagueTable";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamLogo } from "@/components/TeamLogo";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  stadium: string;
  capacity: number;
  founded: number | null;
  reputation: number;
  primary_color: string;
  short_name: string | null;
}

const League = () => {
  const { currentSave } = useCurrentSave();
  const { seasonData, loading } = useSeasonData(currentSave?.id);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagueName, setLeagueName] = useState<string>("");
  const [teamsLoading, setTeamsLoading] = useState(true);

  const standings = (seasonData?.standings_state as any[]) || [];

  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentSave?.team_id) return;

      // Get the user's team to find their league
      const { data: userTeam } = await supabase
        .from('teams')
        .select('league_id, leagues(name)')
        .eq('id', currentSave.team_id)
        .single();

      if (userTeam) {
        const leagueId = userTeam.league_id;
        setLeagueName((userTeam.leagues as any)?.name || '');

        // Fetch all teams in the same league
        const { data: leagueTeams } = await supabase
          .from('teams')
          .select('*')
          .eq('league_id', leagueId)
          .order('name');

        if (leagueTeams) {
          setTeams(leagueTeams);
        }
      }
      setTeamsLoading(false);
    };

    fetchTeams();
  }, [currentSave?.team_id]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{leagueName}</h1>
          <p className="text-muted-foreground">
            {seasonData?.season_year}/{(seasonData?.season_year || 2024) + 1} Season • Matchweek {seasonData?.current_matchday || 1} • {teams.length} Teams
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
            {loading ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <LeagueTable standings={standings} />
            )}

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
            {teamsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <Card key={team.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <TeamLogo 
                        teamName={team.name}
                        logoUrl={team.logo_url}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.stadium}</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span>Capacity: {team.capacity.toLocaleString()}</span>
                          {team.founded && <span>Founded: {team.founded}</span>}
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
            )}
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
