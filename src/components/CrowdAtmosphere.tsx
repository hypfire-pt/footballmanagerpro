import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Volume2, Users, TrendingUp, Home } from "lucide-react";
import { MatchEvent } from "@/types/match";

interface CrowdAtmosphereProps {
  homeTeam: string;
  awayTeam: string;
  currentEvent?: MatchEvent;
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  stadiumCapacity: number;
  homeReputation: number;
}

interface AtmosphereState {
  intensity: number; // 0-100
  mood: 'hostile' | 'tense' | 'excited' | 'euphoric' | 'dejected' | 'anxious';
  volume: number; // 0-100
  homeAdvantage: number; // 0-20 (percentage boost)
}

const CrowdAtmosphere = ({
  homeTeam,
  awayTeam,
  currentEvent,
  currentMinute,
  homeScore,
  awayScore,
  stadiumCapacity,
  homeReputation
}: CrowdAtmosphereProps) => {
  const [atmosphere, setAtmosphere] = useState<AtmosphereState>({
    intensity: 50,
    mood: 'tense',
    volume: 60,
    homeAdvantage: 5
  });

  const calculateAtmosphere = () => {
    let intensity = 50;
    let volume = 60;
    let mood: AtmosphereState['mood'] = 'tense';
    
    // Base intensity from stadium capacity and reputation
    const capacityBonus = Math.min(30, stadiumCapacity / 2000);
    const reputationBonus = Math.min(20, homeReputation / 5);
    intensity += capacityBonus + reputationBonus;

    // Score difference impact
    const scoreDiff = homeScore - awayScore;
    if (scoreDiff > 0) {
      intensity += scoreDiff * 10;
      volume += scoreDiff * 5;
      mood = scoreDiff >= 2 ? 'euphoric' : 'excited';
    } else if (scoreDiff < 0) {
      intensity -= Math.abs(scoreDiff) * 8;
      volume -= Math.abs(scoreDiff) * 5;
      mood = Math.abs(scoreDiff) >= 2 ? 'dejected' : 'anxious';
    }

    // Match phase impact
    if (currentMinute < 10) {
      intensity += 10;
      volume += 10;
      mood = 'excited';
    } else if (currentMinute > 80) {
      intensity += 15;
      volume += 15;
      if (scoreDiff === 0) mood = 'tense';
    }

    // Event-based boost
    if (currentEvent) {
      if (currentEvent.type === 'goal' && currentEvent.team === 'home') {
        intensity = 100;
        volume = 100;
        mood = 'euphoric';
      } else if (currentEvent.type === 'goal' && currentEvent.team === 'away') {
        intensity = 30;
        volume = 40;
        mood = 'dejected';
      } else if (['shot_on_target', 'corner'].includes(currentEvent.type) && currentEvent.team === 'home') {
        intensity += 10;
        volume += 10;
      } else if (currentEvent.type === 'foul' && currentEvent.team === 'away') {
        intensity += 5;
        volume += 8;
        mood = 'hostile';
      }
    }

    // Calculate home advantage based on atmosphere
    const homeAdvantage = Math.min(20, (intensity / 100) * 15 + (homeReputation / 10));

    // Clamp values
    intensity = Math.max(0, Math.min(100, intensity));
    volume = Math.max(0, Math.min(100, volume));

    return { intensity, mood, volume, homeAdvantage };
  };

  useEffect(() => {
    const newAtmosphere = calculateAtmosphere();
    setAtmosphere(newAtmosphere);

    // Gradually decay intensity over time (not during events)
    if (!currentEvent) {
      const decayTimer = setTimeout(() => {
        setAtmosphere(prev => ({
          ...prev,
          intensity: Math.max(40, prev.intensity - 2),
          volume: Math.max(50, prev.volume - 2)
        }));
      }, 3000);

      return () => clearTimeout(decayTimer);
    }
  }, [currentEvent, currentMinute, homeScore, awayScore]);

  const getMoodColor = (mood: AtmosphereState['mood']) => {
    switch (mood) {
      case 'euphoric':
        return 'bg-green-500';
      case 'excited':
        return 'bg-blue-500';
      case 'hostile':
        return 'bg-red-500';
      case 'tense':
        return 'bg-yellow-500';
      case 'anxious':
        return 'bg-orange-500';
      case 'dejected':
        return 'bg-gray-500';
    }
  };

  const getMoodIcon = (mood: AtmosphereState['mood']) => {
    switch (mood) {
      case 'euphoric':
        return '🎉';
      case 'excited':
        return '😃';
      case 'hostile':
        return '😠';
      case 'tense':
        return '😰';
      case 'anxious':
        return '😟';
      case 'dejected':
        return '😔';
    }
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return 'Electric';
    if (intensity >= 60) return 'Intense';
    if (intensity >= 40) return 'Moderate';
    return 'Subdued';
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-bold">Crowd Atmosphere</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <Home className="h-3 w-3" />
            {homeTeam}
          </Badge>
        </div>

        {/* Stadium Info */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Capacity</p>
            <p className="text-sm font-semibold">{stadiumCapacity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reputation</p>
            <div className="flex items-center gap-1">
              <Progress value={homeReputation} className="h-2 flex-1" />
              <span className="text-sm font-semibold">{homeReputation}</span>
            </div>
          </div>
        </div>

        {/* Atmosphere Metrics */}
        <div className="space-y-3">
          {/* Intensity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Intensity</Label>
              </div>
              <Badge variant="secondary">{getIntensityLabel(atmosphere.intensity)}</Badge>
            </div>
            <Progress 
              value={atmosphere.intensity} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {atmosphere.intensity.toFixed(0)}%
            </p>
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Crowd Noise</Label>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-4 rounded ${
                      i < Math.floor(atmosphere.volume / 20) ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Progress 
              value={atmosphere.volume} 
              className="h-3"
            />
          </div>

          {/* Mood */}
          <div className="p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodIcon(atmosphere.mood)}</span>
                <div>
                  <p className="text-sm font-semibold capitalize">{atmosphere.mood}</p>
                  <p className="text-xs text-muted-foreground">Current Mood</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getMoodColor(atmosphere.mood)} animate-pulse`} />
            </div>
          </div>

          {/* Home Advantage */}
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Home Advantage</p>
              </div>
              <Badge variant="default">+{atmosphere.homeAdvantage.toFixed(1)}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Crowd pressure boosting {homeTeam} performance and influencing referee decisions
            </p>
          </div>
        </div>

        {/* Match Context */}
        {currentMinute > 75 && Math.abs(homeScore - awayScore) <= 1 && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
              ⚡ The crowd is sensing a decisive moment! Tension is at its peak!
            </p>
          </div>
        )}

        {homeScore > awayScore && currentMinute > 80 && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">
              🎵 The crowd is in full voice, willing their team to victory!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={className}>{children}</span>
);

export default CrowdAtmosphere;
