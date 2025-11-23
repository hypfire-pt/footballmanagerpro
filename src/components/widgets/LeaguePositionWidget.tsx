import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";

export function LeaguePositionWidget() {
  const navigate = useNavigate();
  const { currentSave, loading: saveLoading } = useCurrentSave();
  const { seasonData, loading: seasonLoading } = useSeasonData(currentSave?.id);

  if (saveLoading || seasonLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const standings = seasonData?.standings_state as any[] || [];
  const myTeam = standings.find((s: any) => s.team_name === currentSave?.team_name);
  const topTeams = standings.slice(0, 4);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'D': return 'bg-yellow-500';
      case 'L': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!myTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            League Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No standings data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          League Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{myTeam.position}{myTeam.position === 1 ? 'st' : myTeam.position === 2 ? 'nd' : myTeam.position === 3 ? 'rd' : 'th'}</span>
              {myTeam.position <= 4 && <TrendingUp className="h-5 w-5 text-green-500" />}
            </div>
            <p className="text-sm text-muted-foreground">{myTeam.points} points from {myTeam.played} games</p>
          </div>
          {myTeam.position <= 4 && (
            <Badge variant="default" className="h-8">
              Champions League
            </Badge>
          )}
        </div>

        {myTeam.form && Array.isArray(myTeam.form) && myTeam.form.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Recent Form</p>
            <div className="flex gap-1">
              {myTeam.form.slice(-5).map((result: string, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getResultColor(result)}`}
                  >
                    {result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-semibold">Top 4 Standings</p>
          <div className="space-y-1 text-sm">
            {topTeams.map((team: any) => (
              <div 
                key={team.team_id}
                className={`flex justify-between items-center py-1 px-2 rounded ${
                  team.team_name === currentSave?.team_name ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span>{team.position}. {team.team_name}</span>
                <span className="font-semibold">{team.points}</span>
              </div>
            ))}
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/competitions')}
        >
          View Full Table
        </Button>
      </CardContent>
    </Card>
  );
}
