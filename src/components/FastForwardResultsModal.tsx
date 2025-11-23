import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamLogo } from "@/components/TeamLogo";
import { ArrowRight, Calendar, Trophy, Zap } from "lucide-react";
import { format } from "date-fns";

interface FastForwardMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  matchweek: number;
  competition: string;
  keyEvents?: Array<{
    minute: number;
    type: string;
    team: 'home' | 'away';
    player: string;
    description: string;
  }>;
}

interface FastForwardResultsModalProps {
  open: boolean;
  onClose: () => void;
  matches: FastForwardMatch[];
  daysAdvanced: number;
  teamColors?: Record<string, { primary: string; secondary: string; logoUrl?: string }>;
}

export const FastForwardResultsModal = ({
  open,
  onClose,
  matches,
  daysAdvanced,
  teamColors = {}
}: FastForwardResultsModalProps) => {
  // Group matches by matchweek
  const matchesByWeek = matches.reduce((acc, match) => {
    const week = match.matchweek || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(match);
    return acc;
  }, {} as Record<number, FastForwardMatch[]>);

  const sortedWeeks = Object.keys(matchesByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">Fast Forward Complete</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Advanced {daysAdvanced} days • {matches.length} matches simulated across {sortedWeeks.length} matchweek{sortedWeeks.length > 1 ? 's' : ''}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-180px)] px-6">
          <div className="space-y-6 py-4">
            {sortedWeeks.map((week) => (
              <div key={week}>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Matchweek {week}</h3>
                  <Badge variant="outline" className="text-xs">
                    {matchesByWeek[week].length} matches
                  </Badge>
                </div>

                <div className="space-y-2">
                  {matchesByWeek[week].map((match) => {
                    const homeColor = teamColors[match.homeTeamId];
                    const awayColor = teamColors[match.awayTeamId];
                    const goalEvents = match.keyEvents?.filter(e => e.type === 'goal') || [];

                    return (
                      <Card key={match.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[100px]">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(match.date), "MMM d")}
                          </div>

                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-sm font-medium text-right">{match.homeTeam}</span>
                            {homeColor && (
                              <TeamLogo
                                teamName={match.homeTeam}
                                primaryColor={homeColor.primary}
                                secondaryColor={homeColor.secondary}
                                logoUrl={homeColor.logoUrl}
                                size="sm"
                              />
                            )}
                          </div>

                          {/* Score */}
                          <div className="flex items-center gap-2 px-4">
                            <span className="text-xl font-bold">{match.homeScore}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-xl font-bold">{match.awayScore}</span>
                          </div>

                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1">
                            {awayColor && (
                              <TeamLogo
                                teamName={match.awayTeam}
                                primaryColor={awayColor.primary}
                                secondaryColor={awayColor.secondary}
                                logoUrl={awayColor.logoUrl}
                                size="sm"
                              />
                            )}
                            <span className="text-sm font-medium">{match.awayTeam}</span>
                          </div>

                          {/* Competition Badge */}
                          <Badge variant="secondary" className="text-xs min-w-[80px] justify-center">
                            {match.competition}
                          </Badge>
                        </div>

                        {/* Goal Scorers */}
                        {goalEvents.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50 flex gap-4 text-xs">
                            <div className="flex-1">
                              <div className="text-muted-foreground mb-1 font-medium">Home Goals:</div>
                              {goalEvents
                                .filter(e => e.team === 'home')
                                .map((event, idx) => (
                                  <div key={idx} className="text-foreground">
                                    ⚽ {event.player} ({event.minute}')
                                  </div>
                                ))}
                            </div>
                            <div className="flex-1">
                              <div className="text-muted-foreground mb-1 font-medium">Away Goals:</div>
                              {goalEvents
                                .filter(e => e.team === 'away')
                                .map((event, idx) => (
                                  <div key={idx} className="text-foreground">
                                    ⚽ {event.player} ({event.minute}')
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
