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
    <Card className="border-primary/20 overflow-hidden">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-primary rounded-full" />
            <div>
              <h2 className="text-2xl font-heading font-bold">Next Match</h2>
              <p className="text-xs text-muted-foreground">
                {nextMatch.competition} • Matchweek {nextMatch.matchweek || 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white font-bold text-2xl">
                {nextMatch.homeTeam.substring(0, 3).toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-lg">{nextMatch.homeTeam}</span>
            {isHome && (
              <Badge variant="default" className="mt-1 text-xs">Your Team</Badge>
            )}
          </div>

          <div className="flex flex-col items-center px-8">
            <span className="text-4xl font-bold text-muted-foreground">vs</span>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{isHome ? 'Home' : 'Away'}</span>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <span className="text-white font-bold text-2xl">
                {nextMatch.awayTeam.substring(0, 3).toUpperCase()}
              </span>
            </div>
            <span className="font-bold text-lg">{nextMatch.awayTeam}</span>
            {!isHome && (
              <Badge variant="default" className="mt-1 text-xs">Your Team</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/squad')}
          >
            Team Selection
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/tactics')}
          >
            Match Tactics
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => navigate('/match', { 
              state: { 
                fixture: nextMatch,
                saveId: currentSave?.id
              } 
            })}
          >
            Play Match →
          </Button>
        </div>
      </div>
    </Card>
  );
}
