import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { fullDatabase, searchPlayers, getTopPlayers } from "@/data/fullDatabase";
import PlayerCard from "@/components/PlayerCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TransfersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [minOverall, setMinOverall] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(99);
  
  // Get top players for featured
  const topPlayers = getTopPlayers(20);
  
  // Search and filter players
  const searchResults = useMemo(() => {
    let results = searchQuery.length > 0 
      ? searchPlayers(searchQuery)
      : fullDatabase.players;
    
    results = results.filter(player => {
      const matchesPosition = positionFilter === "all" || player.position === positionFilter;
      const matchesOverall = player.overall >= minOverall;
      const matchesAge = player.age <= maxAge;
      return matchesPosition && matchesOverall && matchesAge;
    });
    
    return results.sort((a, b) => b.overall - a.overall).slice(0, 100);
  }, [searchQuery, positionFilter, minOverall, maxAge]);
  
  // Get unique positions
  const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfer Centre</h1>
          <p className="text-muted-foreground">
            Search and scout from {fullDatabase.players.length.toLocaleString()} players across {fullDatabase.teams.length} teams
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="search">Player Search</TabsTrigger>
            <TabsTrigger value="featured">Top Players</TabsTrigger>
            <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
            <TabsTrigger value="activity">Transfer Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, position, nationality..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                  </Button>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Min OVR:</label>
                    <Input
                      type="number"
                      className="w-20"
                      value={minOverall}
                      onChange={(e) => setMinOverall(Number(e.target.value))}
                      min={0}
                      max={99}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Max Age:</label>
                    <Input
                      type="number"
                      className="w-20"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      min={16}
                      max={45}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {searchResults.length} Players Found
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>

              {searchResults.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    No players found matching your criteria
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Top Rated Players</h2>
                <p className="text-muted-foreground">
                  The highest rated players in the game
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topPlayers.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shortlist">
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                Your shortlist is empty. Search for players and add them to your shortlist.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-bold">Recent Transfer News</h3>
                <p className="text-muted-foreground">
                  Transfer activity tracking coming soon...
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TransfersPage;
