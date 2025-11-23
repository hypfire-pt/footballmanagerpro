import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";
import { supabase } from "@/integrations/supabase/client";
import { TeamLogo } from "@/components/TeamLogo";
import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";

interface Standing {
  position: number;
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string[];
}

interface HeadToHeadMatch {
  date: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
}

export default function LeagueStandingsPage() {
  const { currentSave } = useCurrentSave();
  const { seasonData } = useSeasonData(currentSave?.id);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [headToHead, setHeadToHead] = useState<HeadToHeadMatch[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (seasonData) {
      loadStandings();
    }
  }, [seasonData]);

  const loadStandings = () => {
    if (!seasonData?.standings_state) return;

    try {
      const standingsData = seasonData.standings_state as any[];
      setStandings(standingsData);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionStyle = (position: number) => {
    if (position <= 4) return "bg-blue-500/10 border-l-4 border-blue-500";
    if (position <= 6) return "bg-green-500/10 border-l-4 border-green-500";
    if (position >= standings.length - 2) return "bg-red-500/10 border-l-4 border-red-500";
    return "";
  };

  const getFormBadge = (result: string) => {
    if (result === 'W') return <Badge className="bg-green-600 text-white w-5 h-5 flex items-center justify-center p-0 text-xs">W</Badge>;
    if (result === 'D') return <Badge variant="secondary" className="w-5 h-5 flex items-center justify-center p-0 text-xs">D</Badge>;
    return <Badge variant="destructive" className="w-5 h-5 flex items-center justify-center p-0 text-xs">L</Badge>;
  };

  const viewTeamDetails = async (teamId: string, teamName: string) => {
    setSelectedTeam(teamName);

    try {
      // Fetch head-to-head matches
      const { data: matches } = await supabase
        .from('save_matches')
        .select('*')
        .eq('season_id', seasonData?.id)
        .eq('status', 'finished')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('match_date', { ascending: false })
        .limit(5);

      if (matches) {
        setHeadToHead(matches.map((m: any) => ({
          date: m.match_date,
          home_team: m.home_team_name,
          away_team: m.away_team_name,
          home_score: m.home_score,
          away_score: m.away_score
        })));
      }

      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">League Standings</h1>
          <p className="text-sm text-muted-foreground">Full league table with form and statistics</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading standings...</div>
        ) : (
          <>
            {/* Legend */}
            <Card className="border-border/40 bg-card/50">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500/20 border-l-4 border-blue-500" />
                    <span className="text-muted-foreground">UEFA Champions League</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500/20 border-l-4 border-green-500" />
                    <span className="text-muted-foreground">UEFA Europa League</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500/20 border-l-4 border-red-500" />
                    <span className="text-muted-foreground">Relegation Zone</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standings Table */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">League Table</CardTitle>
                <CardDescription className="text-xs">
                  {seasonData?.season_year} Season - Matchday {seasonData?.current_matchday}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableHead className="text-xs w-12">Pos</TableHead>
                      <TableHead className="text-xs">Club</TableHead>
                      <TableHead className="text-xs text-center">Pl</TableHead>
                      <TableHead className="text-xs text-center">W</TableHead>
                      <TableHead className="text-xs text-center">D</TableHead>
                      <TableHead className="text-xs text-center">L</TableHead>
                      <TableHead className="text-xs text-center">GF</TableHead>
                      <TableHead className="text-xs text-center">GA</TableHead>
                      <TableHead className="text-xs text-center">GD</TableHead>
                      <TableHead className="text-xs text-center">Pts</TableHead>
                      <TableHead className="text-xs">Form</TableHead>
                      <TableHead className="text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((team) => (
                      <TableRow 
                        key={team.team_id} 
                        className={`text-xs hover:bg-muted/30 ${getPositionStyle(team.position)}`}
                      >
                        <TableCell className="text-xs font-bold">{team.position}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TeamLogo teamName={team.team_name} size="sm" />
                            <span className={`text-xs font-medium ${team.team_id === currentSave?.team_id ? 'text-primary font-bold' : ''}`}>
                              {team.team_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-center">{team.played}</TableCell>
                        <TableCell className="text-xs text-center">{team.won}</TableCell>
                        <TableCell className="text-xs text-center">{team.drawn}</TableCell>
                        <TableCell className="text-xs text-center">{team.lost}</TableCell>
                        <TableCell className="text-xs text-center">{team.goals_for}</TableCell>
                        <TableCell className="text-xs text-center">{team.goals_against}</TableCell>
                        <TableCell className="text-xs text-center font-semibold">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </TableCell>
                        <TableCell className="text-xs text-center font-bold">{team.points}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(team.form || []).map((result, idx) => (
                              <div key={idx}>{getFormBadge(result)}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewTeamDetails(team.team_id, team.team_name)}
                            className="h-7 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Team Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <TeamLogo teamName={selectedTeam || ''} size="sm" />
              {selectedTeam}
            </DialogTitle>
            <DialogDescription className="text-xs">Recent match results</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last 5 Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {headToHead.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No matches played yet</p>
                ) : (
                  <div className="space-y-2">
                    {headToHead.map((match, idx) => {
                      const isHome = match.home_team === selectedTeam;
                      const teamScore = isHome ? match.home_score : match.away_score;
                      const opponentScore = isHome ? match.away_score : match.home_score;
                      const opponent = isHome ? match.away_team : match.home_team;
                      const result = teamScore > opponentScore ? 'W' : teamScore < opponentScore ? 'L' : 'D';

                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-xs">
                          <div className="flex items-center gap-3">
                            {result === 'W' && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {result === 'L' && <TrendingDown className="h-4 w-4 text-red-500" />}
                            {result === 'D' && <Minus className="h-4 w-4 text-yellow-500" />}
                            <span className="text-muted-foreground">{isHome ? 'vs' : '@'}</span>
                            <span className="font-medium">{opponent}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">
                              {teamScore} - {opponentScore}
                            </span>
                            {getFormBadge(result)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
