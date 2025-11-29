import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchEventOverlayProps {
  type: 'goal' | 'yellow_card' | 'red_card' | 'shot' | 'save';
  playerName?: string;
  team?: string;
  onComplete: () => void;
}

const MatchEventOverlay = ({ type, playerName, team, onComplete }: MatchEventOverlayProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getEventConfig = () => {
    switch (type) {
      case 'goal':
        return {
          emoji: '⚽',
          title: 'GOAL!',
          subtitle: `${playerName} scores for ${team}!`,
          bgColor: 'from-green-500/90 to-emerald-600/90',
          textColor: 'text-white'
        };
      case 'yellow_card':
        return {
          emoji: '🟨',
          title: 'YELLOW CARD',
          subtitle: `${playerName} booked!`,
          bgColor: 'from-yellow-400/90 to-yellow-500/90',
          textColor: 'text-black'
        };
      case 'red_card':
        return {
          emoji: '🟥',
          title: 'RED CARD!',
          subtitle: `${playerName} sent off!`,
          bgColor: 'from-red-500/90 to-red-700/90',
          textColor: 'text-white'
        };
      case 'shot':
        return {
          emoji: '💥',
          title: 'CLOSE!',
          subtitle: `${playerName} - Shot wide!`,
          bgColor: 'from-orange-500/90 to-orange-600/90',
          textColor: 'text-white'
        };
      case 'save':
        return {
          emoji: '🧤',
          title: 'GREAT SAVE!',
          subtitle: `${playerName} denies the shot!`,
          bgColor: 'from-blue-500/90 to-blue-600/90',
          textColor: 'text-white'
        };
    }
  };

  const config = getEventConfig();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          className={`bg-gradient-to-r ${config.bgColor} rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4 border-4 border-white/20`}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
            className="text-8xl mb-4"
          >
            {config.emoji}
          </motion.div>
          <h2 className={`text-4xl font-heading font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h2>
          <p className={`text-xl ${config.textColor} font-medium`}>
            {config.subtitle}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchEventOverlay;
