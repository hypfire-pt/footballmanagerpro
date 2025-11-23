import { Match } from "@/types/game";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TeamLogo } from "./TeamLogo";
import { Calendar, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  const [teamColors, setTeamColors] = useState<Record<string, { primary: string; secondary: string; logoUrl?: string }>>({});

  useEffect(() => {
    const fetchTeamColors = async () => {
      const { data: teams } = await supabase
        .from('teams')
        .select('name, primary_color, secondary_color, logo_url')
        .in('name', [match.homeTeam, match.awayTeam]);

      if (teams) {
        const colorsMap: Record<string, { primary: string; secondary: string; logoUrl?: string }> = {};
        teams.forEach(team => {
          colorsMap[team.name] = {
            primary: team.primary_color,
            secondary: team.secondary_color,
            logoUrl: team.logo_url || undefined
          };
        });
        setTeamColors(colorsMap);
      }
    };

    fetchTeamColors();
  }, [match.homeTeam, match.awayTeam]);

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

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 flex flex-col items-end gap-2">
          <TeamLogo
            teamName={match.homeTeam}
            primaryColor={teamColors[match.homeTeam]?.primary}
            secondaryColor={teamColors[match.homeTeam]?.secondary}
            logoUrl={teamColors[match.homeTeam]?.logoUrl}
            size="sm"
          />
          <p className="font-bold text-sm">{match.homeTeam}</p>
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

        <div className="flex-1 flex flex-col items-start gap-2">
          <TeamLogo
            teamName={match.awayTeam}
            primaryColor={teamColors[match.awayTeam]?.primary}
            secondaryColor={teamColors[match.awayTeam]?.secondary}
            logoUrl={teamColors[match.awayTeam]?.logoUrl}
            size="sm"
          />
          <p className="font-bold text-sm">{match.awayTeam}</p>
        </div>
      </div>

      {match.status === "scheduled" && (
        <Button
          onClick={() => navigate('/match')}
          className="w-full gap-2"
          variant="outline"
        >
          <Play className="h-4 w-4" />
          Simulate Match
        </Button>
      )}
    </Card>
  );
};

export default MatchCard;
