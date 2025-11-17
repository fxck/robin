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
  currentOffsetX: number;
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
          offset: Math.random() * Math.PI * 2,
          currentOffsetX: 0
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
        const baseOffset = Math.sin(time + line.offset) * 3;

        // Calculate multiple control points along the line for full-length bending
        const segments = 5;
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const y = t * rect.height;

          // Calculate distance from this point on the line to the mouse
          const dx = mouseX - line.x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply magnetic effect at this point
          let offsetX = baseOffset * (1 - t * 0.3); // Reduce wave at bottom
          if (distance < magnetRadius && mouseRef.current.x > -500) {
            const force = (1 - distance / magnetRadius) * magnetStrength;
            // Apply force proportional to distance
            offsetX += dx * (force / 100);
          }

          points.push({ x: line.x + offsetX, y });
        }

        // Smooth interpolation with delay (gravitational imprint)
        const returnSpeed = 0.04;

        // Draw line using cubic bezier curves through all points
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        // Draw smooth curve through all points
        for (let i = 1; i < points.length; i++) {
          const prevPoint = points[i - 1];
          const currentPoint = points[i];

          const cpX1 = prevPoint.x;
          const cpY1 = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.33;
          const cpX2 = currentPoint.x;
          const cpY2 = prevPoint.y + (currentPoint.y - prevPoint.y) * 0.66;

          ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, currentPoint.x, currentPoint.y);
        }

        ctx.stroke();
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
