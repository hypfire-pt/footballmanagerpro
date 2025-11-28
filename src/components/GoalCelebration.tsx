import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface GoalCelebrationProps {
  team: "home" | "away";
  playerName: string;
  onComplete: () => void;
}

export const GoalCelebration = ({ team, playerName, onComplete }: GoalCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Trigger confetti
    const duration = 800;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 40, zIndex: 9999 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 200);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 200);
    }, 800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: 1,
          repeatType: "reverse"
        }}
        className="text-center"
      >
        <motion.div
          className="text-7xl font-bold gradient-text mb-4" // Reduced from text-8xl
          animate={{
            textShadow: [
              "0 0 20px rgba(255,255,255,0.5)",
              "0 0 40px rgba(255,255,255,0.8)",
              "0 0 20px rgba(255,255,255,0.5)",
            ]
          }}
          transition={{ duration: 0.8, repeat: 2 }} // Reduced repeat
        >
          GOAL! ⚽
        </motion.div>
        <motion.div
          className="text-2xl font-semibold text-white" // Reduced from text-3xl
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }} // Reduced from 0.3
        >
          {playerName}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
