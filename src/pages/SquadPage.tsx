import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Heart, Zap, Activity } from "lucide-react";
import { getTeamPlayers } from "@/data/fullDatabase";
import { Player } from "@/types/game";

const SquadPage = () => {
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("overall");
  
  // Get Manchester City squad (user's team)
  const allPlayers = getTeamPlayers("man-city");
  
  // Filter by position
  const filteredPlayers = useMemo(() => {
    if (selectedPosition === "all") return allPlayers;
    return allPlayers.filter(player => {
      const pos = player.position.toUpperCase();
      if (selectedPosition === "GK") return pos === "GK";
      if (selectedPosition === "DEF") return ["CB", "LB", "RB", "LWB", "RWB"].includes(pos);
      if (selectedPosition === "MID") return ["CM", "CDM", "CAM", "LM", "RM"].includes(pos);
      if (selectedPosition === "FWD") return ["ST", "CF", "LW", "RW"].includes(pos);
      return true;
    });
  }, [allPlayers, selectedPosition]);

  // Sort players
  const sortedPlayers = useMemo(() => {
    const sorted = [...filteredPlayers];
    switch (sortBy) {
      case "overall":
        return sorted.sort((a, b) => b.overall - a.overall);
      case "age":
        return sorted.sort((a, b) => a.age - b.age);
      case "fitness":
        return sorted.sort((a, b) => b.fitness - a.fitness);
      case "morale":
        return sorted.sort((a, b) => b.morale - a.morale);
      case "value":
        return sorted.sort((a, b) => b.marketValue - a.marketValue);
      default:
        return sorted;
    }
  }, [filteredPlayers, sortBy]);

  // Squad statistics
  const squadStats = useMemo(() => {
    const avgOverall = Math.round(
      allPlayers.reduce((sum, p) => sum + p.overall, 0) / allPlayers.length
    );
    const avgAge = Math.round(
      allPlayers.reduce((sum, p) => sum + p.age, 0) / allPlayers.length
    );
    const avgFitness = Math.round(
      allPlayers.reduce((sum, p) => sum + p.fitness, 0) / allPlayers.length
    );
    const avgMorale = Math.round(
      allPlayers.reduce((sum, p) => sum + p.morale, 0) / allPlayers.length
    );
    return { avgOverall, avgAge, avgFitness, avgMorale };
  }, [allPlayers]);

  const getPositionColor = (position: string) => {
    const pos = position.toUpperCase();
    if (pos === "GK") return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    if (["CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    if (["CM", "CDM", "CAM", "LM", "RM"].includes(pos)) return "bg-green-500/20 text-green-500 border-green-500/30";
    return "bg-red-500/20 text-red-500 border-red-500/30";
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Squad Management</h1>
            <p className="text-muted-foreground">Manage your team roster and player development</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {allPlayers.length} Players
          </Badge>
        </div>

        {/* Squad Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Overall</p>
                  <p className="text-2xl font-bold">{squadStats.avgOverall}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Age</p>
                  <p className="text-2xl font-bold">{squadStats.avgAge}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Fitness</p>
                  <p className="text-2xl font-bold">{squadStats.avgFitness}%</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Morale</p>
                  <p className="text-2xl font-bold">{squadStats.avgMorale}%</p>
                </div>
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Squad Roster</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <Tabs value={selectedPosition} onValueChange={setSelectedPosition}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="GK">GK</TabsTrigger>
                    <TabsTrigger value="DEF">DEF</TabsTrigger>
                    <TabsTrigger value="MID">MID</TabsTrigger>
                    <TabsTrigger value="FWD">FWD</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Rating</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="morale">Morale</SelectItem>
                    <SelectItem value="value">Market Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {sortedPlayers.map((player) => (
                  <Card key={player.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Player Avatar */}
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="text-lg font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">{player.name}</h3>
                            <Badge className={getPositionColor(player.position)}>
                              {player.position}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{player.nationality}</span>
                            <span>•</span>
                            <span>{player.age} years old</span>
                            <span>•</span>
                            <span>{formatCurrency(player.marketValue)}</span>
                          </div>
                        </div>

                        {/* Overall Rating */}
                        <div className="text-center px-4">
                          <div className="text-3xl font-bold text-primary">{player.overall}</div>
                          <div className="text-xs text-muted-foreground">OVR</div>
                        </div>

                        {/* Key Stats */}
                        <div className="hidden lg:grid grid-cols-3 gap-4 px-4">
                          <div className="text-center">
                            <div className="text-sm font-semibold">{player.pace}</div>
                            <div className="text-xs text-muted-foreground">PAC</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold">{player.shooting}</div>
                            <div className="text-xs text-muted-foreground">SHO</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold">{player.passing}</div>
                            <div className="text-xs text-muted-foreground">PAS</div>
                          </div>
                        </div>

                        {/* Fitness & Morale */}
                        <div className="hidden xl:block space-y-2 w-32">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Fitness</span>
                              <span className="font-semibold">{player.fitness}%</span>
                            </div>
                            <Progress value={player.fitness} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Morale</span>
                              <span className="font-semibold">{player.morale}%</span>
                            </div>
                            <Progress value={player.morale} className="h-1.5" />
                          </div>
                        </div>

                        {/* Actions */}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SquadPage;
