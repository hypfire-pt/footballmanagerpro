import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { TeamLogo } from "./TeamLogo";

interface ImprovedAttackDefenseBarProps {
  homeTeam: string;
  awayTeam: string;
  homeAttack: number; // 0-100
  awayAttack: number; // 0-100
  currentMinute: number;
  homeColor?: string;
  awayColor?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeScore: number;
  awayScore: number;
  matchPeriod?: 'first_half' | 'half_time' | 'second_half' | 'full_time';
}

export const ImprovedAttackDefenseBar = ({
  homeTeam,
  awayTeam,
  homeAttack,
  awayAttack,
  currentMinute,
  homeColor = '#22c55e',
  awayColor = '#3b82f6',
  homeLogoUrl,
  awayLogoUrl,
  homeScore,
  awayScore,
  matchPeriod = 'first_half'
}: ImprovedAttackDefenseBarProps) => {
  // Normalize to 0-100 scale
  const total = homeAttack + awayAttack;
  const homePercent = total > 0 ? (homeAttack / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayAttack / total) * 100 : 50;

  // Calculate field position (0 = home goal, 100 = away goal)
  const fieldPosition = 50 + (homePercent - awayPercent) / 4; // Maps to 0-100 range

  const getAttackState = (percent: number) => {
    if (percent > 65) return { label: "Strong Attack", icon: TrendingUp, color: "text-green-500" };
    if (percent > 45) return { label: "Balanced", icon: Minus, color: "text-yellow-500" };
    return { label: "Defending", icon: TrendingDown, color: "text-blue-500" };
  };

  const getPeriodLabel = () => {
    switch (matchPeriod) {
      case 'first_half':
        return `1st Half - ${currentMinute}'`;
      case 'half_time':
        return 'HT';
      case 'second_half':
        return `2nd Half - ${currentMinute}'`;
      case 'full_time':
        return 'FT';
      default:
        return `${currentMinute}'`;
    }
  };

  const homeState = getAttackState(homePercent);
  const awayState = getAttackState(awayPercent);

  return (
    <Card className="p-3">
      <div className="space-y-3">
        {/* Team Headers with Logos and Scores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <TeamLogo
              teamName={homeTeam}
              primaryColor={homeColor}
              secondaryColor="#ffffff"
              logoUrl={homeLogoUrl}
              size="sm"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs">{homeTeam}</span>
              <Badge variant="secondary" className="text-xs h-5 px-1.5">{homeState.label}</Badge>
            </div>
          </div>

          {/* Score and Period */}
          <div className="flex flex-col items-center mx-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">{homeScore}</span>
              <span className="text-lg text-muted-foreground">-</span>
              <span className="text-2xl font-bold gradient-text">{awayScore}</span>
            </div>
            <Badge variant="outline" className="text-xs mt-1">
              {getPeriodLabel()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="flex flex-col gap-0.5 items-end">
              <span className="font-semibold text-xs">{awayTeam}</span>
              <Badge variant="secondary" className="text-xs h-5 px-1.5">{awayState.label}</Badge>
            </div>
            <TeamLogo
              teamName={awayTeam}
              primaryColor={awayColor}
              secondaryColor="#ffffff"
              logoUrl={awayLogoUrl}
              size="sm"
            />
          </div>
        </div>

        {/* Field Progression Visualization */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Home Goal
            </span>
            <span className="flex items-center gap-1">
              Away Goal
              <Target className="h-3 w-3" />
            </span>
          </div>

          {/* Field Position Bar */}
          <div className="relative h-10 bg-gradient-to-r from-muted via-background to-muted rounded-lg overflow-hidden border border-border/50">
            {/* Field markings */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r border-border/30" />
              <div className="w-0.5 bg-border" />
              <div className="flex-1 border-l border-border/30" />
            </div>

            {/* Home Team Pressure Zone */}
            <motion.div
              className="absolute left-0 top-0 h-full opacity-30"
              style={{
                background: `linear-gradient(to right, ${homeColor}, transparent)`
              }}
              initial={{ width: "50%" }}
              animate={{ width: `${homePercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            
            {/* Away Team Pressure Zone */}
            <motion.div
              className="absolute right-0 top-0 h-full opacity-30"
              style={{
                background: `linear-gradient(to left, ${awayColor}, transparent)`
              }}
              initial={{ width: "50%" }}
              animate={{ width: `${awayPercent}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Ball Position Indicator */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              initial={{ left: "50%" }}
              animate={{ left: `${fieldPosition}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="relative -translate-x-1/2">
                <div className="w-6 h-6 bg-white rounded-full border-2 border-foreground shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-foreground rounded-full" />
                </div>
                {/* Ball trail */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Percentage Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold z-5">
              <span className="drop-shadow-lg" style={{ color: homeColor }}>
                {Math.round(homePercent)}%
              </span>
              <span className="drop-shadow-lg" style={{ color: awayColor }}>
                {Math.round(awayPercent)}%
              </span>
            </div>
          </div>

          {/* Attack/Defense Legend */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: homeColor }} />
              <span>Home Pressure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: awayColor }} />
              <span>Away Pressure</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
