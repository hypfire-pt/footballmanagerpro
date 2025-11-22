import { DashboardLayout } from "@/components/DashboardLayout";
import PlayerCard from "@/components/PlayerCard";
import { fullDatabase, getTeamPlayers } from "@/data/fullDatabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Squad = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  
  // Get current team players (defaulting to Manchester City)
  const currentTeamId = "man-city";
  const teamPlayers = getTeamPlayers(currentTeamId);
  
  // Filter players
  const filteredPlayers = useMemo(() => {
    return teamPlayers.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = positionFilter === "all" || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [teamPlayers, searchQuery, positionFilter]);
  
  // Get unique positions
  const positions = useMemo(() => {
    const posSet = new Set(teamPlayers.map(p => p.position));
    return Array.from(posSet).sort();
  }, [teamPlayers]);

  return (
    <DashboardLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Squad Management</h1>
          <p className="text-muted-foreground">
            {filteredPlayers.length} players • Average OVR: {Math.floor(teamPlayers.reduce((sum, p) => sum + p.overall, 0) / teamPlayers.length)}
          </p>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
        
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No players found matching your filters</p>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default Squad;
