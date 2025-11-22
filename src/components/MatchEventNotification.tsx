import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { MatchEvent } from "@/types/match";
import { Trophy, Zap, AlertCircle, Users, Flag, Circle } from "lucide-react";

interface MatchEventNotificationProps {
  event: MatchEvent;
  homeTeam: string;
  awayTeam: string;
  onComplete?: () => void;
}

export function MatchEventNotification({ 
  event, 
  homeTeam, 
  awayTeam,
  onComplete 
}: MatchEventNotificationProps) {
  const [visible, setVisible] = useState(true);

  const playSound = (type: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'goal':
        // Celebratory ascending tone
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
      case 'card':
        // Sharp warning tone
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
      case 'shot':
        // Quick blip
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const getEventIcon = () => {
    switch(event.type) {
      case 'goal':
        return <Trophy className="h-6 w-6" />;
      case 'shot':
      case 'shot_on_target':
        return <Zap className="h-6 w-6" />;
      case 'yellow_card':
      case 'red_card':
        return <AlertCircle className="h-6 w-6" />;
      case 'substitution':
        return <Users className="h-6 w-6" />;
      case 'corner':
        return <Flag className="h-6 w-6" />;
      default:
        return <Circle className="h-6 w-6" />;
    }
  };

  const getEventColor = () => {
    switch(event.type) {
      case 'goal':
        return 'bg-gradient-gaming';
      case 'shot':
      case 'shot_on_target':
        return 'bg-gradient-accent';
      case 'yellow_card':
        return 'bg-gradient-gold';
      case 'red_card':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  useEffect(() => {
    // Play sound effect
    if (event.type === 'goal') {
      playSound('goal');
      triggerConfetti();
    } else if (event.type === 'yellow_card' || event.type === 'red_card') {
      playSound('card');
    } else if (event.type === 'shot' || event.type === 'shot_on_target') {
      playSound('shot');
    } else {
      playSound('default');
    }

    // Auto-hide after duration
    const duration = event.type === 'goal' ? 5000 : 3000;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [event, onComplete]);

  if (!visible) return null;

  const teamName = event.team === 'home' ? homeTeam : awayTeam;

  return (
    <Card 
      className={`
        fixed top-24 right-6 z-[100] 
        ${getEventColor()} 
        border-0 text-white
        shadow-glow-strong
        animate-fade-in-up
        ${event.type === 'goal' ? 'animate-glow-pulse' : ''}
        transition-all duration-300
        ${!visible ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        width: '350px',
        maxWidth: 'calc(100vw - 3rem)'
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {getEventIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {event.minute}'
              </Badge>
              <span className="text-xs font-bold uppercase tracking-wider">
                {event.type.replace('_', ' ')}
              </span>
            </div>
            
            <p className="font-heading font-bold text-lg mb-1 leading-tight">
              {event.type === 'goal' && '⚽ GOAL! '}
              {event.player || teamName}
            </p>
            
            <p className="text-sm text-white/90 leading-snug">
              {event.description}
            </p>
            
            {event.additionalInfo && (
              <p className="text-xs text-white/70 mt-1">
                {event.additionalInfo}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
