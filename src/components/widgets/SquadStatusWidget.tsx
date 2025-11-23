import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, Heart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentSave } from "@/hooks/useCurrentSave";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface SquadStats {
  totalPlayers: number;
  injuries: number;
  suspensions: number;
  avgFitness: number;
  avgMorale: number;
}

export function SquadStatusWidget() {
  const navigate = useNavigate();
  const { currentSave } = useCurrentSave();
  const [stats, setStats] = useState<SquadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSquadStats() {
      if (!currentSave?.id) return;

      try {
        const { data: players, error } = await supabase
          .from('save_players')
          .select('fitness, morale, red_cards, yellow_cards')
          .eq('save_id', currentSave.id)
          .eq('team_id', currentSave.team_id);

        if (error) throw error;

        if (players && players.length > 0) {
          // Calculate injuries (fitness < 50 could indicate injury)
          const injuries = players.filter(p => p.fitness < 50).length;
          
          // Calculate suspensions (players with red cards)
          const suspensions = players.filter(p => p.red_cards > 0).length;
          
          // Calculate average fitness
          const avgFitness = Math.round(
            players.reduce((sum, p) => sum + p.fitness, 0) / players.length
          );
          
          // Calculate average morale (scale to High/Medium/Low)
          const avgMoraleNum = players.reduce((sum, p) => sum + p.morale, 0) / players.length;

          setStats({
            totalPlayers: players.length,
            injuries,
            suspensions,
            avgFitness,
            avgMorale: avgMoraleNum
          });
        }
      } catch (err) {
        console.error('Error fetching squad stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSquadStats();
  }, [currentSave?.id, currentSave?.team_id]);

  const getMoraleText = (morale: number) => {
    if (morale >= 8) return { text: 'High', color: 'text-green-600' };
    if (morale >= 5) return { text: 'Medium', color: 'text-yellow-600' };
    return { text: 'Low', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Squad Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            Squad Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No squad data available</p>
        </CardContent>
      </Card>
    );
  }

  const moraleInfo = getMoraleText(stats.avgMorale);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Squad Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Injuries</span>
          </div>
          <span className="text-sm font-bold">{stats.injuries}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Suspended</span>
          </div>
          <span className="text-sm font-bold">{stats.suspensions}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-medium">Avg Fitness</span>
            </div>
            <span className="font-bold">{stats.avgFitness}%</span>
          </div>
          <Progress value={stats.avgFitness} className="h-2" />
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Morale</span>
          </div>
          <span className={`text-sm font-bold ${moraleInfo.color}`}>{moraleInfo.text}</span>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/squad')}
        >
          View Squad
        </Button>
      </CardContent>
    </Card>
  );
}
