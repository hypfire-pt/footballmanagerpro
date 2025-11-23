import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimulationResult } from "@/types/match";
import { Trophy, Target, Activity, ArrowRight } from "lucide-react";

interface MatchResultSummaryProps {
  homeTeam: string;
  awayTeam: string;
  result: SimulationResult;
  open: boolean;
  onContinue: () => void;
}

export const MatchResultSummary = ({
  homeTeam,
  awayTeam,
  result,
  open,
  onContinue,
}: MatchResultSummaryProps) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onContinue]);

  const homeGoals = result.events.filter(e => e.type === 'goal' && e.team === 'home');
  const awayGoals = result.events.filter(e => e.type === 'goal' && e.team === 'away');
  const homeShots = result.events.filter(e => e.team === 'home' && ['shot', 'shot_on_target'].includes(e.type)).length;
  const awayShots = result.events.filter(e => e.team === 'away' && ['shot', 'shot_on_target'].includes(e.type)).length;
  
  const allPlayers = { ...result.playerRatings.home, ...result.playerRatings.away };
  const motm = Object.entries(allPlayers).reduce((best, [player, rating]) => 
    rating > best.rating ? { player, rating } : best
  , { player: '', rating: 0 });

  const resultType = result.homeScore > result.awayScore ? 'win' : result.homeScore < result.awayScore ? 'loss' : 'draw';
  const resultColor = resultType === 'win' ? 'text-green-500' : resultType === 'loss' ? 'text-red-500' : 'text-yellow-500';

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading gradient-text text-center">Full Time</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Final Score */}
          <Card className="glass border-border/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h3 className="text-lg font-heading font-bold">{homeTeam}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-heading font-bold ${resultColor}`}>{result.homeScore}</span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className={`text-4xl font-heading font-bold ${resultType === 'loss' ? 'text-green-500' : resultType === 'win' ? 'text-red-500' : 'text-yellow-500'}`}>{result.awayScore}</span>
              </div>
              <div className="flex-1 text-center">
                <h3 className="text-lg font-heading font-bold">{awayTeam}</h3>
              </div>
            </div>
          </Card>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-border/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-heading font-semibold">Shots</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{homeShots}</span>
                <span className="text-xs text-muted-foreground">vs</span>
                <span className="text-2xl font-bold">{awayShots}</span>
              </div>
            </Card>

            <Card className="glass border-border/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-heading font-semibold">Man of the Match</h3>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{motm.player}</p>
                <Badge variant="secondary" className="mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  {motm.rating.toFixed(1)}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Goalscorers */}
          {(homeGoals.length > 0 || awayGoals.length > 0) && (
            <Card className="glass border-border/50 p-4">
              <h3 className="text-sm font-heading font-semibold mb-3">Goalscorers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {homeGoals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="w-8 justify-center">{goal.minute}'</Badge>
                      <span className="truncate">{goal.player}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {awayGoals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm justify-end">
                      <span className="truncate">{goal.player}</span>
                      <Badge variant="outline" className="w-8 justify-center">{goal.minute}'</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Auto-advance notice */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Auto-advancing in {countdown} seconds...
            </p>
            <Button onClick={onContinue} size="sm" className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
