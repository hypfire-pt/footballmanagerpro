import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MomentumVisualizerProps {
  homeTeam: string;
  awayTeam: string;
  homeMomentum: number; // 0-100
  awayMomentum: number; // 0-100
  currentMinute: number;
}

export function MomentumVisualizer({
  homeTeam,
  awayTeam,
  homeMomentum,
  awayMomentum,
  currentMinute
}: MomentumVisualizerProps) {
  // Calculate who has momentum
  const difference = homeMomentum - awayMomentum;
  const hasMomentum = Math.abs(difference) > 10 ? (difference > 0 ? 'home' : 'away') : 'neutral';
  
  // Normalize momentum to percentage for display
  const totalMomentum = homeMomentum + awayMomentum;
  const homePercentage = totalMomentum > 0 ? (homeMomentum / totalMomentum) * 100 : 50;
  const awayPercentage = 100 - homePercentage;

  const getMomentumIcon = (team: 'home' | 'away') => {
    if (hasMomentum === 'neutral') return <Minus className="h-4 w-4" />;
    if (hasMomentum === team) return <TrendingUp className="h-4 w-4 animate-float" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getMomentumColor = (value: number) => {
    if (value > 60) return 'text-accent';
    if (value > 40) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <Card className="glass border-border/50 p-4 animate-fade-in">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm flex items-center gap-2">
            <span className="text-accent">⚡</span>
            Match Momentum
          </h3>
          <Badge variant="outline" className="text-xs">
            {currentMinute}'
          </Badge>
        </div>

        {/* Momentum Bar */}
        <div className="relative h-12 rounded-lg overflow-hidden bg-muted/30 border border-border/50">
          {/* Home momentum fill */}
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700 ease-out"
            style={{ width: `${homePercentage}%` }}
          />
          
          {/* Away momentum fill */}
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-secondary/80 to-secondary transition-all duration-700 ease-out"
            style={{ width: `${awayPercentage}%` }}
          />

          {/* Center divider with glow */}
          <div 
            className="absolute top-0 h-full w-1 bg-white shadow-glow transition-all duration-700"
            style={{ left: `${homePercentage}%` }}
          />

          {/* Team labels overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-white font-heading font-bold text-xs">
            <div className="flex items-center gap-2">
              {getMomentumIcon('home')}
              <span className="drop-shadow-lg">{homeTeam}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="drop-shadow-lg">{awayTeam}</span>
              {getMomentumIcon('away')}
            </div>
          </div>
        </div>

        {/* Momentum Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="stat-card p-2 rounded-lg">
            <div className={`text-lg font-heading font-bold ${getMomentumColor(homeMomentum)}`}>
              {homeMomentum.toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Home
            </div>
          </div>

          <div className="stat-card p-2 rounded-lg">
            <div className="text-lg font-heading font-bold">
              {hasMomentum === 'home' && '→'}
              {hasMomentum === 'neutral' && '↔'}
              {hasMomentum === 'away' && '←'}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Flow
            </div>
          </div>

          <div className="stat-card p-2 rounded-lg">
            <div className={`text-lg font-heading font-bold ${getMomentumColor(awayMomentum)}`}>
              {awayMomentum.toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Away
            </div>
          </div>
        </div>

        {/* Momentum Status Message */}
        {hasMomentum !== 'neutral' && (
          <div className="text-center p-2 bg-accent/10 rounded-lg border border-accent/30 animate-pulse-glow">
            <p className="text-xs font-semibold text-accent">
              {hasMomentum === 'home' ? homeTeam : awayTeam} is dominating!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
