import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamLogo } from "./TeamLogo";

interface LeagueTableProps {
  standings: any[];
}

const LeagueTable = ({ standings }: LeagueTableProps) => {
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchTeamLogos = async () => {
      const teamNames = standings.map(s => s.team_name);
      const { data } = await supabase
        .from('teams')
        .select('name, logo_url')
        .in('name', teamNames);
      
      if (data) {
        const logos = data.reduce((acc, team) => {
          if (team.logo_url) {
            acc[team.name] = team.logo_url;
          }
          return acc;
        }, {} as Record<string, string>);
        setTeamLogos(logos);
      }
    };

    if (standings.length > 0) {
      fetchTeamLogos();
    }
  }, [standings]);

  const getFormBadge = (result: string) => {
    const variants: Record<string, string> = {
      W: "bg-result-win/20 text-result-win",
      D: "bg-result-draw/20 text-result-draw",
      L: "bg-result-loss/20 text-result-loss",
    };
    return variants[result] || "";
  };

  const getPositionStyle = (position: number) => {
    if (position <= 4) return "bg-pitch-green/10 border-l-4 border-pitch-green";
    if (position <= 6) return "bg-blue-500/10 border-l-4 border-blue-500";
    if (position >= 18) return "bg-result-loss/10 border-l-4 border-result-loss";
    return "";
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Club</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">GF</TableHead>
            <TableHead className="text-center">GA</TableHead>
            <TableHead className="text-center">GD</TableHead>
            <TableHead className="text-center font-bold">Pts</TableHead>
            <TableHead className="text-center">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((team) => (
            <TableRow
              key={team.position}
              className={`${getPositionStyle(team.position)} hover:bg-muted/30 transition-colors`}
            >
              <TableCell className="text-center font-bold">
                {team.position}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <TeamLogo 
                    teamName={team.team_name} 
                    logoUrl={teamLogos[team.team_name]}
                    size="sm"
                  />
                  <span className="font-semibold">{team.team_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{team.played}</TableCell>
              <TableCell className="text-center">{team.won}</TableCell>
              <TableCell className="text-center">{team.drawn}</TableCell>
              <TableCell className="text-center">{team.lost}</TableCell>
              <TableCell className="text-center">{team.goals_for}</TableCell>
              <TableCell className="text-center">{team.goals_against}</TableCell>
              <TableCell className="text-center font-semibold">
                {team.goal_difference > 0 && "+"}
                {team.goal_difference}
              </TableCell>
              <TableCell className="text-center font-bold text-lg">
                {team.points}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-1 justify-center">
                  {team.form && Array.isArray(team.form) && team.form.slice(-5).map((result: string, idx: number) => (
                    <Badge
                      key={idx}
                      className={`${getFormBadge(result)} w-6 h-6 flex items-center justify-center p-0 text-xs font-bold`}
                    >
                      {result}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeagueTable;
