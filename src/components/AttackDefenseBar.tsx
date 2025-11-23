import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface AttackDefenseBarProps {
  homeTeam: string;
  awayTeam: string;
  homeAttack: number; // 0-100
  awayAttack: number; // 0-100
  currentMinute: number;
  homeColor?: string;
  awayColor?: string;
}

export const AttackDefenseBar = ({
  homeTeam,
  awayTeam,
  homeAttack,
  awayAttack,
  currentMinute,
  homeColor = '#22c55e',
  awayColor = '#3b82f6'
}: AttackDefenseBarProps) => {
  // Normalize to 0-100 scale
  const total = homeAttack + awayAttack;
  const homePercent = total > 0 ? (homeAttack / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayAttack / total) * 100 : 50;

  const getAttackState = (percent: number) => {
    if (percent > 65) return { label: "Strong Attack", icon: TrendingUp, color: "text-green-500" };
    if (percent > 45) return { label: "Balanced", icon: Minus, color: "text-yellow-500" };
    return { label: "Defending", icon: TrendingDown, color: "text-blue-500" };
  };

  const homeState = getAttackState(homePercent);
  const awayState = getAttackState(awayPercent);

  return (
    <Card className="p-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <homeState.icon className={`h-4 w-4 ${homeState.color}`} />
            <span className="font-semibold">{homeTeam}</span>
            <Badge variant="secondary" className="text-xs">{homeState.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{awayState.label}</Badge>
            <span className="font-semibold">{awayTeam}</span>
            <awayState.icon className={`h-4 w-4 ${awayState.color}`} />
          </div>
        </div>

        {/* Attack/Defense Bar */}
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          {/* Home Attack (Left side) */}
          <motion.div
            className="absolute left-0 top-0 h-full"
            style={{
              background: `linear-gradient(to right, ${homeColor}, ${homeColor}cc, ${homeColor}99)`
            }}
            initial={{ width: "50%" }}
            animate={{ width: `${homePercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          
          {/* Away Attack (Right side) */}
          <motion.div
            className="absolute right-0 top-0 h-full"
            style={{
              background: `linear-gradient(to left, ${awayColor}, ${awayColor}cc, ${awayColor}99)`
            }}
            initial={{ width: "50%" }}
            animate={{ width: `${awayPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Center Line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2 z-10" />

          {/* Percentage Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white z-20">
            <span className="drop-shadow-lg">{Math.round(homePercent)}%</span>
            <span className="drop-shadow-lg">{Math.round(awayPercent)}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: homeColor }} />
            <span>Home Attack</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: awayColor }} />
            <span>Away Attack</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
