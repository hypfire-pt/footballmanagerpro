import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TeamLogo } from "@/components/TeamLogo";
import { SimulationResult } from "@/types/match";

interface MatchRecord {
  id: string;
  match_date: string;
  home_team_id: string;
  home_team_name: string;
  away_team_id: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  match_data: any;
  competition: string;
}

export default function MatchHistoryPage() {
  const { currentSave } = useCurrentSave();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMatchHistory();
  }, [currentSave]);

  const fetchMatchHistory = async () => {
    if (!currentSave?.id) return;

    try {
      setLoading(true);

      // Get current season
      const { data: season } = await supabase
        .from('save_seasons')
        .select('id')
        .eq('save_id', currentSave.id)
        .eq('is_current', true)
        .single();

      if (!season) return;

      // Fetch all finished matches
      const { data: matchData, error } = await supabase
        .from('save_matches')
        .select('*')
        .eq('season_id', season.id)
        .eq('status', 'finished')
        .order('match_date', { ascending: false });

      if (error) throw error;

      setMatches(matchData || []);
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (match: MatchRecord) => {
    if (!currentSave) return null;
    
    const isHome = match.home_team_id === currentSave.team_id;
    const isAway = match.away_team_id === currentSave.team_id;
    
    if (!isHome && !isAway) {
      // AI match
      return <Badge variant="outline" className="text-xs">AI</Badge>;
    }

    const userScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;

    if (userScore > opponentScore) {
      return <Badge variant="default" className="bg-green-600 text-white"><TrendingUp className="h-3 w-3 mr-1" />W</Badge>;
    } else if (userScore < opponentScore) {
      return <Badge variant="destructive"><TrendingDown className="h-3 w-3 mr-1" />L</Badge>;
    } else {
      return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />D</Badge>;
    }
  };

  const openMatchReport = (match: MatchRecord) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const getTopPerformers = (match: MatchRecord) => {
    if (!match.match_data?.playerRatings) return { home: [], away: [] };

    const homeRatings = Object.entries(match.match_data.playerRatings.home || {})
      .map(([name, rating]) => ({ name, rating: rating as number }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    const awayRatings = Object.entries(match.match_data.playerRatings.away || {})
      .map(([name, rating]) => ({ name, rating: rating as number }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    return { home: homeRatings, away: awayRatings };
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Match History</h1>
          <p className="text-sm text-muted-foreground">View all completed fixtures and detailed match reports</p>
        </div>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Completed Matches</CardTitle>
            <CardDescription className="text-xs">
              {matches.length} matches played this season
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Loading match history...</div>
            ) : matches.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No completed matches yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-xs hover:bg-muted/30">
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Competition</TableHead>
                    <TableHead className="text-xs">Home</TableHead>
                    <TableHead className="text-xs text-center">Score</TableHead>
                    <TableHead className="text-xs">Away</TableHead>
                    <TableHead className="text-xs text-center">Result</TableHead>
                    <TableHead className="text-xs text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="text-xs font-medium">
                        {format(new Date(match.match_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-xs">{match.competition}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.home_team_name} size="sm" />
                          <span className="text-xs font-medium">{match.home_team_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-bold">
                          {match.home_score} - {match.away_score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.away_team_name} size="sm" />
                          <span className="text-xs font-medium">{match.away_team_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getResultBadge(match)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openMatchReport(match)}
                          className="h-7 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Match Report</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedMatch && format(new Date(selectedMatch.match_date), 'EEEE, dd MMMM yyyy')}
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-6">
              {/* Score Summary */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <TeamLogo teamName={selectedMatch.home_team_name} size="sm" />
                  <span className="font-semibold text-sm">{selectedMatch.home_team_name}</span>
                </div>
                <div className="text-center px-6">
                  <div className="text-3xl font-bold">
                    {selectedMatch.home_score} - {selectedMatch.away_score}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Full Time</div>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold text-sm">{selectedMatch.away_team_name}</span>
                  <TeamLogo teamName={selectedMatch.away_team_name} size="sm" />
                </div>
              </div>

              <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-3 text-xs">
                  <TabsTrigger value="events" className="text-xs">Match Events</TabsTrigger>
                  <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
                  <TabsTrigger value="ratings" className="text-xs">Player Ratings</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Key Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedMatch.match_data?.events?.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs p-2 rounded hover:bg-muted/30">
                            <span className="font-mono font-semibold text-muted-foreground w-12">{event.minute}'</span>
                            <Badge variant={event.type === 'goal' ? 'default' : 'outline'} className="text-xs">
                              {event.type}
                            </Badge>
                            <span className="text-xs">{event.description}</span>
                          </div>
                        )) || <p className="text-xs text-muted-foreground">No event data available</p>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Match Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedMatch.match_data?.stats ? (
                        <div className="space-y-4">
                          {Object.entries(selectedMatch.match_data.stats).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{value.home || 0}</span>
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span>{value.away || 0}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ 
                                    width: `${(value.home / (value.home + value.away)) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No statistics available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ratings" className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TeamLogo teamName={selectedMatch.home_team_name} size="sm" />
                          {selectedMatch.home_team_name} - Top Performers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getTopPerformers(selectedMatch).home.map((player, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded hover:bg-muted/30">
                              <span className="font-medium">{player.name}</span>
                              <Badge variant={player.rating >= 8 ? 'default' : 'secondary'} className="text-xs">
                                {player.rating.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TeamLogo teamName={selectedMatch.away_team_name} size="sm" />
                          {selectedMatch.away_team_name} - Top Performers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {getTopPerformers(selectedMatch).away.map((player, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded hover:bg-muted/30">
                              <span className="font-medium">{player.name}</span>
                              <Badge variant={player.rating >= 8 ? 'default' : 'secondary'} className="text-xs">
                                {player.rating.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
