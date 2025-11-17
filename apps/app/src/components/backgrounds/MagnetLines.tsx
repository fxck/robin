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
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = (timestamp: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const time = timestamp * 0.001 * animationSpeed;

      linesRef.current.forEach((line, i) => {
        // Calculate distance to mouse
        const dx = mouseRef.current.x - line.x;
        const dy = mouseRef.current.y - line.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply magnetic effect
        if (distance < magnetRadius) {
          const force = (1 - distance / magnetRadius) * magnetStrength;
          const angle = Math.atan2(dy, dx);
          line.targetY = line.baseY + Math.sin(angle) * force;
        } else {
          // Return to base position with gentle wave
          line.targetY = line.baseY + Math.sin(time + line.offset) * 15;
        }

        // Smooth interpolation
        line.y += (line.targetY - line.y) * line.speed;

        // Draw line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(line.x, 0);
        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, rect.height);
        ctx.stroke();

        // Draw glow at attraction point
        if (distance < magnetRadius) {
          const glowIntensity = (1 - distance / magnetRadius) * 0.3;
          const gradient = ctx.createRadialGradient(
            line.x,
            line.y,
            0,
            line.x,
            line.y,
            30
          );
          gradient.addColorStop(0, `${lineColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(line.x, line.y, 30, 0, Math.PI * 2);
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
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [lineCount, magnetStrength, magnetRadius, lineColor, lineWidth, opacity, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: 'auto'
      }}
    />
  );
}
