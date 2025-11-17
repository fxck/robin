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
  currentOffsets: number[]; // Track offset for each segment
  velocities: number[]; // Velocity for each segment for momentum
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

      // Initialize lines with segments
      const segments = 8; // More segments for smoother bending
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
          currentOffsets: new Array(segments + 1).fill(0),
          velocities: new Array(segments + 1).fill(0)
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
        const segments = line.currentOffsets.length - 1;
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const y = t * rect.height;

          // Calculate base wave motion (subtle idle animation)
          const baseOffset = Math.sin(time + line.offset + t * 0.5) * 2;

          // Calculate distance from this segment point to mouse
          const dx = mouseX - line.x;
          const dy = mouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate target offset with magnetic force
          let targetOffset = baseOffset;
          if (distance < magnetRadius && mouseRef.current.x > -500) {
            // Exponential falloff for more natural magnetic feel
            const normalizedDist = distance / magnetRadius;
            const force = Math.pow(1 - normalizedDist, 2) * magnetStrength;

            // Apply force with directional component
            targetOffset += dx * (force / 80);

            // Add slight perpendicular wave for organic feel
            const perpendicular = Math.sin(dy * 0.01 + time * 2) * force * 0.1;
            targetOffset += perpendicular;
          }

          // Physics-based smooth interpolation with momentum
          // Spring-damper system for gravitational imprint
          const stiffness = 0.015; // How quickly it responds
          const damping = 0.85; // How much momentum is preserved

          // Calculate spring force
          const springForce = (targetOffset - line.currentOffsets[i]) * stiffness;

          // Update velocity with spring force and damping
          line.velocities[i] = line.velocities[i] * damping + springForce;

          // Update position with velocity
          line.currentOffsets[i] += line.velocities[i];

          // Apply slight drag when far from target for stability
          if (Math.abs(targetOffset - line.currentOffsets[i]) < 0.1) {
            line.velocities[i] *= 0.9;
          }

          points.push({
            x: line.x + line.currentOffsets[i],
            y
          });
        }

        // Draw smooth curve using Catmull-Rom spline for natural flow
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = opacity;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        // Smooth curve through all control points
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[Math.max(0, i - 1)];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[Math.min(points.length - 1, i + 2)];

          // Catmull-Rom to Bezier conversion for smooth curves
          const tension = 0.5;
          const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
          const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
          const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
          const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
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
