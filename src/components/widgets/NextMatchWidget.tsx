import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";

export function NextMatchWidget() {
  const navigate = useNavigate();
  const { currentSave, loading: saveLoading } = useCurrentSave();
  const { seasonData, loading: seasonLoading } = useSeasonData(currentSave?.id);

  if (saveLoading || seasonLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  const fixtures = seasonData?.fixtures_state as any[] || [];
  const nextMatch = fixtures.find((f: any) => 
    (f.homeTeam === currentSave?.team_name || f.awayTeam === currentSave?.team_name) && 
    f.status === 'scheduled'
  );

  if (!nextMatch) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No upcoming matches</p>
      </Card>
    );
  }

  const isHome = nextMatch.homeTeam === currentSave?.team_name;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="border-primary/30">
          {nextMatch.competition} - Matchweek {nextMatch.matchweek || 1}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date(nextMatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">
              {nextMatch.homeTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold">{nextMatch.homeTeam}</span>
          <span className="text-xs text-muted-foreground">Home</span>
        </div>

        <div className="flex flex-col items-center px-6">
          <span className="text-3xl font-bold text-muted-foreground">VS</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
            <span className="text-white font-bold text-xl">
              {nextMatch.awayTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold">{nextMatch.awayTeam}</span>
          <span className="text-xs text-muted-foreground">Away</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
        <MapPin className="h-4 w-4" />
        <span>{isHome ? 'Home' : 'Away'} • {new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/squad')}
        >
          Set Team
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/tactics')}
        >
          Tactics
        </Button>
        <Button 
          className="flex-1"
          onClick={() => navigate('/match', { 
            state: { 
              fixture: nextMatch,
              saveId: currentSave?.id
            } 
          })}
        >
          Play Match
        </Button>
      </div>
    </Card>
  );
}
