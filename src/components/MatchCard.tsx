import { Match } from "@/types/game";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar } from "lucide-react";

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case "finished":
        return <Badge variant="secondary">FT</Badge>;
      case "live":
        return <Badge className="bg-red-500/20 text-red-500 animate-pulse">LIVE</Badge>;
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(match.date).toLocaleDateString()}
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">
          {match.competition}
        </span>
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <p className="font-bold text-lg">{match.homeTeam}</p>
        </div>

        <div className="px-6">
          {match.status === "finished" || match.status === "live" ? (
            <div className="text-center">
              <p className="text-3xl font-bold">
                {match.homeScore} - {match.awayScore}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
            </div>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-bold text-lg">{match.awayTeam}</p>
        </div>
      </div>
    </Card>
  );
};

export default MatchCard;
