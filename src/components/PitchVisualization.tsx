import { useEffect, useRef, useState } from "react";
import { TeamLineup, MatchEvent } from "@/types/match";
import { Card } from "./ui/card";

interface PitchVisualizationProps {
  homeLineup: TeamLineup;
  awayLineup: TeamLineup;
  currentEvent?: MatchEvent;
  currentMinute: number;
  isPlaying: boolean;
  showHeatMap?: boolean;
  attackMomentum?: { home: number; away: number };
  homeColor?: string;
  awayColor?: string;
  homeSecondaryColor?: string;
  awaySecondaryColor?: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
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
  vx: number;
  vy: number;
}

interface HeatMapPoint {
  x: number;
  y: number;
  intensity: number;
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
  isPlaying,
  showHeatMap = false,
  attackMomentum = { home: 50, away: 50 },
  homeColor = '#22c55e',
  awayColor = '#3b82f6',
  homeSecondaryColor = '#ffffff',
  awaySecondaryColor = '#ffffff',
  homeLogoUrl,
  awayLogoUrl
}: PitchVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ballPosition, setBallPosition] = useState<BallPosition>({ x: 50, y: 50, visible: true });
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [dynamicPositions, setDynamicPositions] = useState<Map<string, DynamicPlayerPosition>>(new Map());
  const [heatMapData, setHeatMapData] = useState<Map<string, HeatMapPoint[]>>(new Map());
  const [homeLogoImage, setHomeLogoImage] = useState<HTMLImageElement | null>(null);
  const [awayLogoImage, setAwayLogoImage] = useState<HTMLImageElement | null>(null);
  const animationRef = useRef<number>();
  const movementAnimationRef = useRef<number>();

  // Load team logos
  useEffect(() => {
    if (homeLogoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setHomeLogoImage(img);
      img.src = homeLogoUrl;
    }
  }, [homeLogoUrl]);

  useEffect(() => {
    if (awayLogoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setAwayLogoImage(img);
      img.src = awayLogoUrl;
    }
  }, [awayLogoUrl]);

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

    // Draw team logos
    const logoSize = 50;
    
    // Away team logo (top)
    if (awayLogoImage) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.drawImage(awayLogoImage, width / 2 - logoSize / 2, 35, logoSize, logoSize);
      ctx.restore();
    }

    // Home team logo (bottom)
    if (homeLogoImage) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.drawImage(homeLogoImage, width / 2 - logoSize / 2, height - 85, logoSize, logoSize);
      ctx.restore();
    }
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
    const radius = isActive ? 14 : 12;
    
    const primaryColor = team === 'home' ? homeColor : awayColor;
    const secondaryColor = team === 'home' ? homeSecondaryColor : awaySecondaryColor;

    // Movement trail effect
    if (isMoving && isPlaying) {
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 16, 0, Math.PI * 2);
      ctx.fillStyle = `${primaryColor}33`; // 33 = 20% opacity
      ctx.fill();
    }

    if (isActive) {
      // Glow effect for active player
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 15;
    }

    // Draw jersey with pattern
    ctx.save();
    
    // Create circular clipping path for jersey
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Draw jersey pattern (vertical stripes)
    const stripeWidth = 4;
    const numStripes = Math.ceil((radius * 2) / stripeWidth);
    
    for (let i = -numStripes; i <= numStripes; i++) {
      const stripeX = pixelX + (i * stripeWidth);
      ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
      ctx.fillRect(stripeX - stripeWidth/2, pixelY - radius, stripeWidth, radius * 2);
    }
    
    // Draw collar/shoulder accent (horizontal band at top)
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(pixelX - radius, pixelY - radius, radius * 2, 4);
    
    // Draw sleeves accent (side bands)
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(pixelX - radius, pixelY - radius/2, 3, radius);
    ctx.fillRect(pixelX + radius - 3, pixelY - radius/2, 3, radius);
    
    ctx.restore();
    
    ctx.shadowBlur = 0;

    // White border
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player name (full last name)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 3;
    const lastName = name.split(' ').pop()?.toUpperCase() || '';
    ctx.fillText(lastName, pixelX, pixelY - radius - 6);
    ctx.shadowBlur = 0;
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

  const drawHeatMap = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    if (!showHeatMap) return;

    heatMapData.forEach((points, playerId) => {
      points.forEach(point => {
        const pixelX = (point.x / 100) * width;
        const pixelY = (point.y / 100) * height;
        
        // Draw heat point with gradient
        const gradient = ctx.createRadialGradient(pixelX, pixelY, 0, pixelX, pixelY, 20);
        gradient.addColorStop(0, `rgba(255, 100, 0, ${point.intensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 20, 0, Math.PI * 2);
        ctx.fill();
      });
    });
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

  // Enhanced ball movement - faster passing between players
  useEffect(() => {
    if (!isPlaying) return;

    let passCount = 0;
    const maxPassesBeforeAction = 2 + Math.floor(Math.random() * 3); // 2-4 passes
    
    const moveBall = () => {
      passCount++;
      
      // Determine ball movement based on attack momentum
      const homeAttackStrength = attackMomentum?.home || 50;
      const awayAttackStrength = attackMomentum?.away || 50;
      
      let targetX: number;
      let targetY: number;
      
      // Calculate which team has possession based on momentum
      const homePossession = homeAttackStrength > awayAttackStrength;
      
      if (passCount >= maxPassesBeforeAction) {
        // Build-up complete - move towards goal or create chances
        if (homePossession) {
          // Home attacking - can be anywhere in attacking zones
          targetX = 15 + Math.random() * 70; // Wide spread across attacking width
          targetY = 10 + Math.random() * 40; // Deep into attacking third, towards away goal
        } else {
          // Away attacking - can be anywhere in their attacking zones
          targetX = 15 + Math.random() * 70; // Wide spread
          targetY = 50 + Math.random() * 40; // Deep into attacking third, towards home goal
        }
        passCount = 0; // Reset for next sequence
      } else {
        // Fast passing across entire field
        if (homePossession) {
          // Home possession - can be anywhere from defense to attack
          targetX = 10 + Math.random() * 80; // Full width of pitch
          targetY = 30 + Math.random() * 50; // From home defense to away penalty area
        } else {
          // Away possession - can be anywhere from their defense to attack
          targetX = 10 + Math.random() * 80; // Full width of pitch
          targetY = 20 + Math.random() * 50; // From away defense to home penalty area
        }
      }
      
      // Add some randomness for crosses and long balls
      if (Math.random() < 0.15) {
        // Occasional wide ball to flanks
        targetX = Math.random() < 0.5 ? 5 + Math.random() * 15 : 80 + Math.random() * 15;
      }
      
      // Slower ball movement with smooth interpolation
      setBallPosition(prev => ({
        x: prev.x + (targetX - prev.x) * 0.12, // Slower interpolation
        y: prev.y + (targetY - prev.y) * 0.12,
        visible: true,
      }));
      
      if (isPlaying) {
        setTimeout(moveBall, 200); // Slower ball updates for more realistic passing
      }
    };

    const timer = setTimeout(moveBall, 200);
    return () => clearTimeout(timer);
  }, [isPlaying, attackMomentum]);

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
        // Animate to goal with trail effect
        targetY = currentEvent.team === 'home' ? 5 : 95;
        targetX = 50;
        setActivePlayer(currentEvent.player || null);
        
        // Flash effect for goal
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(0, 0, width, height);
          }
        }
        
        setTimeout(() => setActivePlayer(null), 3000);
        break;
      case 'shot':
        // Missed shot - ball goes wide
        targetY = currentEvent.team === 'home' ? 8 : 92;
        targetX = Math.random() < 0.5 ? 25 : 75;
        setActivePlayer(currentEvent.player || null);
        setTimeout(() => setActivePlayer(null), 1500);
        break;
      case 'shot_on_target':
      case 'save':
        // Animate towards goal with tension
        targetY = currentEvent.team === 'home' ? 10 : 90;
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

  // Initialize player positions with subtle tactical movement
  useEffect(() => {
    const homePositions = getFormationPositions(homeLineup.formation, true);
    const awayPositions = getFormationPositions(awayLineup.formation, false);

    // Initialize positions with subtle movement capability
    const newPositions = new Map<string, DynamicPlayerPosition>();

    homeLineup.players.slice(0, 11).forEach((player, idx) => {
      const posKey = Object.keys(homePositions)[idx];
      const pos = homePositions[posKey];
      if (pos) {
        newPositions.set(player.id, {
          baseX: pos.x,
          baseY: pos.y,
          currentX: pos.x,
          currentY: pos.y,
          x: pos.x,
          y: pos.y,
          name: player.name,
          team: 'home',
          vx: 0,
          vy: 0,
        });
      }
    });

    awayLineup.players.slice(0, 11).forEach((player, idx) => {
      const posKey = Object.keys(awayPositions)[idx];
      const pos = awayPositions[posKey];
      if (pos) {
        newPositions.set(player.id, {
          baseX: pos.x,
          baseY: pos.y,
          currentX: pos.x,
          currentY: pos.y,
          x: pos.x,
          y: pos.y,
          name: player.name,
          team: 'away',
          vx: 0,
          vy: 0,
        });
      }
    });

    setDynamicPositions(newPositions);
  }, [homeLineup, awayLineup]);

  // Subtle tactical player movement effect
  useEffect(() => {
    if (!isPlaying) return;

    const movePlayers = () => {
      setDynamicPositions(prev => {
        const updated = new Map(prev);
        
        updated.forEach((pos, id) => {
          // Small tactical adjustments - players shift slightly
          const randomShiftX = (Math.random() - 0.5) * 2; // ±1% movement
          const randomShiftY = (Math.random() - 0.5) * 2; // ±1% movement
          
          // Keep players close to their base position
          const targetX = pos.baseX + randomShiftX;
          const targetY = pos.baseY + randomShiftY;
          
          // Slow, strategic movement toward target
          const newX = pos.x + (targetX - pos.x) * 0.03; // Very slow movement
          const newY = pos.y + (targetY - pos.y) * 0.03;
          
          updated.set(id, {
            ...pos,
            x: newX,
            y: newY,
            currentX: newX,
            currentY: newY,
          });
        });
        
        return updated;
      });
      
      if (isPlaying) {
        setTimeout(movePlayers, 1000); // Update every second for slow movement
      }
    };

    const timer = setTimeout(movePlayers, 1000);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Render pitch and players continuously
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      // Draw pitch
      drawPitch(ctx, width, height);

      // Draw heat map first (behind players)
      if (showHeatMap) {
        drawHeatMap(ctx, width, height);
      }

      // Draw ball
      drawBall(ctx, ballPosition.x, ballPosition.y, width, height);

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

      // Continue animation loop
      if (isPlaying) {
        requestAnimationFrame(render);
      }
    };

    const animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, ballPosition, dynamicPositions, activePlayer, showHeatMap, homeLineup, awayLineup]);

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
        
        {currentEvent && !showHeatMap && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg animate-fade-in">
            <p className="text-sm font-semibold text-center">
              {currentEvent.description}
            </p>
          </div>
        )}

        {showHeatMap && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">
            <p className="text-xs font-semibold text-center">
              🔥 Heat Map View
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PitchVisualization;
