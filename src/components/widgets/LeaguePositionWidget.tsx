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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Trophy className="h-3 w-3 text-primary" />
          League Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold gradient-text">{myTeam.position}</span>
              <span className="text-sm text-muted-foreground">
                {myTeam.position === 1 ? 'st' : myTeam.position === 2 ? 'nd' : myTeam.position === 3 ? 'rd' : 'th'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {myTeam.points} pts • {myTeam.played} played
            </p>
          </div>
          {myTeam.position <= 4 && (
            <Badge variant="default" className="text-xs px-2 py-0">UCL</Badge>
          )}
        </div>

        {myTeam.form && Array.isArray(myTeam.form) && myTeam.form.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Form</p>
            <div className="flex gap-1">
              {myTeam.form.slice(-5).map((result: string, idx: number) => (
                <div 
                  key={idx}
                  className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${getResultColor(result)}`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs h-8"
          onClick={() => navigate('/competitions')}
        >
          Full Table
        </Button>
      </CardContent>
    </Card>
  );
}
