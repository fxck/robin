import { useEffect, useRef } from 'react';

type MagnetLinesProps = {
  lineCount?: number;
  magnetStrength?: number;
  magnetRadius?: number;
  lineColor?: string;
  lineWidth?: number;
  opacity?: number;
  animationSpeed?: number;
};

type Line = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  baseY: number;
  speed: number;
  offset: number;
};

export default function MagnetLines({
  lineCount = 40,
  magnetStrength = 80,
  magnetRadius = 200,
  lineColor = '#5a4065',
  lineWidth = 2,
  opacity = 0.6,
  animationSpeed = 0.5
}: MagnetLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Initialize lines
      linesRef.current = Array.from({ length: lineCount }, (_, i) => {
        const spacing = rect.width / (lineCount - 1);
        const x = i * spacing;
        return {
          x,
          y: rect.height / 2,
          targetX: x,
          targetY: rect.height / 2,
          baseY: rect.height / 2,
          speed: 0.05 + Math.random() * 0.05,
          offset: Math.random() * Math.PI * 2
        };
      });
    };

    setCanvasSize();

    const handleMouseMove = (e: MouseEvent) => {
      // Store absolute mouse position
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    // Hook to window instead of canvas to track mouse everywhere
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const time = timestamp * 0.001 * animationSpeed;

      // Convert absolute mouse position to canvas-relative coordinates
      const mouseX = mouseRef.current.x - rect.left;
      const mouseY = mouseRef.current.y - rect.top;

      linesRef.current.forEach((line) => {
        // Calculate base wave motion
        const baseOffset = Math.sin(time + line.offset) * 8;

        // Calculate distance to mouse
        const dx = mouseX - line.x;
        const dy = mouseY - rect.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply magnetic effect - bend the X position
        let offsetX = baseOffset;
        if (distance < magnetRadius && mouseRef.current.x > -500) {
          const force = (1 - distance / magnetRadius) * magnetStrength;
          offsetX += dx * (force / 100);
        }

        // Smooth interpolation
        line.targetX = line.x + offsetX;
        const currentX = line.targetX;

        // Draw line from top to bottom with curve
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;

        ctx.beginPath();
        ctx.moveTo(line.x, 0);

        // Use quadratic curve to create smooth bend
        const controlY = rect.height / 2;
        ctx.quadraticCurveTo(currentX, controlY, line.x, rect.height);
        ctx.stroke();

        // Draw glow at control point if near mouse
        if (distance < magnetRadius && mouseRef.current.x > -500) {
          const glowIntensity = (1 - distance / magnetRadius) * 0.4;
          const gradient = ctx.createRadialGradient(
            currentX,
            controlY,
            0,
            currentX,
            controlY,
            40
          );
          gradient.addColorStop(0, `${lineColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(currentX, controlY, 40, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [lineCount, magnetStrength, magnetRadius, lineColor, lineWidth, opacity, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: 'none'
      }}
    />
  );
}
