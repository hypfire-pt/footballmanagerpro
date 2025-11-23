import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpDown, ArrowUp, ArrowDown, Trophy, Target, Users as UsersIcon, Star } from "lucide-react";
import { TeamLogo } from "@/components/TeamLogo";

interface PlayerStat {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  position: string;
  appearances: number;
  goals: number;
  assists: number;
  average_rating: number;
  clean_sheets?: number;
}

type SortField = 'goals' | 'assists' | 'average_rating' | 'appearances';
type SortDirection = 'asc' | 'desc';

export default function PlayerStatsPage() {
  const { currentSave } = useCurrentSave();
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('goals');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchPlayerStats();
  }, [currentSave]);

  const fetchPlayerStats = async () => {
    if (!currentSave?.id) return;

    try {
      setLoading(true);

      const { data: savePlayers, error } = await supabase
        .from('save_players')
        .select(`
          player_id,
          team_id,
          appearances,
          goals,
          assists,
          average_rating,
          player:players(name, position),
          team:teams!save_players_team_id_fkey(name)
        `)
        .eq('save_id', currentSave.id)
        .gt('appearances', 0);

      if (error) throw error;

      const formattedStats: PlayerStat[] = (savePlayers || []).map((sp: any) => ({
        player_id: sp.player_id,
        player_name: sp.player?.name || 'Unknown',
        team_id: sp.team_id,
        team_name: sp.team?.name || 'Unknown',
        position: sp.player?.position || 'N/A',
        appearances: sp.appearances,
        goals: sp.goals,
        assists: sp.assists,
        average_rating: sp.average_rating || 0,
        clean_sheets: sp.player?.position === 'GK' ? Math.floor(sp.appearances * 0.4) : undefined
      }));

      setPlayers(formattedStats);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [players, sortField, sortDirection]);

  const topScorers = useMemo(() => {
    return [...players].sort((a, b) => b.goals - a.goals).slice(0, 10);
  }, [players]);

  const topAssists = useMemo(() => {
    return [...players].sort((a, b) => b.assists - a.assists).slice(0, 10);
  }, [players]);

  const topRatings = useMemo(() => {
    return [...players]
      .filter(p => p.appearances >= 5)
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, 10);
  }, [players]);

  const goalkeepers = useMemo(() => {
    return [...players]
      .filter(p => p.position === 'GK' && p.appearances >= 3)
      .sort((a, b) => (b.clean_sheets || 0) - (a.clean_sheets || 0))
      .slice(0, 10);
  }, [players]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const StatTable = ({ data, showGoals = true, showAssists = true, showCleanSheets = false }: {
    data: PlayerStat[];
    showGoals?: boolean;
    showAssists?: boolean;
    showCleanSheets?: boolean;
  }) => (
    <Table>
      <TableHeader>
        <TableRow className="text-xs hover:bg-muted/30">
          <TableHead className="text-xs w-12">Rank</TableHead>
          <TableHead className="text-xs">Player</TableHead>
          <TableHead className="text-xs">Team</TableHead>
          <TableHead className="text-xs">Pos</TableHead>
          <TableHead className="text-xs text-center cursor-pointer" onClick={() => handleSort('appearances')}>
            <div className="flex items-center justify-center">
              Apps
              <SortIcon field="appearances" />
            </div>
          </TableHead>
          {showGoals && (
            <TableHead className="text-xs text-center cursor-pointer" onClick={() => handleSort('goals')}>
              <div className="flex items-center justify-center">
                Goals
                <SortIcon field="goals" />
              </div>
            </TableHead>
          )}
          {showAssists && (
            <TableHead className="text-xs text-center cursor-pointer" onClick={() => handleSort('assists')}>
              <div className="flex items-center justify-center">
                Assists
                <SortIcon field="assists" />
              </div>
            </TableHead>
          )}
          {showCleanSheets && (
            <TableHead className="text-xs text-center">Clean Sheets</TableHead>
          )}
          <TableHead className="text-xs text-center cursor-pointer" onClick={() => handleSort('average_rating')}>
            <div className="flex items-center justify-center">
              Rating
              <SortIcon field="average_rating" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((player, idx) => (
          <TableRow key={player.player_id} className="text-xs hover:bg-muted/30">
            <TableCell className="text-xs font-bold">
              {idx + 1 <= 3 ? (
                <Badge variant={idx === 0 ? 'default' : 'secondary'} className="w-6 h-6 flex items-center justify-center p-0">
                  {idx + 1}
                </Badge>
              ) : (
                idx + 1
              )}
            </TableCell>
            <TableCell className="text-xs font-medium">{player.player_name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <TeamLogo teamName={player.team_name} size="sm" />
                <span className="text-xs">{player.team_name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">{player.position}</Badge>
            </TableCell>
            <TableCell className="text-xs text-center">{player.appearances}</TableCell>
            {showGoals && (
              <TableCell className="text-xs text-center font-bold">{player.goals}</TableCell>
            )}
            {showAssists && (
              <TableCell className="text-xs text-center font-bold">{player.assists}</TableCell>
            )}
            {showCleanSheets && (
              <TableCell className="text-xs text-center font-bold">{player.clean_sheets || 0}</TableCell>
            )}
            <TableCell className="text-xs text-center">
              <Badge variant={player.average_rating >= 8 ? 'default' : player.average_rating >= 7 ? 'secondary' : 'outline'}>
                {player.average_rating.toFixed(2)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Player Statistics</h1>
          <p className="text-sm text-muted-foreground">League-wide player performance statistics</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading player statistics...</div>
        ) : (
          <>
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border/40 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Top Scorer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{topScorers[0]?.player_name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{topScorers[0]?.goals || 0} goals</div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Top Assist Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{topAssists[0]?.player_name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{topAssists[0]?.assists || 0} assists</div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    Highest Rated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{topRatings[0]?.player_name || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{topRatings[0]?.average_rating.toFixed(2) || 0} avg</div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-green-500" />
                    Total Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{players.length}</div>
                  <div className="text-xs text-muted-foreground">with appearances</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Statistics Tabs */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Detailed Statistics</CardTitle>
                <CardDescription className="text-xs">
                  Click column headers to sort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="scorers" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 text-xs">
                    <TabsTrigger value="scorers" className="text-xs">Top Scorers</TabsTrigger>
                    <TabsTrigger value="assists" className="text-xs">Top Assists</TabsTrigger>
                    <TabsTrigger value="ratings" className="text-xs">Top Ratings</TabsTrigger>
                    <TabsTrigger value="goalkeepers" className="text-xs">Goalkeepers</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scorers" className="mt-4">
                    <StatTable data={topScorers} showAssists={true} />
                  </TabsContent>

                  <TabsContent value="assists" className="mt-4">
                    <StatTable data={topAssists} showGoals={true} />
                  </TabsContent>

                  <TabsContent value="ratings" className="mt-4">
                    <StatTable data={topRatings} showGoals={true} showAssists={true} />
                  </TabsContent>

                  <TabsContent value="goalkeepers" className="mt-4">
                    <StatTable data={goalkeepers} showGoals={false} showAssists={false} showCleanSheets={true} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
