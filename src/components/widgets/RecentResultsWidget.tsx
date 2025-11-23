import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { useSeasonData } from "@/hooks/useSeasonData";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function RecentResultsWidget() {
  const { currentSave } = useCurrentSave();
  const { seasonData, loading: seasonLoading } = useSeasonData(currentSave?.id);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentMatches() {
      if (!seasonData?.id) return;

      try {
        const { data, error } = await supabase
          .from('save_matches')
          .select('*')
          .eq('season_id', seasonData.id)
          .eq('status', 'finished')
          .or(`home_team_name.eq.${currentSave?.team_name},away_team_name.eq.${currentSave?.team_name}`)
          .order('match_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentMatches(data || []);
      } catch (err) {
        console.error('Error fetching recent matches:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentMatches();
  }, [seasonData?.id, currentSave?.team_name]);

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'W': return <Badge className="bg-green-500 hover:bg-green-600">W</Badge>;
      case 'D': return <Badge className="bg-yellow-500 hover:bg-yellow-600">D</Badge>;
      case 'L': return <Badge className="bg-red-500 hover:bg-red-600">L</Badge>;
      default: return null;
    }
  };

  if (loading || seasonLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (recentMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No matches played yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" />
          Recent Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {recentMatches.map((match, idx) => {
            const isHome = match.home_team_name === currentSave?.team_name;
            const myScore = isHome ? match.home_score : match.away_score;
            const oppScore = isHome ? match.away_score : match.home_score;
            const result = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D';

            return (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs flex-shrink-0 w-8 justify-center">
                    {match.competition.slice(0, 3).toUpperCase()}
                  </Badge>
                  <div className="text-sm truncate">
                    <span className={match.home_team_name === currentSave?.team_name ? 'font-semibold' : ''}>
                      {match.home_team_name.length > 12 ? match.home_team_name.slice(0, 12) + '...' : match.home_team_name}
                    </span>
                    {' '}
                    <span className="text-muted-foreground font-bold text-xs">{match.home_score}-{match.away_score}</span>
                    {' '}
                    <span className={match.away_team_name === currentSave?.team_name ? 'font-semibold' : ''}>
                      {match.away_team_name.length > 12 ? match.away_team_name.slice(0, 12) + '...' : match.away_team_name}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getResultBadge(result)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
