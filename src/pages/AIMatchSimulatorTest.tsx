import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import { AIMatchSimulatorService } from "@/services/aiMatchSimulatorService";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AIMatchSimulatorTest() {
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    setSimulating(true);
    setResult(null);

    try {
      const mockMatch = {
        homeTeam: {
          name: "Manchester United",
          players: [
            { name: "Marcus Rashford", overall: 85 },
            { name: "Bruno Fernandes", overall: 87 },
            { name: "Casemiro", overall: 86 },
            { name: "Raphaël Varane", overall: 85 },
            { name: "Luke Shaw", overall: 82 },
          ],
          tactics: {
            formation: "4-2-3-1",
            mentality: "attacking",
            pressing: "high"
          }
        },
        awayTeam: {
          name: "Liverpool",
          players: [
            { name: "Mohamed Salah", overall: 89 },
            { name: "Virgil van Dijk", overall: 90 },
            { name: "Alisson Becker", overall: 89 },
            { name: "Trent Alexander-Arnold", overall: 87 },
            { name: "Darwin Núñez", overall: 82 },
          ],
          tactics: {
            formation: "4-3-3",
            mentality: "balanced",
            pressing: "medium"
          }
        },
        competition: "Premier League",
        matchday: 1
      };

      const simulationResult = await AIMatchSimulatorService.simulateMatch(mockMatch);

      if (simulationResult.success && simulationResult.result) {
        setResult(simulationResult);
        toast({
          title: "✅ AI Simulation Complete",
          description: `${mockMatch.homeTeam.name} ${simulationResult.result.homeScore} - ${simulationResult.result.awayScore} ${mockMatch.awayTeam.name}`,
        });
      } else {
        throw new Error(simulationResult.error || "Simulation failed");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "❌ Simulation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Match Simulator
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered match simulation using Lovable AI
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Test Match Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  Simulate Manchester United vs Liverpool using AI
                </p>
              </div>
              <Button 
                onClick={handleSimulate} 
                disabled={simulating}
                size="lg"
              >
                {simulating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Simulate Match
                  </>
                )}
              </Button>
            </div>

            {result && result.success && (
              <div className="space-y-4 mt-6">
                <Separator />

                {/* Match Result */}
                <div className="text-center py-6">
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div className="text-right flex-1">
                      <p className="font-bold text-2xl">{result.homeTeam}</p>
                      <Badge variant="outline" className="mt-1">Home</Badge>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 bg-primary/10 rounded-lg">
                      <span className="text-4xl font-bold">{result.result.homeScore}</span>
                      <Trophy className="h-6 w-6 text-muted-foreground" />
                      <span className="text-4xl font-bold">{result.result.awayScore}</span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-2xl">{result.awayTeam}</p>
                      <Badge variant="outline" className="mt-1">Away</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto">
                    {result.result.narrative}
                  </p>
                </div>

                <Separator />

                {/* Match Stats */}
                <div>
                  <h4 className="font-semibold mb-3">Match Statistics</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-right font-medium">{result.result.stats.possession.home}%</div>
                    <div className="text-center text-muted-foreground">Possession</div>
                    <div className="text-left font-medium">{result.result.stats.possession.away}%</div>

                    <div className="text-right font-medium">{result.result.stats.shots.home}</div>
                    <div className="text-center text-muted-foreground">Shots</div>
                    <div className="text-left font-medium">{result.result.stats.shots.away}</div>

                    <div className="text-right font-medium">{result.result.stats.shotsOnTarget.home}</div>
                    <div className="text-center text-muted-foreground">On Target</div>
                    <div className="text-left font-medium">{result.result.stats.shotsOnTarget.away}</div>

                    <div className="text-right font-medium">{result.result.stats.corners.home}</div>
                    <div className="text-center text-muted-foreground">Corners</div>
                    <div className="text-left font-medium">{result.result.stats.corners.away}</div>

                    <div className="text-right font-medium">{result.result.stats.passAccuracy.home}%</div>
                    <div className="text-center text-muted-foreground">Pass Accuracy</div>
                    <div className="text-left font-medium">{result.result.stats.passAccuracy.away}%</div>
                  </div>
                </div>

                <Separator />

                {/* Match Events */}
                <div>
                  <h4 className="font-semibold mb-3">Match Events</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {result.result.events
                        .sort((a: any, b: any) => a.minute - b.minute)
                        .map((event: any, idx: number) => (
                          <Card key={idx} className="p-3">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="shrink-0">
                                {event.minute}'
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant={
                                      event.type === 'goal' ? 'default' :
                                      event.type === 'yellow_card' ? 'secondary' :
                                      event.type === 'red_card' ? 'destructive' :
                                      'outline'
                                    }
                                  >
                                    {event.type.replace('_', ' ')}
                                  </Badge>
                                  <span className="font-medium text-sm">{event.player}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({event.team === 'home' ? result.homeTeam : result.awayTeam})
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This AI match simulator uses Lovable AI (powered by Google Gemini) to generate realistic match events, 
            scores, and narratives based on team quality, tactics, and player attributes. Each simulation is unique and considers 
            various factors like formation, mentality, and player ratings to produce authentic football match outcomes.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
