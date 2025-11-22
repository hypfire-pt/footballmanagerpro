import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Settings, TrendingUp, Minimize2, Maximize2, Target } from "lucide-react";
import { toast } from "sonner";

interface TacticalAdjustmentPanelProps {
  team: 'home' | 'away';
  teamName: string;
  currentTactics: {
    formation: string;
    mentality: 'defensive' | 'balanced' | 'attacking';
    tempo: 'slow' | 'standard' | 'fast';
    width: 'narrow' | 'standard' | 'wide';
    pressing: 'low' | 'medium' | 'high';
  };
  onTacticsChange: (tactics: any) => void;
  isMatchRunning: boolean;
}

const TacticalAdjustmentPanel = ({
  team,
  teamName,
  currentTactics,
  onTacticsChange,
  isMatchRunning
}: TacticalAdjustmentPanelProps) => {
  const [tactics, setTactics] = useState(currentTactics);

  const handleChange = (key: string, value: any) => {
    const newTactics = { ...tactics, [key]: value };
    setTactics(newTactics);
  };

  const applyTactics = () => {
    onTacticsChange(tactics);
    toast.success(`Tactical changes applied for ${teamName}!`);
  };

  const formations = [
    "4-2-3-1", "4-4-2", "4-3-3", "3-5-2", "5-3-2", "4-1-4-1", "3-4-3"
  ];

  const hasChanges = JSON.stringify(tactics) !== JSON.stringify(currentTactics);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-bold">{teamName}</h3>
        </div>
        {hasChanges && (
          <Badge variant="default">Unsaved Changes</Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Formation */}
        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Formation
          </Label>
          <Select
            value={tactics.formation}
            onValueChange={(value) => handleChange('formation', value)}
            disabled={!isMatchRunning}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formations.map(formation => (
                <SelectItem key={formation} value={formation}>
                  {formation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mentality */}
        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Mentality
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['defensive', 'balanced', 'attacking'] as const).map((mentality) => (
              <Button
                key={mentality}
                variant={tactics.mentality === mentality ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('mentality', mentality)}
                disabled={!isMatchRunning}
                className="capitalize"
              >
                {mentality}
              </Button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div>
          <Label className="text-sm font-semibold mb-2">Tempo</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['slow', 'standard', 'fast'] as const).map((tempo) => (
              <Button
                key={tempo}
                variant={tactics.tempo === tempo ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('tempo', tempo)}
                disabled={!isMatchRunning}
                className="capitalize"
              >
                {tempo}
              </Button>
            ))}
          </div>
        </div>

        {/* Width */}
        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Width
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['narrow', 'standard', 'wide'] as const).map((width) => (
              <Button
                key={width}
                variant={tactics.width === width ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('width', width)}
                disabled={!isMatchRunning}
                className="capitalize"
              >
                {width}
              </Button>
            ))}
          </div>
        </div>

        {/* Pressing */}
        <div>
          <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Minimize2 className="h-4 w-4" />
            Pressing Intensity
          </Label>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <Slider
              value={[
                tactics.pressing === 'low' ? 0 : 
                tactics.pressing === 'medium' ? 50 : 100
              ]}
              onValueChange={(value) => {
                const pressing = value[0] < 33 ? 'low' : value[0] < 67 ? 'medium' : 'high';
                handleChange('pressing', pressing);
              }}
              max={100}
              step={1}
              disabled={!isMatchRunning}
            />
            <Badge variant="outline" className="w-full justify-center capitalize">
              {tactics.pressing}
            </Badge>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={applyTactics}
          disabled={!hasChanges || !isMatchRunning}
          className="w-full"
        >
          Apply Tactical Changes
        </Button>

        {!isMatchRunning && (
          <p className="text-xs text-muted-foreground text-center">
            Start the match to make tactical adjustments
          </p>
        )}
      </div>
    </Card>
  );
};

export default TacticalAdjustmentPanel;
