import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimulationResult } from "@/types/match";
import { Trophy, ArrowRight, Plus, X, Zap, Activity, ArrowRightLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlannedSubstitution {
  playerOut: string;
  playerIn: string;
  minute: number | 'auto';
}

interface TacticalAdjustment {
  formation?: string;
  mentality?: 'defensive' | 'balanced' | 'attacking';
  tempo?: 'slow' | 'standard' | 'fast';
  width?: 'narrow' | 'standard' | 'wide';
  pressing?: 'low' | 'medium' | 'high';
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
  currentTactics: {
    formation: string;
    mentality: 'defensive' | 'balanced' | 'attacking';
    tempo: 'slow' | 'standard' | 'fast';
    width: 'narrow' | 'standard' | 'wide';
    pressing: 'low' | 'medium' | 'high';
  };
  open: boolean;
  onContinue: (substitutions: PlannedSubstitution[], tactics: TacticalAdjustment) => void;
}

export const HalfTimeModal = ({
  homeTeam,
  awayTeam,
  partialResult,
  availablePlayers,
  currentPlayers,
  currentTactics,
  open,
  onContinue,
}: HalfTimeModalProps) => {
  const [plannedSubs, setPlannedSubs] = useState<PlannedSubstitution[]>([]);
  const [tactics, setTactics] = useState<TacticalAdjustment>(currentTactics);
  const [selectedPlayerOut, setSelectedPlayerOut] = useState<string>('');
  const [selectedPlayerIn, setSelectedPlayerIn] = useState<string>('');
  const [selectedMinute, setSelectedMinute] = useState<string>('auto');

  const formations = [
    "4-2-3-1", "4-4-2", "4-3-3", "3-5-2", "5-3-2", "4-1-4-1", "3-4-3"
  ];

  const homeShots = partialResult.events.filter((e: any) => 
    e.team === 'home' && ['shot', 'shot_on_target'].includes(e.type)
  ).length;
  
  const awayShots = partialResult.events.filter((e: any) => 
    e.team === 'away' && ['shot', 'shot_on_target'].includes(e.type)
  ).length;

  const handleAddSubstitution = () => {
    if (!selectedPlayerOut || !selectedPlayerIn) return;

    const minute = selectedMinute === 'auto' ? 'auto' : parseInt(selectedMinute);
    
    setPlannedSubs([...plannedSubs, {
      playerOut: selectedPlayerOut,
      playerIn: selectedPlayerIn,
      minute,
    }]);

    setSelectedPlayerOut('');
    setSelectedPlayerIn('');
    setSelectedMinute('auto');
  };

  const handleRemoveSubstitution = (index: number) => {
    setPlannedSubs(plannedSubs.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onContinue(plannedSubs, tactics);
  };

  const handleTacticsChange = (key: string, value: any) => {
    setTactics({ ...tactics, [key]: value });
  };

  // Filter out already selected players
  const availablePlayersOut = currentPlayers.filter(p => 
    !plannedSubs.some(sub => sub.playerOut === p.name)
  );

  const availablePlayersIn = availablePlayers.filter(p => 
    !plannedSubs.some(sub => sub.playerIn === p.name)
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading gradient-text text-center">Half Time</DialogTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">Match paused - Plan your second half strategy</p>
        </DialogHeader>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="stats" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="subs" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Substitutions
            </TabsTrigger>
            <TabsTrigger value="tactics" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Tactics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
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
                  <span className="font-medium">{Math.round(partialResult.stats.possession.home)}%</span>
                  <span className="text-muted-foreground">Possession</span>
                  <span className="font-medium">{Math.round(partialResult.stats.possession.away)}%</span>
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

            <div className="flex justify-end">
              <Button onClick={handleContinue} className="gap-2">
                Start Second Half <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="subs" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Plan Substitutions
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Current Players (Player Out) */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">1. Select Player to Substitute Out</Label>
                  <ScrollArea className="h-[300px] rounded-md border p-2">
                    <div className="space-y-2">
                      {availablePlayersOut.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => setSelectedPlayerOut(player.name)}
                          className={`w-full text-left p-2 rounded-lg border transition-all ${
                            selectedPlayerOut === player.name
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {player.position}
                              </Badge>
                              <span className="text-sm font-medium">{player.name}</span>
                            </div>
                            {selectedPlayerOut === player.name && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Bench Players (Player In) */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">2. Select Replacement Player</Label>
                  <ScrollArea className="h-[300px] rounded-md border p-2">
                    <div className="space-y-2">
                      {availablePlayersIn.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => setSelectedPlayerIn(player.name)}
                          disabled={!selectedPlayerOut}
                          className={`w-full text-left p-2 rounded-lg border transition-all ${
                            selectedPlayerIn === player.name
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {player.position}
                              </Badge>
                              <span className="text-sm font-medium">{player.name}</span>
                            </div>
                            {selectedPlayerIn === player.name && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Substitution Preview & Add */}
              {selectedPlayerOut && selectedPlayerIn && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary mb-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Out</p>
                      <p className="font-semibold text-sm">{selectedPlayerOut}</p>
                    </div>
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-muted-foreground mb-1">In</p>
                      <p className="font-semibold text-sm">{selectedPlayerIn}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-[100]">
                        <SelectItem value="auto" className="text-xs">AI Decides (60-75')</SelectItem>
                        {[55, 60, 65, 70, 75, 80, 85].map((min) => (
                          <SelectItem key={min} value={min.toString()} className="text-xs">
                            {min}' minute
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddSubstitution} size="sm" className="gap-1 h-8 text-xs">
                      <Plus className="h-3 w-3" />
                      Add Sub
                    </Button>
                  </div>
                </div>
              )}

              {/* Planned Subs List */}
              {plannedSubs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Planned Substitutions ({plannedSubs.length})</Label>
                  <ScrollArea className="max-h-40">
                    <div className="space-y-2">
                      {plannedSubs.map((sub, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs border">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="font-medium">{sub.playerOut}</span>
                            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{sub.playerIn}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs mr-2">
                            {sub.minute === 'auto' ? 'Auto' : `${sub.minute}'`}
                          </Badge>
                          <Button
                            onClick={() => handleRemoveSubstitution(i)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleContinue} className="gap-2">
                Start Second Half <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tactics" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Tactical Adjustments for Second Half</h3>
              
              <div className="space-y-4">
                {/* Formation */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Formation</Label>
                  <Select
                    value={tactics.formation}
                    onValueChange={(value) => handleTacticsChange('formation', value)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[100]">
                      {formations.map(formation => (
                        <SelectItem key={formation} value={formation} className="text-xs">
                          {formation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mentality */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Mentality</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['defensive', 'balanced', 'attacking'] as const).map((mentality) => (
                      <Button
                        key={mentality}
                        variant={tactics.mentality === mentality ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTacticsChange('mentality', mentality)}
                        className="capitalize h-8 text-xs"
                      >
                        {mentality}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tempo */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Tempo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['slow', 'standard', 'fast'] as const).map((tempo) => (
                      <Button
                        key={tempo}
                        variant={tactics.tempo === tempo ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTacticsChange('tempo', tempo)}
                        className="capitalize h-8 text-xs"
                      >
                        {tempo}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Width</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['narrow', 'standard', 'wide'] as const).map((width) => (
                      <Button
                        key={width}
                        variant={tactics.width === width ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTacticsChange('width', width)}
                        className="capitalize h-8 text-xs"
                      >
                        {width}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pressing */}
                <div>
                  <Label className="text-xs font-semibold mb-2 block">Pressing Intensity</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((pressing) => (
                      <Button
                        key={pressing}
                        variant={tactics.pressing === pressing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTacticsChange('pressing', pressing)}
                        className="capitalize h-8 text-xs"
                      >
                        {pressing}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleContinue} className="gap-2">
                Start Second Half <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};