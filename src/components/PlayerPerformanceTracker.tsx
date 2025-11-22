import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Activity, Target, Users, Zap } from "lucide-react";

export interface PlayerPerformance {
  playerId: string;
  name: string;
  position: string;
  distanceCovered: number; // in km
  sprints: number;
  passesCompleted: number;
  passesAttempted: number;
  duelsWon: number;
  duelsAttempted: number;
  tackles: number;
  interceptions: number;
  rating: number;
}

interface PlayerPerformanceTrackerProps {
  homeTeam: string;
  awayTeam: string;
  homePlayers: PlayerPerformance[];
  awayPlayers: PlayerPerformance[];
}

const PlayerPerformanceTracker = ({
  homeTeam,
  awayTeam,
  homePlayers,
  awayPlayers
}: PlayerPerformanceTrackerProps) => {
  const renderPlayerStats = (player: PlayerPerformance) => {
    const passAccuracy = player.passesAttempted > 0 
      ? Math.round((player.passesCompleted / player.passesAttempted) * 100)
      : 0;
    const duelSuccess = player.duelsAttempted > 0
      ? Math.round((player.duelsWon / player.duelsAttempted) * 100)
      : 0;

    return (
      <div key={player.playerId} className="p-3 rounded-lg border border-border mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {player.position}
              </Badge>
              <span className="font-semibold">{player.name}</span>
            </div>
          </div>
          <Badge 
            variant={player.rating >= 7.5 ? "default" : "secondary"}
            className="text-sm"
          >
            {player.rating.toFixed(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Distance</span>
            </div>
            <p className="text-sm font-semibold">{player.distanceCovered.toFixed(1)} km</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sprints</span>
            </div>
            <p className="text-sm font-semibold">{player.sprints}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pass Accuracy</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{passAccuracy}%</p>
              <Progress value={passAccuracy} className="h-1" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Duels Won</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{duelSuccess}%</p>
              <Progress value={duelSuccess} className="h-1" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-border">
          <div className="text-xs">
            <span className="text-muted-foreground">Tackles:</span>
            <span className="font-semibold ml-1">{player.tackles}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Interceptions:</span>
            <span className="font-semibold ml-1">{player.interceptions}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5" />
        <h3 className="font-bold">Player Performance</h3>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-3">
          <TabsTrigger value="home">{homeTeam}</TabsTrigger>
          <TabsTrigger value="away">{awayTeam}</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <ScrollArea className="h-[500px]">
            {homePlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No performance data yet...
              </p>
            ) : (
              <div>
                {homePlayers.map(renderPlayerStats)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="away">
          <ScrollArea className="h-[500px]">
            {awayPlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No performance data yet...
              </p>
            ) : (
              <div>
                {awayPlayers.map(renderPlayerStats)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PlayerPerformanceTracker;
