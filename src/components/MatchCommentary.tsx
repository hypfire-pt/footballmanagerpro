import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { MatchEvent } from "@/types/match";
import { MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import { getRandomEventDescription } from "@/services/matchEventLibrary";

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
    
    // Get varied description from library
    const eventDesc = getRandomEventDescription(event.type);
    let mainText = eventDesc.text;
    
    // Replace generic player references with actual player names
    if (event.player) {
      mainText = mainText.replace(/\bplayer\b/gi, event.player);
    }

    switch (event.type) {
      case 'goal':
        lines.push({
          minute: event.minute,
          text: `${mainText} ${event.player}! ${team} score!`,
          type: 'event'
        });
        lines.push({
          minute: event.minute,
          text: `The stadium erupts! That's a crucial moment. ${team} showing their quality!`,
          type: 'tactical'
        });
        break;

      case 'shot_on_target':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      case 'shot':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      case 'save':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      case 'corner':
        lines.push({
          minute: event.minute,
          text: `${mainText} ${team} looking dangerous!`,
          type: 'event'
        });
        break;

      case 'foul':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      case 'yellow_card':
      case 'red_card':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      case 'substitution':
        lines.push({
          minute: event.minute,
          text: `🔄 Substitution: ${event.playerIn} replaces ${event.playerOut} (${team})`,
          type: 'event'
        });
        break;

      case 'injury':
        lines.push({
          minute: event.minute,
          text: `🚑 Injury: ${event.player} is down and receiving treatment (${team})`,
          type: 'event'
        });
        break;

      case 'offside':
        lines.push({
          minute: event.minute,
          text: `${event.player} - ${mainText}`,
          type: 'event'
        });
        break;

      default:
        lines.push({
          minute: event.minute,
          text: mainText,
          type: 'event'
        });
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
        return <TrendingUp className="h-3 w-3 text-blue-500" />;
      case 'momentum':
        return <TrendingDown className="h-3 w-3 text-orange-500" />;
      default:
        return <MessageSquare className="h-3 w-3 text-green-500" />;
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto space-y-2 pr-1"
    >
      {commentary.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Match commentary will appear here...
        </p>
      ) : (
        commentary.map((line, idx) => (
          <div key={idx} className="flex gap-1.5 p-1.5 rounded bg-muted/30 text-xs">
            <div className="flex-shrink-0 pt-0.5">
              {getCommentaryIcon(line.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {line.minute}'
                </Badge>
              </div>
              <p className="text-xs leading-snug">{line.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MatchCommentary;
