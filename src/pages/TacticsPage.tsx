import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import FormationPitch from "@/components/FormationPitch";
import { getTeamPlayers } from "@/data/fullDatabase";
import { Shield, Zap, Target, TrendingUp, Crosshair, Save } from "lucide-react";
import { toast } from "sonner";

// Formation templates with player positions
const formations = {
  "4-4-2": {
    positions: [
      { id: "gk", position: "GK", x: 50, y: 95 },
      { id: "lb", position: "LB", x: 20, y: 75 },
      { id: "lcb", position: "CB", x: 40, y: 80 },
      { id: "rcb", position: "CB", x: 60, y: 80 },
      { id: "rb", position: "RB", x: 80, y: 75 },
      { id: "lm", position: "LM", x: 20, y: 50 },
      { id: "lcm", position: "CM", x: 40, y: 45 },
      { id: "rcm", position: "CM", x: 60, y: 45 },
      { id: "rm", position: "RM", x: 80, y: 50 },
      { id: "lst", position: "ST", x: 40, y: 20 },
      { id: "rst", position: "ST", x: 60, y: 20 },
    ]
  },
  "4-3-3": {
    positions: [
      { id: "gk", position: "GK", x: 50, y: 95 },
      { id: "lb", position: "LB", x: 20, y: 75 },
      { id: "lcb", position: "CB", x: 40, y: 80 },
      { id: "rcb", position: "CB", x: 60, y: 80 },
      { id: "rb", position: "RB", x: 80, y: 75 },
      { id: "cdm", position: "CDM", x: 50, y: 55 },
      { id: "lcm", position: "CM", x: 35, y: 42 },
      { id: "rcm", position: "CM", x: 65, y: 42 },
      { id: "lw", position: "LW", x: 20, y: 20 },
      { id: "st", position: "ST", x: 50, y: 15 },
      { id: "rw", position: "RW", x: 80, y: 20 },
    ]
  },
  "4-2-3-1": {
    positions: [
      { id: "gk", position: "GK", x: 50, y: 95 },
      { id: "lb", position: "LB", x: 20, y: 75 },
      { id: "lcb", position: "CB", x: 40, y: 80 },
      { id: "rcb", position: "CB", x: 60, y: 80 },
      { id: "rb", position: "RB", x: 80, y: 75 },
      { id: "lcdm", position: "CDM", x: 40, y: 55 },
      { id: "rcdm", position: "CDM", x: 60, y: 55 },
      { id: "lam", position: "LW", x: 20, y: 32 },
      { id: "cam", position: "CAM", x: 50, y: 35 },
      { id: "ram", position: "RW", x: 80, y: 32 },
      { id: "st", position: "ST", x: 50, y: 15 },
    ]
  },
  "3-5-2": {
    positions: [
      { id: "gk", position: "GK", x: 50, y: 95 },
      { id: "lcb", position: "CB", x: 30, y: 80 },
      { id: "cb", position: "CB", x: 50, y: 82 },
      { id: "rcb", position: "CB", x: 70, y: 80 },
      { id: "lwb", position: "LWB", x: 15, y: 55 },
      { id: "lcm", position: "CM", x: 35, y: 48 },
      { id: "cm", position: "CM", x: 50, y: 45 },
      { id: "rcm", position: "CM", x: 65, y: 48 },
      { id: "rwb", position: "RWB", x: 85, y: 55 },
      { id: "lst", position: "ST", x: 40, y: 20 },
      { id: "rst", position: "ST", x: 60, y: 20 },
    ]
  },
  "4-1-4-1": {
    positions: [
      { id: "gk", position: "GK", x: 50, y: 95 },
      { id: "lb", position: "LB", x: 20, y: 75 },
      { id: "lcb", position: "CB", x: 40, y: 80 },
      { id: "rcb", position: "CB", x: 60, y: 80 },
      { id: "rb", position: "RB", x: 80, y: 75 },
      { id: "cdm", position: "CDM", x: 50, y: 58 },
      { id: "lm", position: "LM", x: 20, y: 40 },
      { id: "lcm", position: "CM", x: 38, y: 38 },
      { id: "rcm", position: "CM", x: 62, y: 38 },
      { id: "rm", position: "RM", x: 80, y: 40 },
      { id: "st", position: "ST", x: 50, y: 15 },
    ]
  },
};

const TacticsPage = () => {
  const [selectedFormation, setSelectedFormation] = useState<keyof typeof formations>("4-4-2");
  const [mentality, setMentality] = useState([50]);
  const [tempo, setTempo] = useState([50]);
  const [width, setWidth] = useState([50]);
  const [pressing, setPressing] = useState([50]);
  const [defensiveLine, setDefensiveLine] = useState([50]);

  const allPlayers = getTeamPlayers("man-city");

  // Assign players to positions
  const assignedPlayers = useMemo(() => {
    const formation = formations[selectedFormation];
    const sortedPlayers = [...allPlayers].sort((a, b) => b.overall - a.overall);
    
    return formation.positions.map((pos) => {
      // Find best player for this position
      const player = sortedPlayers.find(p => {
        const playerPos = p.position.toUpperCase();
        const reqPos = pos.position.toUpperCase();
        
        // Exact match
        if (playerPos === reqPos) return true;
        
        // Position compatibility
        if (reqPos === "CB" && ["CB", "RB", "LB"].includes(playerPos)) return true;
        if (reqPos === "LB" && ["LB", "LWB", "CB"].includes(playerPos)) return true;
        if (reqPos === "RB" && ["RB", "RWB", "CB"].includes(playerPos)) return true;
        if (reqPos === "CDM" && ["CDM", "CM", "CB"].includes(playerPos)) return true;
        if (reqPos === "CM" && ["CM", "CDM", "CAM"].includes(playerPos)) return true;
        if (reqPos === "CAM" && ["CAM", "CM", "LW", "RW"].includes(playerPos)) return true;
        if (reqPos === "LM" && ["LM", "LW", "LB"].includes(playerPos)) return true;
        if (reqPos === "RM" && ["RM", "RW", "RB"].includes(playerPos)) return true;
        if (reqPos === "LW" && ["LW", "LM", "ST"].includes(playerPos)) return true;
        if (reqPos === "RW" && ["RW", "RM", "ST"].includes(playerPos)) return true;
        if (reqPos === "ST" && ["ST", "CF", "LW", "RW"].includes(playerPos)) return true;
        
        return false;
      }) || sortedPlayers[0];

      // Remove assigned player from pool
      const index = sortedPlayers.indexOf(player);
      if (index > -1) sortedPlayers.splice(index, 1);

      return {
        id: pos.id,
        name: player.name,
        position: pos.position,
        x: pos.x,
        y: pos.y,
        role: getRoleForPosition(pos.position),
      };
    });
  }, [selectedFormation, allPlayers]);

  const getRoleForPosition = (position: string) => {
    const roles: Record<string, string> = {
      GK: "Sweeper Keeper",
      CB: "Ball Playing Defender",
      LB: "Wing Back",
      RB: "Wing Back",
      LWB: "Complete Wing Back",
      RWB: "Complete Wing Back",
      CDM: "Deep Lying Playmaker",
      CM: "Box to Box",
      CAM: "Advanced Playmaker",
      LM: "Winger",
      RM: "Winger",
      LW: "Inside Forward",
      RW: "Inside Forward",
      ST: "Advanced Forward",
      CF: "False Nine",
    };
    return roles[position] || "Support";
  };

  const getMentalityLabel = (value: number) => {
    if (value < 20) return "Very Defensive";
    if (value < 40) return "Defensive";
    if (value < 60) return "Balanced";
    if (value < 80) return "Attacking";
    return "All Out Attack";
  };

  const getTempoLabel = (value: number) => {
    if (value < 33) return "Slow";
    if (value < 67) return "Standard";
    return "Fast";
  };

  const getWidthLabel = (value: number) => {
    if (value < 33) return "Narrow";
    if (value < 67) return "Standard";
    return "Wide";
  };

  const getPressingLabel = (value: number) => {
    if (value < 33) return "Low Press";
    if (value < 67) return "Medium Press";
    return "High Press";
  };

  const getDefensiveLineLabel = (value: number) => {
    if (value < 33) return "Deep";
    if (value < 67) return "Standard";
    return "High Line";
  };

  const handleSaveTactics = () => {
    const tactics = {
      formation: selectedFormation,
      mentality: mentality[0],
      tempo: tempo[0],
      width: width[0],
      pressing: pressing[0],
      defensiveLine: defensiveLine[0],
      players: assignedPlayers,
    };
    localStorage.setItem("savedTactics", JSON.stringify(tactics));
    toast.success("Tactics saved successfully!");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tactical Setup</h1>
            <p className="text-muted-foreground">Configure your team's formation and playing style</p>
          </div>
          <Button onClick={handleSaveTactics} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Tactics
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Formation</CardTitle>
                  <Select value={selectedFormation} onValueChange={(value) => setSelectedFormation(value as keyof typeof formations)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(formations).map((formation) => (
                        <SelectItem key={formation} value={formation}>
                          {formation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <FormationPitch
                  formation={selectedFormation}
                  players={assignedPlayers}
                  onPlayerClick={(id) => console.log("Player clicked:", id)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Team Instructions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mentality */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <Label>Mentality</Label>
                    </div>
                    <Badge variant="secondary">{getMentalityLabel(mentality[0])}</Badge>
                  </div>
                  <Slider
                    value={mentality}
                    onValueChange={setMentality}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Tempo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <Label>Tempo</Label>
                    </div>
                    <Badge variant="secondary">{getTempoLabel(tempo[0])}</Badge>
                  </div>
                  <Slider
                    value={tempo}
                    onValueChange={setTempo}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Width */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />
                      <Label>Width</Label>
                    </div>
                    <Badge variant="secondary">{getWidthLabel(width[0])}</Badge>
                  </div>
                  <Slider
                    value={width}
                    onValueChange={setWidth}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Pressing */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crosshair className="h-4 w-4 text-muted-foreground" />
                      <Label>Pressing Intensity</Label>
                    </div>
                    <Badge variant="secondary">{getPressingLabel(pressing[0])}</Badge>
                  </div>
                  <Slider
                    value={pressing}
                    onValueChange={setPressing}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Defensive Line */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Label>Defensive Line</Label>
                    </div>
                    <Badge variant="secondary">{getDefensiveLineLabel(defensiveLine[0])}</Badge>
                  </div>
                  <Slider
                    value={defensiveLine}
                    onValueChange={setDefensiveLine}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setMentality([75]);
                    setTempo([70]);
                    setWidth([70]);
                    setPressing([75]);
                    setDefensiveLine([65]);
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Attacking
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setMentality([50]);
                    setTempo([50]);
                    setWidth([50]);
                    setPressing([50]);
                    setDefensiveLine([50]);
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Balanced
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setMentality([25]);
                    setTempo([35]);
                    setWidth([40]);
                    setPressing([30]);
                    setDefensiveLine([30]);
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Defensive
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TacticsPage;
