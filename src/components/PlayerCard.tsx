import { Player } from "@/types/game";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      GK: "bg-stat-gold/20 text-stat-gold",
      CB: "bg-blue-500/20 text-blue-500",
      LB: "bg-blue-500/20 text-blue-500",
      RB: "bg-blue-500/20 text-blue-500",
      CM: "bg-pitch-green/20 text-pitch-green",
      CDM: "bg-pitch-green/20 text-pitch-green",
      CAM: "bg-pitch-green/20 text-pitch-green",
      LW: "bg-red-500/20 text-red-500",
      RW: "bg-red-500/20 text-red-500",
      ST: "bg-red-500/20 text-red-500",
    };
    return colors[position] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">{player.name}</h3>
          <p className="text-sm text-muted-foreground">
            {player.nationality} • Age {player.age}
          </p>
        </div>
        <Badge className={getPositionColor(player.position)}>
          {player.position}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Overall</p>
          <p className="text-2xl font-bold text-pitch-green">{player.overall}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Potential</p>
          <p className="text-2xl font-bold">{player.potential}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pace</span>
          <span className="font-semibold">{player.pace}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shooting</span>
          <span className="font-semibold">{player.shooting}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Passing</span>
          <span className="font-semibold">{player.passing}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Defending</span>
          <span className="font-semibold">{player.defending}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Value</span>
          <span className="font-bold text-pitch-green">
            {formatCurrency(player.marketValue)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-muted-foreground">Wage</span>
          <span className="font-semibold">
            {formatCurrency(player.wage)}/week
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-muted-foreground">Contract</span>
          <span className="font-semibold">{player.contract}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Fitness</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-pitch-green"
              style={{ width: `${player.fitness}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Morale</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${player.morale}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;
