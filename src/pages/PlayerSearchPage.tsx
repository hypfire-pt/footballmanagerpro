import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Player {
  id: string;
  name: string;
  position: string;
  nationality: string;
  team_id: string;
  age: number;
  overall: number;
  potential: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
  technical: number;
  mental: number;
  market_value: number;
  wage: number;
  preferred_foot: string;
}

interface Team {
  id: string;
  name: string;
  league_id: string;
}

export default function PlayerSearchPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [ageRange, setAgeRange] = useState([16, 40]);
  const [overallRange, setOverallRange] = useState([40, 99]);
  const [sortBy, setSortBy] = useState("overall-desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersResponse, teamsResponse] = await Promise.all([
        supabase.from("players").select("*"),
        supabase.from("teams").select("id, name, league_id")
      ]);

      if (playersResponse.data) setPlayers(playersResponse.data);
      if (teamsResponse.data) setTeams(teamsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueValues = (key: keyof Player) => {
    return Array.from(new Set(players.map(p => p[key]))).sort();
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || "Unknown";
  };

  const filteredPlayers = players
    .filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === "all" || player.position === positionFilter;
      const matchesNationality = nationalityFilter === "all" || player.nationality === nationalityFilter;
      const matchesTeam = teamFilter === "all" || player.team_id === teamFilter;
      const matchesAge = player.age >= ageRange[0] && player.age <= ageRange[1];
      const matchesOverall = player.overall >= overallRange[0] && player.overall <= overallRange[1];

      return matchesSearch && matchesPosition && matchesNationality && matchesTeam && matchesAge && matchesOverall;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split("-");
      const multiplier = direction === "desc" ? -1 : 1;

      if (field === "name") return multiplier * a.name.localeCompare(b.name);
      if (field === "age") return multiplier * (a.age - b.age);
      if (field === "overall") return multiplier * (a.overall - b.overall);
      if (field === "potential") return multiplier * (a.potential - b.potential);
      if (field === "value") return multiplier * (a.market_value - b.market_value);

      return 0;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setPositionFilter("all");
    setNationalityFilter("all");
    setTeamFilter("all");
    setAgeRange([16, 40]);
    setOverallRange([40, 99]);
    setSortBy("overall-desc");
  };

  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      GK: "bg-yellow-500/20 text-yellow-500",
      DEF: "bg-blue-500/20 text-blue-500",
      MID: "bg-green-500/20 text-green-500",
      ATT: "bg-red-500/20 text-red-500"
    };
    return colors[position] || "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Player Search</h1>
          <Badge variant="secondary">{filteredPlayers.length} Players</Badge>
        </div>

        {/* Search and Filter Controls */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="ghost" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {getUniqueValues("position").map((pos) => (
                        <SelectItem key={pos} value={String(pos)}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nationality</label>
                  <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Nationalities</SelectItem>
                      {getUniqueValues("nationality").map((nat) => (
                        <SelectItem key={nat} value={String(nat)}>{nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team</label>
                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Range: {ageRange[0]} - {ageRange[1]}</label>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    min={16}
                    max={40}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Overall Rating: {overallRange[0]} - {overallRange[1]}</label>
                  <Slider
                    value={overallRange}
                    onValueChange={setOverallRange}
                    min={40}
                    max={99}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall-desc">Overall (High to Low)</SelectItem>
                      <SelectItem value="overall-asc">Overall (Low to High)</SelectItem>
                      <SelectItem value="potential-desc">Potential (High to Low)</SelectItem>
                      <SelectItem value="age-asc">Age (Young to Old)</SelectItem>
                      <SelectItem value="age-desc">Age (Old to Young)</SelectItem>
                      <SelectItem value="value-desc">Value (High to Low)</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Player Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))
          ) : filteredPlayers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No players found matching your criteria</p>
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <Card key={player.id} className="p-4 hover:border-primary transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{player.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{getTeamName(player.team_id)}</p>
                    </div>
                    <Badge className={getPositionColor(player.position)}>
                      {player.position}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{player.nationality}</Badge>
                    <span className="text-muted-foreground">Age {player.age}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Overall:</span>
                      <span className="ml-1 font-bold text-primary">{player.overall}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Potential:</span>
                      <span className="ml-1 font-bold">{player.potential}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">PAC</div>
                      <div className="font-semibold">{player.pace}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">SHO</div>
                      <div className="font-semibold">{player.shooting}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">PAS</div>
                      <div className="font-semibold">{player.passing}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">DEF</div>
                      <div className="font-semibold">{player.defending}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">PHY</div>
                      <div className="font-semibold">{player.physical}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded">
                      <div className="text-muted-foreground">TEC</div>
                      <div className="font-semibold">{player.technical}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <div>Value: €{(player.market_value / 1000000).toFixed(1)}M</div>
                    <div>Wage: €{(player.wage / 1000).toFixed(0)}K/week</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
