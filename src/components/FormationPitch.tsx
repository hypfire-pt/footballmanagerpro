import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface PlayerPosition {
  id: string;
  name: string;
  position: string;
  x: number; // 0-100
  y: number; // 0-100
  role?: string;
}

interface FormationPitchProps {
  formation: string;
  players: PlayerPosition[];
  onPlayerClick?: (playerId: string) => void;
}

const FormationPitch = ({ formation, players, onPlayerClick }: FormationPitchProps) => {
  return (
    <Card className="relative w-full aspect-[2/3] bg-gradient-to-b from-green-600/20 via-green-500/20 to-green-600/20 overflow-hidden">
      {/* Pitch markings */}
      <div className="absolute inset-0">
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/50" />
        
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
        
        {/* Penalty areas */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-1/6 border-2 border-t-white/30 border-x-white/30 border-b-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-1/6 border-2 border-b-white/30 border-x-white/30 border-t-0" />
        
        {/* 6-yard boxes */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-[8%] border-2 border-t-white/30 border-x-white/30 border-b-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/5 h-[8%] border-2 border-b-white/30 border-x-white/30 border-t-0" />
        
        {/* Goals */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-white/50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-white/50" />
      </div>

      {/* Formation label */}
      <div className="absolute top-4 left-4">
        <Badge variant="secondary" className="text-lg px-4 py-2 font-bold">
          {formation}
        </Badge>
      </div>

      {/* Players */}
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onPlayerClick?.(player.id)}
          className="absolute group cursor-pointer transition-transform hover:scale-110"
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <Avatar className="h-12 w-12 border-2 border-white shadow-lg group-hover:border-primary transition-colors">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="bg-background/90 backdrop-blur-sm rounded px-2 py-0.5 shadow-md min-w-[80px] text-center">
              <div className="text-xs font-semibold truncate">{player.name.split(' ').pop()}</div>
              <div className="text-[10px] text-muted-foreground">{player.position}</div>
              {player.role && (
                <div className="text-[9px] text-primary font-medium">{player.role}</div>
              )}
            </div>
          </div>
        </button>
      ))}
    </Card>
  );
};

export default FormationPitch;
