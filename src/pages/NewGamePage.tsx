import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSave } from "@/contexts/SaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Trophy, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  short_name: string;
  country: string;
  league_id: string;
  reputation: number;
  stadium: string;
  capacity: number;
}

interface League {
  id: string;
  name: string;
  country: string;
  tier: number;
}

const NewGamePage = () => {
  const navigate = useNavigate();
  const { createNewSave } = useSave();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [saveName, setSaveName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsResponse, leaguesResponse] = await Promise.all([
        supabase.from("teams").select("*").order("reputation", { ascending: false }),
        supabase.from("leagues").select("*").order("reputation", { ascending: false }),
      ]);

      if (teamsResponse.data) setTeams(teamsResponse.data);
      if (leaguesResponse.data) setLeagues(leaguesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLeagueName = (leagueId: string) => {
    return leagues.find((l) => l.id === leagueId)?.name || "Unknown League";
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLeagueName(team.league_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartCareer = async () => {
    if (!selectedTeam) {
      toast({
        title: "No Team Selected",
        description: "Please select a team to start your career.",
        variant: "destructive",
      });
      return;
    }

    const finalSaveName = saveName.trim() || `${selectedTeam.name} Career`;

    try {
      setCreating(true);
      await createNewSave(selectedTeam.id, selectedTeam.name, finalSaveName);
      navigate("/dashboard");
    } catch (error) {
      // Error already handled in context
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Start New Career
          </h1>
          <p className="text-muted-foreground">Choose your team and begin your managerial journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Selection */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Select Your Team</CardTitle>
                <CardDescription>Browse teams from top European leagues</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams, countries, or leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading teams...</div>
                  ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No teams found</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeam(team)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedTeam?.id === team.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{team.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {team.reputation}/100
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {getLeagueName(team.league_id)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {team.country}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {team.capacity.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Career Details */}
          <div className="lg:col-span-1">
            <Card className="border-primary/20 sticky top-6">
              <CardHeader>
                <CardTitle>Career Details</CardTitle>
                <CardDescription>Customize your save</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedTeam ? (
                  <>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-2">{selectedTeam.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Country:</span>
                          <span className="font-medium text-foreground">{selectedTeam.country}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>League:</span>
                          <span className="font-medium text-foreground">
                            {getLeagueName(selectedTeam.league_id)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stadium:</span>
                          <span className="font-medium text-foreground">{selectedTeam.stadium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span className="font-medium text-foreground">
                            {selectedTeam.capacity.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputation:</span>
                          <span className="font-medium text-foreground">
                            {selectedTeam.reputation}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="save-name">Save Name</Label>
                      <Input
                        id="save-name"
                        placeholder={`${selectedTeam.name} Career`}
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to use default name
                      </p>
                    </div>

                    <Button
                      onClick={handleStartCareer}
                      disabled={creating}
                      className="w-full"
                      size="lg"
                    >
                      {creating ? "Starting Career..." : "Start Career"}
                    </Button>

                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a team to start your career</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGamePage;
