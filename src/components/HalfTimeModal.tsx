import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimulationResult } from "@/types/match";
import { Trophy, Target, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlannedSubstitution {
  playerOut: string;
  playerIn: string;
  minute: number | 'auto';
}

interface HalfTimeModalProps {
  homeTeam: string;
  awayTeam: string;
  partialResult: {
    homeScore: number;
    awayScore: number;
    events: any[];
    stats: any;
  };
  availablePlayers: { id: string; name: string; position: string }[];
  currentPlayers: { id: string; name: string; position: string }[];
  open: boolean;
  onContinue: (substitutions: PlannedSubstitution[]) => void;
}

export const HalfTimeModal = ({
  homeTeam,
  awayTeam,
  partialResult,
  availablePlayers,
  currentPlayers,
  open,
  onContinue,
}: HalfTimeModalProps) => {
  const [plannedSubs, setPlannedSubs] = useState<PlannedSubstitution[]>([]);
  const [newSub, setNewSub] = useState<{
    playerOut: string;
    playerIn: string;
    minute: string;
  }>({
    playerOut: '',
    playerIn: '',
    minute: 'auto',
  });

  const homeShots = partialResult.events.filter((e: any) => 
    e.team === 'home' && ['shot', 'shot_on_target'].includes(e.type)
  ).length;
  
  const awayShots = partialResult.events.filter((e: any) => 
    e.team === 'away' && ['shot', 'shot_on_target'].includes(e.type)
  ).length;

  const handleAddSubstitution = () => {
    if (!newSub.playerOut || !newSub.playerIn) return;

    const minute = newSub.minute === 'auto' ? 'auto' : parseInt(newSub.minute);
    
    setPlannedSubs([...plannedSubs, {
      playerOut: newSub.playerOut,
      playerIn: newSub.playerIn,
      minute,
    }]);

    setNewSub({ playerOut: '', playerIn: '', minute: 'auto' });
  };

  const handleRemoveSubstitution = (index: number) => {
    setPlannedSubs(plannedSubs.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onContinue(plannedSubs);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading gradient-text text-center">Half Time</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Score */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <h3 className="text-sm font-semibold">{homeTeam}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{partialResult.homeScore}</span>
                <span className="text-xl text-muted-foreground">-</span>
                <span className="text-3xl font-bold">{partialResult.awayScore}</span>
              </div>
              <div className="flex-1 text-center">
                <h3 className="text-sm font-semibold">{awayTeam}</h3>
              </div>
            </div>
          </Card>

          {/* Half-time Stats */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">First Half Statistics</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{partialResult.stats.possession.home}%</span>
                <span className="text-muted-foreground">Possession</span>
                <span className="font-medium">{partialResult.stats.possession.away}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{homeShots}</span>
                <span className="text-muted-foreground">Shots</span>
                <span className="font-medium">{awayShots}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{partialResult.stats.shotsOnTarget.home}</span>
                <span className="text-muted-foreground">Shots on Target</span>
                <span className="font-medium">{partialResult.stats.shotsOnTarget.away}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{partialResult.stats.corners.home}</span>
                <span className="text-muted-foreground">Corners</span>
                <span className="font-medium">{partialResult.stats.corners.away}</span>
              </div>
            </div>
          </Card>

          {/* Substitution Planning */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Plan Substitutions</h3>
            
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Player Out</Label>
                  <Select value={newSub.playerOut} onValueChange={(v) => setNewSub({...newSub, playerOut: v})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentPlayers.map((p) => (
                        <SelectItem key={p.id} value={p.name} className="text-xs">
                          {p.name} ({p.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Player In</Label>
                  <Select value={newSub.playerIn} onValueChange={(v) => setNewSub({...newSub, playerIn: v})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((p) => (
                        <SelectItem key={p.id} value={p.name} className="text-xs">
                          {p.name} ({p.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Minute</Label>
                  <Select value={newSub.minute} onValueChange={(v) => setNewSub({...newSub, minute: v})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto" className="text-xs">AI Decides</SelectItem>
                      {[55, 60, 65, 70, 75, 80, 85].map((min) => (
                        <SelectItem key={min} value={min.toString()} className="text-xs">
                          {min}'
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleAddSubstitution} size="sm" variant="outline" className="w-full gap-1 h-8 text-xs">
                <Plus className="h-3 w-3" />
                Add Substitution
              </Button>
            </div>

            {/* Planned Subs List */}
            {plannedSubs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Planned Substitutions</Label>
                <ScrollArea className="max-h-32">
                  {plannedSubs.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs mb-1">
                      <div className="flex-1">
                        <span className="font-medium">{sub.playerOut}</span>
                        <span className="text-muted-foreground mx-2">→</span>
                        <span className="font-medium">{sub.playerIn}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs mr-2">
                        {sub.minute === 'auto' ? 'Auto' : `${sub.minute}'`}
                      </Badge>
                      <Button
                        onClick={() => handleRemoveSubstitution(i)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </Card>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button onClick={handleContinue} className="gap-2">
              Start Second Half <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
