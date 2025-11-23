import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TenseMomentEffectProps {
  type: 'close_call' | 'final_minutes' | 'dangerous_attack';
  onComplete: () => void;
}

export const TenseMomentEffect = ({ type, onComplete }: TenseMomentEffectProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const getMessage = () => {
    switch (type) {
      case 'close_call':
        return '⚠️ CLOSE CALL!';
      case 'final_minutes':
        return '🔥 FINAL MINUTES!';
      case 'dangerous_attack':
        return '⚡ DANGEROUS!';
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'close_call':
        return 'text-yellow-400';
      case 'final_minutes':
        return 'text-red-500';
      case 'dangerous_attack':
        return 'text-orange-500';
      default:
        return 'text-white';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0, 1, 1, 0],
        y: [50, 0, 0, -20]
      }}
      transition={{
        duration: 2,
        times: [0, 0.2, 0.8, 1]
      }}
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
    >
      <motion.div
        animate={{
          textShadow: [
            "0 0 10px rgba(255,255,255,0.3)",
            "0 0 20px rgba(255,255,255,0.6)",
            "0 0 10px rgba(255,255,255,0.3)",
          ]
        }}
        transition={{ duration: 0.5, repeat: 3 }}
        className={`text-4xl font-bold ${getColor()} px-6 py-3 bg-black/80 rounded-lg border-2 border-current`}
      >
        {getMessage()}
      </motion.div>
    </motion.div>
  );
};
