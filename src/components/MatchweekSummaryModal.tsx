import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

interface MatchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
}

interface TopScorer {
  player: string;
  team: string;
  goals: number;
}

interface StandingChange {
  team_name: string;
  old_position: number;
  new_position: number;
  points_gained: number;
  change: number;
}

interface MatchweekSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  matchweek: number;
  results: MatchResult[];
  topScorers: TopScorer[];
  standingChanges: StandingChange[];
  continuing?: boolean;
}

export const MatchweekSummaryModal = ({
  open,
  onClose,
  onContinue,
  matchweek,
  results,
  topScorers,
  standingChanges,
  continuing = false
}: MatchweekSummaryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">
            Matchweek {matchweek} Summary
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-6 pb-6">
            {/* Match Results */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Match Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((result) => (
                  <Card key={result.id} className="p-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center text-sm">
                      <div className="text-right truncate font-medium">
                        {result.homeTeam}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded">
                        <span className="font-bold">{result.homeScore}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-bold">{result.awayScore}</span>
                      </div>
                      <div className="truncate font-medium">
                        {result.awayTeam}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Top Scorers */}
            {topScorers.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Top Scorers This Matchweek
                  </h3>
                  <div className="space-y-2">
                    {topScorers.slice(0, 5).map((scorer, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {idx + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{scorer.player}</p>
                              <p className="text-xs text-muted-foreground">{scorer.team}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* League Table Changes */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                League Table Changes
              </h3>
              <div className="space-y-2">
                {standingChanges
                  .filter(change => change.change !== 0)
                  .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                  .slice(0, 8)
                  .map((change, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {change.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : change.change < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge
                              variant={
                                change.change > 0
                                  ? "default"
                                  : change.change < 0
                                  ? "destructive"
                                  : "outline"
                              }
                              className="w-12 text-center"
                            >
                              {change.change > 0 ? '+' : ''}{change.change}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{change.team_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {change.old_position}th → {change.new_position}th place
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          +{change.points_gained} pts
                        </Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={continuing}>
            Close
          </Button>
          <Button onClick={onContinue} disabled={continuing}>
            {continuing ? (
              "Advancing..."
            ) : (
              <>
                Continue to Next Matchweek
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
