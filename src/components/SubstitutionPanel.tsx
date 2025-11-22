import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowRightLeft, Users } from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: string;
  overall: number;
  fitness: number;
  morale: number;
}

interface SubstitutionPanelProps {
  team: 'home' | 'away';
  teamName: string;
  players: Player[];
  onSubstitute: (playerOutId: string, playerInId: string) => void;
  substitutionsRemaining: number;
  isMatchRunning: boolean;
}

const SubstitutionPanel = ({
  team,
  teamName,
  players,
  onSubstitute,
  substitutionsRemaining,
  isMatchRunning,
}: SubstitutionPanelProps) => {
  const [selectedPlayerOut, setSelectedPlayerOut] = useState<string | null>(null);
  const [selectedPlayerIn, setSelectedPlayerIn] = useState<string | null>(null);

  const startingXI = players.slice(0, 11);
  const bench = players.slice(11);

  const handleConfirmSubstitution = () => {
    if (selectedPlayerOut && selectedPlayerIn) {
      onSubstitute(selectedPlayerOut, selectedPlayerIn);
      setSelectedPlayerOut(null);
      setSelectedPlayerIn(null);
    }
  };

  const getStatusColor = (fitness: number) => {
    if (fitness >= 80) return "bg-green-500";
    if (fitness >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-bold">{teamName}</h3>
        </div>
        <Badge variant={substitutionsRemaining > 0 ? "default" : "secondary"}>
          {substitutionsRemaining} subs left
        </Badge>
      </div>

      {/* Starting XI */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Starting XI</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {startingXI.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerOut(player.id)}
                disabled={!isMatchRunning || substitutionsRemaining === 0}
                className={`w-full text-left p-2 rounded-lg border transition-all ${
                  selectedPlayerOut === player.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {player.position}
                      </Badge>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(player.fitness)}`} />
                      <span className="text-xs text-muted-foreground">{player.fitness}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {player.overall}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bench */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Bench</h4>
        <ScrollArea className="h-[150px]">
          <div className="space-y-2">
            {bench.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerIn(player.id)}
                disabled={!selectedPlayerOut || !isMatchRunning}
                className={`w-full text-left p-2 rounded-lg border transition-all ${
                  selectedPlayerIn === player.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {player.position}
                      </Badge>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(player.fitness)}`} />
                      <span className="text-xs text-muted-foreground">{player.fitness}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {player.overall}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Substitution Action */}
      {selectedPlayerOut && selectedPlayerIn && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {players.find(p => p.id === selectedPlayerOut)?.name}
            </span>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {players.find(p => p.id === selectedPlayerIn)?.name}
            </span>
          </div>
          <Button
            onClick={handleConfirmSubstitution}
            className="w-full"
            size="sm"
          >
            Confirm Substitution
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SubstitutionPanel;
