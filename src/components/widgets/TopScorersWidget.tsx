import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target } from "lucide-react";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface TopPlayer {
  player_name: string;
  position: string;
  goals: number;
  assists: number;
  appearances: number;
}

export function TopScorersWidget() {
  const { currentSave } = useCurrentSave();
  const [topScorers, setTopScorers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopScorers() {
      if (!currentSave?.id) return;

      try {
        const { data, error } = await supabase
          .from('save_players')
          .select(`
            goals,
            assists,
            appearances,
            players:player_id (
              name,
              position
            )
          `)
          .eq('save_id', currentSave.id)
          .eq('team_id', currentSave.team_id)
          .gt('appearances', 0)
          .order('goals', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formatted = (data || []).map((sp: any) => ({
          player_name: sp.players?.name || 'Unknown',
          position: sp.players?.position || 'N/A',
          goals: sp.goals,
          assists: sp.assists,
          appearances: sp.appearances
        }));

        setTopScorers(formatted);
      } catch (err) {
        console.error('Error fetching top scorers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopScorers();
  }, [currentSave?.id, currentSave?.team_id]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" />
            Top Scorers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (topScorers.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" />
            Top Scorers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No goals scored yet this season</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Top Scorers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topScorers.map((player, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{player.player_name}</p>
                  <p className="text-xs text-muted-foreground">{player.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  {player.goals}
                </Badge>
                {player.assists > 0 && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Target className="h-3 w-3 text-blue-500" />
                    {player.assists}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
