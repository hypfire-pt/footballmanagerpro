import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchEvent } from "@/types/match";
import { Trophy, Target, AlertCircle, Users, Repeat } from "lucide-react";

interface MatchHighlightsReplayProps {
  events: MatchEvent[];
  homeTeam: string;
  awayTeam: string;
}

export const MatchHighlightsReplay = ({
  events,
  homeTeam,
  awayTeam,
}: MatchHighlightsReplayProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'goals' | 'cards' | 'chances'>('all');

  const goals = events.filter(e => e.type === 'goal');
  const cards = events.filter(e => e.type === 'yellow_card' || e.type === 'red_card');
  const chances = events.filter(e => 
    e.type === 'shot_on_target' || e.type === 'save' || e.type === 'shot'
  ).slice(0, 10);

  const getFilteredEvents = () => {
    switch (selectedFilter) {
      case 'goals':
        return goals;
      case 'cards':
        return cards;
      case 'chances':
        return chances;
      default:
        return [...goals, ...cards, ...chances].sort((a, b) => a.minute - b.minute);
    }
  };

  const filteredEvents = getFilteredEvents();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'shot_on_target':
      case 'shot':
      case 'save':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'yellow_card':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'red_card':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Repeat className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventBadgeVariant = (type: string) => {
    if (type === 'goal') return 'default';
    if (type === 'red_card') return 'destructive';
    return 'outline';
  };

  return (
    <Card className="glass border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Repeat className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-heading font-semibold">Match Highlights</h3>
      </div>

      <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="all" className="text-xs">
            All ({[...goals, ...cards, ...chances].length})
          </TabsTrigger>
          <TabsTrigger value="goals" className="text-xs">
            <Trophy className="h-3 w-3 mr-1" />
            Goals ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cards ({cards.length})
          </TabsTrigger>
          <TabsTrigger value="chances" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Chances ({chances.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFilter} className="mt-0">
          <ScrollArea className="h-[300px] pr-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No {selectedFilter === 'all' ? 'highlights' : selectedFilter} in this match
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEvents.map((event, index) => (
                  <Card key={index} className="p-3 border-border/30 hover:border-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                            {event.minute}'
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.team === 'home' ? homeTeam : awayTeam}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{event.description}</p>
                        {event.player && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.player}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
