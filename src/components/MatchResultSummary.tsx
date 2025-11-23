import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimulationResult } from "@/types/match";
import { Trophy, Target, Activity, ArrowRight, BarChart3, Repeat } from "lucide-react";
import { MatchStatisticsComparison } from "@/components/MatchStatisticsComparison";
import { MatchHighlightsReplay } from "@/components/MatchHighlightsReplay";

import { TeamLogo } from "@/components/TeamLogo";

interface MatchResultSummaryProps {
  homeTeam: string;
  awayTeam: string;
  result: SimulationResult;
  open: boolean;
  onContinue: () => void;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeColor?: string;
  awayColor?: string;
}

export const MatchResultSummary = ({
  homeTeam,
  awayTeam,
  result,
  open,
  onContinue,
  homeLogoUrl,
  awayLogoUrl,
  homeColor = '#22c55e',
  awayColor = '#3b82f6'
}: MatchResultSummaryProps) => {

  const homeGoals = result.events.filter(e => e.type === 'goal' && e.team === 'home');
  const awayGoals = result.events.filter(e => e.type === 'goal' && e.team === 'away');
  const homeFirstHalfGoals = homeGoals.filter(g => g.minute <= 45);
  const awayFirstHalfGoals = awayGoals.filter(g => g.minute <= 45);
  const homeSecondHalfGoals = homeGoals.filter(g => g.minute > 45);
  const awaySecondHalfGoals = awayGoals.filter(g => g.minute > 45);
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
      <DialogContent className="max-w-4xl max-h-[90vh] glass border-border/50 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading gradient-text text-center">Full Time</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="summary">
              <Trophy className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="highlights">
              <Repeat className="h-4 w-4 mr-2" />
              Highlights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
          {/* Final Score with Logos */}
          <Card className="glass border-border/50 p-6">
            <div className="flex items-center justify-between gap-6">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <TeamLogo
                  teamName={homeTeam}
                  primaryColor={homeColor}
                  secondaryColor="#ffffff"
                  logoUrl={homeLogoUrl}
                  size="lg"
                />
                <h3 className="text-lg font-heading font-bold text-center">{homeTeam}</h3>
              </div>
              
              {/* Score and Half Breakdown */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-heading font-bold ${resultColor}`}>{result.homeScore}</span>
                  <span className="text-3xl text-muted-foreground">-</span>
                  <span className={`text-5xl font-heading font-bold ${resultType === 'loss' ? 'text-green-500' : resultType === 'win' ? 'text-red-500' : 'text-yellow-500'}`}>{result.awayScore}</span>
                </div>
                
                {/* Half Time and Full Time Breakdown */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">HT</p>
                    <p className="font-semibold">
                      {homeFirstHalfGoals.length} - {awayFirstHalfGoals.length}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">FT</p>
                    <p className="font-semibold">
                      {result.homeScore} - {result.awayScore}
                    </p>
                  </div>
                </div>
                
                <Badge variant="outline" className="text-xs">Full Time</Badge>
              </div>
              
              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <TeamLogo
                  teamName={awayTeam}
                  primaryColor={awayColor}
                  secondaryColor="#ffffff"
                  logoUrl={awayLogoUrl}
                  size="lg"
                />
                <h3 className="text-lg font-heading font-bold text-center">{awayTeam}</h3>
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

          {/* Continue Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={onContinue} size="sm" className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <MatchStatisticsComparison
              stats={result.stats}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
            <div className="flex justify-end">
              <Button onClick={onContinue} size="sm" className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="space-y-4">
            <MatchHighlightsReplay
              events={result.events}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
            <div className="flex justify-end">
              <Button onClick={onContinue} size="sm" className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
