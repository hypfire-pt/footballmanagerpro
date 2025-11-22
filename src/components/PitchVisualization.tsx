import { useEffect, useRef, useState } from "react";
import { TeamLineup, MatchEvent } from "@/types/match";
import { Card } from "./ui/card";

interface PitchVisualizationProps {
  homeLineup: TeamLineup;
  awayLineup: TeamLineup;
  currentEvent?: MatchEvent;
  currentMinute: number;
  isPlaying: boolean;
}

interface PlayerPosition {
  x: number;
  y: number;
  name: string;
  team: 'home' | 'away';
  isActive?: boolean;
  targetX?: number;
  targetY?: number;
}

interface DynamicPlayerPosition extends PlayerPosition {
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
}

interface BallPosition {
  x: number;
  y: number;
  visible: boolean;
}

const PitchVisualization = ({ 
  homeLineup, 
  awayLineup, 
  currentEvent,
  currentMinute,
  isPlaying 
}: PitchVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ballPosition, setBallPosition] = useState<BallPosition>({ x: 50, y: 50, visible: true });
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [dynamicPositions, setDynamicPositions] = useState<Map<string, DynamicPlayerPosition>>(new Map());
  const animationRef = useRef<number>();
  const movementAnimationRef = useRef<number>();

  // Formation position mappings (percentage-based)
  const getFormationPositions = (formation: string, isHome: boolean): Record<string, { x: number; y: number }> => {
    const baseY = isHome ? 85 : 15; // Home at bottom, away at top
    const direction = isHome ? -1 : 1;

    const formations: Record<string, Record<string, { x: number; y: number }>> = {
      "4-2-3-1": {
        GK: { x: 50, y: baseY },
        LB: { x: 20, y: baseY + direction * 15 },
        CB1: { x: 38, y: baseY + direction * 15 },
        CB2: { x: 62, y: baseY + direction * 15 },
        RB: { x: 80, y: baseY + direction * 15 },
        CDM1: { x: 35, y: baseY + direction * 30 },
        CDM2: { x: 65, y: baseY + direction * 30 },
        LW: { x: 20, y: baseY + direction * 45 },
        CAM: { x: 50, y: baseY + direction * 45 },
        RW: { x: 80, y: baseY + direction * 45 },
        ST: { x: 50, y: baseY + direction * 60 },
      },
      "4-4-2": {
        GK: { x: 50, y: baseY },
        LB: { x: 20, y: baseY + direction * 15 },
        CB1: { x: 38, y: baseY + direction * 15 },
        CB2: { x: 62, y: baseY + direction * 15 },
        RB: { x: 80, y: baseY + direction * 15 },
        LM: { x: 20, y: baseY + direction * 40 },
        CM1: { x: 40, y: baseY + direction * 40 },
        CM2: { x: 60, y: baseY + direction * 40 },
        RM: { x: 80, y: baseY + direction * 40 },
        ST1: { x: 40, y: baseY + direction * 60 },
        ST2: { x: 60, y: baseY + direction * 60 },
      },
      "4-3-3": {
        GK: { x: 50, y: baseY },
        LB: { x: 20, y: baseY + direction * 15 },
        CB1: { x: 38, y: baseY + direction * 15 },
        CB2: { x: 62, y: baseY + direction * 15 },
        RB: { x: 80, y: baseY + direction * 15 },
        CM1: { x: 30, y: baseY + direction * 40 },
        CM2: { x: 50, y: baseY + direction * 40 },
        CM3: { x: 70, y: baseY + direction * 40 },
        LW: { x: 25, y: baseY + direction * 60 },
        ST: { x: 50, y: baseY + direction * 60 },
        RW: { x: 75, y: baseY + direction * 60 },
      },
    };

    return formations[formation] || formations["4-2-3-1"];
  };

  const drawPitch = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Grass gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a5f3a');
    gradient.addColorStop(0.5, '#2d7a4f');
    gradient.addColorStop(1, '#1a5f3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grass stripes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < height; i += 40) {
      if (Math.floor(i / 40) % 2 === 0) {
        ctx.fillRect(0, i, width, 40);
      }
    }

    // White pitch markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    // Outer boundary
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Center line
    ctx.beginPath();
    ctx.moveTo(20, height / 2);
    ctx.lineTo(width - 20, height / 2);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Top penalty area
    ctx.strokeRect(width / 2 - 100, 20, 200, 100);
    ctx.strokeRect(width / 2 - 50, 20, 100, 40);

    // Top penalty spot
    ctx.beginPath();
    ctx.arc(width / 2, 75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bottom penalty area
    ctx.strokeRect(width / 2 - 100, height - 120, 200, 100);
    ctx.strokeRect(width / 2 - 50, height - 60, 100, 40);

    // Bottom penalty spot
    ctx.beginPath();
    ctx.arc(width / 2, height - 75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Top goal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(width / 2 - 40, 10, 80, 10);
    ctx.strokeRect(width / 2 - 40, 10, 80, 10);

    // Bottom goal
    ctx.fillRect(width / 2 - 40, height - 20, 80, 10);
    ctx.strokeRect(width / 2 - 40, height - 20, 80, 10);
  };

  const drawPlayer = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    team: 'home' | 'away',
    name: string,
    isActive: boolean,
    width: number,
    height: number,
    isMoving: boolean = false
  ) => {
    const pixelX = (x / 100) * width;
    const pixelY = (y / 100) * height;

    // Movement trail effect
    if (isMoving && isPlaying) {
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 16, 0, Math.PI * 2);
      ctx.fillStyle = team === 'home' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)';
      ctx.fill();
    }

    // Player circle
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, isActive ? 14 : 12, 0, Math.PI * 2);
    
    if (isActive) {
      // Glow effect for active player
      ctx.shadowColor = team === 'home' ? '#22c55e' : '#3b82f6';
      ctx.shadowBlur = 15;
    }

    ctx.fillStyle = team === 'home' ? '#22c55e' : '#3b82f6';
    ctx.fill();
    ctx.shadowBlur = 0;

    // White border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player name (abbreviated)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    const shortName = name.split(' ').pop()?.substring(0, 3).toUpperCase() || '';
    ctx.fillText(shortName, pixelX, pixelY - 18);
  };

  const drawBall = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!ballPosition.visible) return;

    const pixelX = (x / 100) * width;
    const pixelY = (y / 100) * height;

    // Ball shadow
    ctx.beginPath();
    ctx.arc(pixelX + 2, pixelY + 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Ball
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ball shine
    ctx.beginPath();
    ctx.arc(pixelX - 2, pixelY - 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  };

  const animateBallMovement = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    duration: number
  ) => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setBallPosition({
        x: from.x + (to.x - from.x) * easeProgress,
        y: from.y + (to.y - from.y) * easeProgress,
        visible: true,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Handle match events and animate accordingly
  useEffect(() => {
    if (!currentEvent) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Determine target position based on event
    let targetX = 50;
    let targetY = 50;

    switch (currentEvent.type) {
      case 'goal':
        // Animate to goal
        targetY = currentEvent.team === 'home' ? 5 : 95;
        targetX = 50;
        setActivePlayer(currentEvent.player || null);
        setTimeout(() => setActivePlayer(null), 2000);
        break;
      case 'shot':
      case 'shot_on_target':
      case 'save':
        // Animate towards goal
        targetY = currentEvent.team === 'home' ? 15 : 85;
        targetX = 45 + Math.random() * 10;
        setActivePlayer(currentEvent.player || null);
        setTimeout(() => setActivePlayer(null), 1500);
        break;
      case 'corner':
        // Move to corner
        targetX = Math.random() < 0.5 ? 10 : 90;
        targetY = currentEvent.team === 'home' ? 20 : 80;
        break;
      case 'foul':
        // Random midfield position
        targetX = 30 + Math.random() * 40;
        targetY = 40 + Math.random() * 20;
        setActivePlayer(currentEvent.player || null);
        setTimeout(() => setActivePlayer(null), 1000);
        break;
      default:
        // Move to attacking third
        targetX = 40 + Math.random() * 20;
        targetY = currentEvent.team === 'home' ? 30 + Math.random() * 20 : 50 + Math.random() * 20;
    }

    animateBallMovement(ballPosition, { x: targetX, y: targetY }, 800);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentEvent]);

  // Initialize and animate player movement
  useEffect(() => {
    if (!isPlaying) return;

    const homePositions = getFormationPositions(homeLineup.formation, true);
    const awayPositions = getFormationPositions(awayLineup.formation, false);

    // Initialize dynamic positions
    const newPositions = new Map<string, DynamicPlayerPosition>();

    homeLineup.players.slice(0, 11).forEach((player, idx) => {
      const posKey = Object.keys(homePositions)[idx];
      const pos = homePositions[posKey];
      if (pos) {
        const existing = dynamicPositions.get(player.id);
        newPositions.set(player.id, {
          baseX: pos.x,
          baseY: pos.y,
          currentX: existing?.currentX || pos.x,
          currentY: existing?.currentY || pos.y,
          x: existing?.currentX || pos.x,
          y: existing?.currentY || pos.y,
          name: player.name,
          team: 'home',
        });
      }
    });

    awayLineup.players.slice(0, 11).forEach((player, idx) => {
      const posKey = Object.keys(awayPositions)[idx];
      const pos = awayPositions[posKey];
      if (pos) {
        const existing = dynamicPositions.get(player.id);
        newPositions.set(player.id, {
          baseX: pos.x,
          baseY: pos.y,
          currentX: existing?.currentX || pos.x,
          currentY: existing?.currentY || pos.y,
          x: existing?.currentX || pos.x,
          y: existing?.currentY || pos.y,
          name: player.name,
          team: 'away',
        });
      }
    });

    // Animate player movement based on tactics
    const animateMovement = () => {
      newPositions.forEach((playerPos, playerId) => {
        const player = [...homeLineup.players, ...awayLineup.players].find(p => p.id === playerId);
        if (!player) return;

        // Calculate movement based on ball position and tactics
        const lineup = playerPos.team === 'home' ? homeLineup : awayLineup;
        const tactics = lineup.tactics;
        
        // Determine target position based on tactics
        let targetX = playerPos.baseX;
        let targetY = playerPos.baseY;

        // Pressing movement
        if (tactics.pressing === 'high') {
          const ballDistance = Math.sqrt(
            Math.pow(ballPosition.x - playerPos.baseX, 2) + 
            Math.pow(ballPosition.y - playerPos.baseY, 2)
          );
          
          if (ballDistance < 30) {
            // Move towards ball
            const angle = Math.atan2(ballPosition.y - playerPos.baseY, ballPosition.x - playerPos.baseX);
            targetX = playerPos.baseX + Math.cos(angle) * 5;
            targetY = playerPos.baseY + Math.sin(angle) * 5;
          }
        }

        // Width adjustment
        if (tactics.width === 'wide') {
          if (targetX < 50) targetX -= 5;
          if (targetX > 50) targetX += 5;
        } else if (tactics.width === 'narrow') {
          if (targetX < 50) targetX += 3;
          if (targetX > 50) targetX -= 3;
        }

        // Smooth movement
        const speed = 0.1;
        playerPos.currentX += (targetX - playerPos.currentX) * speed;
        playerPos.currentY += (targetY - playerPos.currentY) * speed;
        playerPos.x = playerPos.currentX;
        playerPos.y = playerPos.currentY;
      });

      setDynamicPositions(new Map(newPositions));
      movementAnimationRef.current = requestAnimationFrame(animateMovement);
    };

    movementAnimationRef.current = requestAnimationFrame(animateMovement);

    return () => {
      if (movementAnimationRef.current) {
        cancelAnimationFrame(movementAnimationRef.current);
      }
    };
  }, [isPlaying, homeLineup, awayLineup, ballPosition]);

  // Render pitch and players
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw pitch
    drawPitch(ctx, width, height);

    // Draw players using dynamic positions
    if (dynamicPositions.size > 0 && isPlaying) {
      dynamicPositions.forEach((playerPos) => {
        const isMoving = Math.abs(playerPos.currentX - playerPos.baseX) > 1 || 
                        Math.abs(playerPos.currentY - playerPos.baseY) > 1;
        drawPlayer(
          ctx,
          playerPos.x,
          playerPos.y,
          playerPos.team,
          playerPos.name,
          activePlayer === playerPos.name,
          width,
          height,
          isMoving
        );
      });
    } else {
      // Draw static positions
      const homePositions = getFormationPositions(homeLineup.formation, true);
      const awayPositions = getFormationPositions(awayLineup.formation, false);

      homeLineup.players.slice(0, 11).forEach((player, idx) => {
        const posKey = Object.keys(homePositions)[idx];
        const pos = homePositions[posKey];
        if (pos) {
          drawPlayer(
            ctx,
            pos.x,
            pos.y,
            'home',
            player.name,
            activePlayer === player.name,
            width,
            height
          );
        }
      });

      awayLineup.players.slice(0, 11).forEach((player, idx) => {
        const posKey = Object.keys(awayPositions)[idx];
        const pos = awayPositions[posKey];
        if (pos) {
          drawPlayer(
            ctx,
            pos.x,
            pos.y,
            'away',
            player.name,
            activePlayer === player.name,
            width,
            height
          );
        }
      });
    }

    // Draw ball
    drawBall(ctx, ballPosition.x, ballPosition.y, width, height);

    // Draw match info overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 120, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${currentMinute}'`, 20, 30);
    ctx.font = '12px Arial';
    ctx.fillText(isPlaying ? '⚽ LIVE' : '⏸ PAUSED', 20, 45);
  }, [homeLineup, awayLineup, ballPosition, activePlayer, currentMinute, isPlaying, dynamicPositions]);

  return (
    <Card className="p-4 overflow-hidden">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={800}
          className="w-full rounded-lg shadow-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {currentEvent && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg animate-fade-in">
            <p className="text-sm font-semibold text-center">
              {currentEvent.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PitchVisualization;
