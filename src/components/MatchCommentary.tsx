import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { MatchEvent } from "@/types/match";
import { MessageSquare, TrendingUp, TrendingDown } from "lucide-react";

interface MatchCommentaryProps {
  events: MatchEvent[];
  currentMinute: number;
  homeTeam: string;
  awayTeam: string;
  momentum: { home: number; away: number };
}

interface CommentaryLine {
  minute: number;
  text: string;
  type: 'event' | 'tactical' | 'momentum';
}

const MatchCommentary = ({ 
  events, 
  currentMinute, 
  homeTeam, 
  awayTeam,
  momentum 
}: MatchCommentaryProps) => {
  const [commentary, setCommentary] = useState<CommentaryLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEventRef = useRef(0);

  const generateCommentary = (event: MatchEvent): CommentaryLine[] => {
    const lines: CommentaryLine[] = [];
    const team = event.team === 'home' ? homeTeam : awayTeam;

    switch (event.type) {
      case 'goal':
        lines.push({
          minute: event.minute,
          text: `🎯 GOAL! What a finish from ${event.player}! ${team} take the lead with a clinical strike!`,
          type: 'event'
        });
        lines.push({
          minute: event.minute,
          text: `The stadium erupts! That's a crucial moment in this match. ${team} showing their attacking prowess.`,
          type: 'tactical'
        });
        break;

      case 'shot_on_target':
        lines.push({
          minute: event.minute,
          text: `${event.player} tests the goalkeeper! Great shot from ${team}, forcing a save.`,
          type: 'event'
        });
        break;

      case 'shot':
        lines.push({
          minute: event.minute,
          text: `${event.player} shoots... but it goes wide. ${team} building pressure here.`,
          type: 'event'
        });
        break;

      case 'save':
        lines.push({
          minute: event.minute,
          text: `Outstanding save by ${event.player}! Quick reflexes deny what looked like a certain goal.`,
          type: 'event'
        });
        break;

      case 'corner':
        lines.push({
          minute: event.minute,
          text: `Corner kick for ${team}. This could be dangerous...`,
          type: 'event'
        });
        break;

      case 'foul':
        lines.push({
          minute: event.minute,
          text: `Foul called. ${event.player} goes into the book. Referee keeping tight control here.`,
          type: 'event'
        });
        break;

      case 'yellow_card':
        lines.push({
          minute: event.minute,
          text: `⚠️ Yellow card! ${event.player} will need to be careful now. One more and they're off!`,
          type: 'event'
        });
        break;

      case 'substitution':
        lines.push({
          minute: event.minute,
          text: `🔄 Tactical change: ${event.playerIn} comes on for ${event.playerOut}. ${team} looking to change the game.`,
          type: 'tactical'
        });
        break;

      case 'offside':
        lines.push({
          minute: event.minute,
          text: `Flag's up! ${event.player} caught in an offside position. Good awareness from the defense.`,
          type: 'event'
        });
        break;
    }

    return lines;
  };

  const generateMomentumCommentary = (minute: number): CommentaryLine | null => {
    const homeMomentum = momentum.home;
    const awayMomentum = momentum.away;

    if (homeMomentum > 70) {
      return {
        minute,
        text: `${homeTeam} completely dominating possession now. ${awayTeam} struggling to get out of their own half.`,
        type: 'momentum'
      };
    } else if (awayMomentum > 70) {
      return {
        minute,
        text: `${awayTeam} in complete control! Wave after wave of attacks putting ${homeTeam} under immense pressure.`,
        type: 'momentum'
      };
    } else if (Math.abs(homeMomentum - awayMomentum) < 10) {
      return {
        minute,
        text: `End-to-end action here! Both teams trading blows in what's becoming a real classic.`,
        type: 'momentum'
      };
    }

    return null;
  };

  const generateTacticalInsight = (minute: number): CommentaryLine | null => {
    const insights = [
      `Interesting tactical battle developing. Both managers making adjustments from the touchline.`,
      `The midfield battle is crucial here. Whoever controls this area will likely control the game.`,
      `You can see the pressing intensity has changed. Teams adapting their approach.`,
      `Great positional discipline being shown. This is tactical football at its finest.`
    ];

    if (minute % 15 === 0 && minute > 0) {
      return {
        minute,
        text: insights[Math.floor(Math.random() * insights.length)],
        type: 'tactical'
      };
    }

    return null;
  };

  useEffect(() => {
    const newCommentary: CommentaryLine[] = [];

    // Process new events
    const newEvents = events.slice(lastEventRef.current);
    newEvents.forEach(event => {
      if (event.minute <= currentMinute) {
        const eventCommentary = generateCommentary(event);
        newCommentary.push(...eventCommentary);
      }
    });

    // Add momentum commentary occasionally
    if (currentMinute % 10 === 0 && currentMinute > 0) {
      const momentumComment = generateMomentumCommentary(currentMinute);
      if (momentumComment) {
        newCommentary.push(momentumComment);
      }
    }

    // Add tactical insights
    const tacticalComment = generateTacticalInsight(currentMinute);
    if (tacticalComment) {
      newCommentary.push(tacticalComment);
    }

    if (newCommentary.length > 0) {
      setCommentary(prev => [...prev, ...newCommentary].sort((a, b) => a.minute - b.minute));
      lastEventRef.current = events.length;
    }
  }, [events, currentMinute]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commentary]);

  const getCommentaryIcon = (type: string) => {
    switch (type) {
      case 'tactical':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'momentum':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-bold">Live Commentary</h3>
      </div>
      <ScrollArea className="h-[400px]" ref={scrollRef}>
        <div className="space-y-3">
          {commentary.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Match commentary will appear here...
            </p>
          ) : (
            commentary.map((line, idx) => (
              <div key={idx} className="flex gap-2 p-2 rounded-lg bg-muted/30">
                <div className="flex-shrink-0 pt-1">
                  {getCommentaryIcon(line.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {line.minute}'
                    </Badge>
                    <Badge 
                      variant={
                        line.type === 'tactical' ? 'default' : 
                        line.type === 'momentum' ? 'secondary' : 
                        'outline'
                      }
                      className="text-xs"
                    >
                      {line.type}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default MatchCommentary;
