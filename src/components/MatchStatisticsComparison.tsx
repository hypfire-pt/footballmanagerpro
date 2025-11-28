import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MatchStats } from "@/types/match";
import { Activity, Target, Circle, Flag, AlertTriangle, Users, Shield, CreditCard } from "lucide-react";

interface MatchStatisticsComparisonProps {
  stats: MatchStats;
  homeTeam: string;
  awayTeam: string;
}

export const MatchStatisticsComparison = ({
  stats,
  homeTeam,
  awayTeam,
}: MatchStatisticsComparisonProps) => {
  const StatRow = ({ 
    label, 
    homeValue, 
    awayValue, 
    icon: Icon,
    isPercentage = false 
  }: { 
    label: string; 
    homeValue: number; 
    awayValue: number; 
    icon: any;
    isPercentage?: boolean;
  }) => {
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold">{isPercentage ? `${homeValue}%` : homeValue}</span>
          </div>
          <div className="flex items-center gap-2 px-4">
            <Icon className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold">{isPercentage ? `${awayValue}%` : awayValue}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Progress value={homePercent} className="h-2 bg-muted" />
          </div>
          <div className="flex-1 rotate-180">
            <Progress value={awayPercent} className="h-2 bg-muted" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-heading font-semibold">Match Statistics</h3>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs font-medium">
          <span>{homeTeam}</span>
          <span>{awayTeam}</span>
        </div>
      </div>

      <div className="space-y-4">
        <StatRow
          label="Possession"
          homeValue={Math.round(stats.possession.home)}
          awayValue={Math.round(stats.possession.away)}
          icon={Circle}
          isPercentage
        />

        <StatRow
          label="Shots"
          homeValue={stats.shots.home}
          awayValue={stats.shots.away}
          icon={Target}
        />

        <StatRow
          label="Shots on Target"
          homeValue={stats.shotsOnTarget.home}
          awayValue={stats.shotsOnTarget.away}
          icon={Target}
        />

        <StatRow
          label="Pass Accuracy"
          homeValue={Math.round(stats.passAccuracy.home)}
          awayValue={Math.round(stats.passAccuracy.away)}
          icon={Users}
          isPercentage
        />

        <StatRow
          label="Passes"
          homeValue={stats.passes.home}
          awayValue={stats.passes.away}
          icon={Users}
        />

        <StatRow
          label="Corners"
          homeValue={stats.corners.home}
          awayValue={stats.corners.away}
          icon={Flag}
        />

        <StatRow
          label="Fouls"
          homeValue={stats.fouls.home}
          awayValue={stats.fouls.away}
          icon={AlertTriangle}
        />

        <StatRow
          label="Offsides"
          homeValue={stats.offsides.home}
          awayValue={stats.offsides.away}
          icon={Flag}
        />

        <StatRow
          label="Yellow Cards"
          homeValue={stats.yellowCards.home}
          awayValue={stats.yellowCards.away}
          icon={CreditCard}
        />

        <StatRow
          label="Red Cards"
          homeValue={stats.redCards.home}
          awayValue={stats.redCards.away}
          icon={CreditCard}
        />
      </div>
    </Card>
  );
};
