import { MatchEvent } from "@/types/match";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, AlertCircle, Target, Flag, Zap, Shield, X } from "lucide-react";
import { getRandomEventDescription } from "@/services/matchEventLibrary";

export interface MatchEventNotificationsProps {
  events: MatchEvent[];
  onDismiss?: (index: number) => void;
}

export function MatchEventNotifications({ events, onDismiss }: MatchEventNotificationsProps) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'goal':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'yellow_card':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'red_card':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'shot_on_target':
        return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'shot':
        return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'substitution':
        return 'bg-purple-500/20 border-purple-500 text-purple-400';
      case 'save':
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
      case 'foul':
        return 'bg-amber-500/20 border-amber-500 text-amber-400';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Trophy className="h-4 w-4" />;
      case 'yellow_card':
      case 'red_card':
        return <AlertCircle className="h-4 w-4" />;
      case 'shot_on_target':
        return <Target className="h-4 w-4" />;
      case 'shot':
        return <X className="h-4 w-4" />;
      case 'save':
        return <Shield className="h-4 w-4" />;
      case 'corner':
      case 'offside':
        return <Flag className="h-4 w-4" />;
      case 'foul':
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[100] space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {events.map((event, index) => {
          const eventDesc = getRandomEventDescription(event.type);
          const isHighEmphasis = eventDesc.emphasis === 'high';
          
          return (
            <motion.div
              key={`${event.minute}-${index}-${event.type}`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: isHighEmphasis ? [0.8, 1.15, 1] : 1 
              }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ 
                duration: isHighEmphasis ? 0.6 : 0.3,
                scale: { duration: 0.6, times: [0, 0.5, 1] }
              }}
              onClick={() => onDismiss?.(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform ${getEventColor(event.type)} ${
                isHighEmphasis ? 'shadow-lg ring-2 ring-white/20' : ''
              }`}
            >
              <motion.div
                animate={isHighEmphasis ? { 
                  rotate: [0, -12, 12, -8, 0],
                  scale: [1, 1.3, 1.2, 1.3, 1]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {getEventIcon(event.type)}
              </motion.div>
              <div className="flex-1">
                <span className={`text-xs ${isHighEmphasis ? 'font-bold text-white' : 'font-medium'}`}>
                  {event.minute}' - {event.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
