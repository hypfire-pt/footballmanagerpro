import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeamLogo } from "@/components/TeamLogo";
import { TrendingUp, TrendingDown, ArrowRight, Target, AlertCircle, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MatchResult {
  id: string;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  match_data?: any;
}

interface PositionChange {
  team_name: string;
  old_position: number;
  new_position: number;
  points_gained: number;
}

interface MatchdaySummaryProps {
  open: boolean;
  onClose: () => void;
  matchday: number;
  matches: MatchResult[];
  positionChanges: PositionChange[];
  topScorers?: { player: string; goals: number }[];
  userTeamId?: string;
}

export function MatchdaySummary({
  open,
  onClose,
  matchday,
  matches,
  positionChanges,
  topScorers = [],
  userTeamId
}: MatchdaySummaryProps) {
  const getResultBadge = (homeScore: number, awayScore: number, perspective: 'home' | 'away') => {
    const isWin = perspective === 'home' ? homeScore > awayScore : awayScore > homeScore;
    const isDraw = homeScore === awayScore;
    const isLoss = perspective === 'home' ? homeScore < awayScore : awayScore < homeScore;

    if (isWin) return <Badge className="bg-green-600 text-white text-xs">W</Badge>;
    if (isDraw) return <Badge variant="secondary" className="text-xs">D</Badge>;
    return <Badge variant="destructive" className="text-xs">L</Badge>;
  };

  const getPositionChangeIcon = (change: PositionChange) => {
    const diff = change.old_position - change.new_position;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  };

  const getGoalScorers = (match: MatchResult) => {
    if (!match.match_data?.events) return [];
    
    return match.match_data.events
      .filter((e: any) => e.type === 'goal')
      .map((e: any) => ({
        player: e.player,
        minute: e.minute,
        team: e.team
      }));
  };

  const getCards = (match: MatchResult) => {
    if (!match.match_data?.events) return { yellow: 0, red: 0 };
    
    const events = match.match_data.events;
    return {
      yellow: events.filter((e: any) => e.type === 'yellow_card').length,
      red: events.filter((e: any) => e.type === 'red_card').length
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Matchday {matchday} Summary</DialogTitle>
          <DialogDescription className="text-sm">
            Round complete - {matches.length} matches played
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Results */}
          <Card className="border-border/40 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">All Results</CardTitle>
              <CardDescription className="text-xs">Match results from this round</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matches.map((match) => {
                  const goalScorers = getGoalScorers(match);
                  const cards = getCards(match);
                  
                  return (
                    <div key={match.id} className="border border-border/40 rounded-lg p-4 bg-background/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <TeamLogo teamName={match.home_team_name} size="sm" />
                          <span className="text-sm font-semibold">{match.home_team_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 px-6">
                          {getResultBadge(match.home_score, match.away_score, 'home')}
                          <div className="text-2xl font-bold">
                            {match.home_score} - {match.away_score}
                          </div>
                          {getResultBadge(match.home_score, match.away_score, 'away')}
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="text-sm font-semibold">{match.away_team_name}</span>
                          <TeamLogo teamName={match.away_team_name} size="sm" />
                        </div>
                      </div>

                      {/* Goal Scorers and Cards */}
                      {(goalScorers.length > 0 || cards.yellow > 0 || cards.red > 0) && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            {goalScorers.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-primary" />
                                <span className="text-muted-foreground">
                                  {goalScorers.map(g => `${g.player} ${g.minute}'`).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          {(cards.yellow > 0 || cards.red > 0) && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              {cards.yellow > 0 && <Badge variant="outline" className="bg-yellow-500/20 text-xs">{cards.yellow} Yellow</Badge>}
                              {cards.red > 0 && <Badge variant="destructive" className="text-xs">{cards.red} Red</Badge>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Position Changes */}
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">League Table Changes</CardTitle>
                <CardDescription className="text-xs">Position movements this matchday</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs hover:bg-muted/30">
                      <TableHead className="text-xs">Team</TableHead>
                      <TableHead className="text-xs text-center">Movement</TableHead>
                      <TableHead className="text-xs text-center">Position</TableHead>
                      <TableHead className="text-xs text-center">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionChanges.slice(0, 10).map((change) => (
                      <TableRow key={change.team_name} className="text-xs hover:bg-muted/30">
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <TeamLogo teamName={change.team_name} size="sm" />
                            {change.team_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getPositionChangeIcon(change)}
                        </TableCell>
                        <TableCell className="text-xs text-center">
                          <span className="text-muted-foreground">{change.old_position}</span>
                          <ChevronRight className="h-3 w-3 inline mx-1" />
                          <span className="font-semibold">{change.new_position}</span>
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold">
                          +{change.points_gained}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Scorers */}
            {topScorers.length > 0 && (
              <Card className="border-border/40 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-base">Matchday Top Scorers</CardTitle>
                  <CardDescription className="text-xs">Players who scored this round</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topScorers.slice(0, 5).map((scorer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-sm font-medium">{scorer.player}</span>
                        <Badge variant="default" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onClose} className="text-sm">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
