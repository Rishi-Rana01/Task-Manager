import { useEffect, useRef } from 'react';

/**
 * ConfettiOverlay — canvas-based confetti animation.
 * Renders on top of everything when `show` is true, auto-clears after 4s.
 *
 * Props:
 *   show    {boolean}
 *   onDone  {() => void}  — called when animation completes
 */
export default function ConfettiOverlay({ show, onDone }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    if (!show) return;
    const canvas  = canvasRef.current;
    if (!canvas)  return;
    const ctx     = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#f97316'];
    const pieces = Array.from({ length: 180 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height - canvas.height,
      r:     Math.random() * 7 + 3,
      d:     Math.random() * 160 + 80,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt:  Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltIncrement: (Math.random() * 0.07 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
    }));

    let angle    = 0;
    let startTs  = null;
    const DURATION = 4000;

    const draw = (ts) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const progress = elapsed / DURATION;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;

      pieces.forEach((p) => {
        p.tiltAngle += p.tiltIncrement;
        p.y += Math.cos(angle + p.d) + 2.5;
        p.x += Math.sin(angle) * 1.5;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - progress * 1.5);
        ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 5);
        ctx.stroke();

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      if (elapsed < DURATION) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-100 pointer-events-none"
      aria-hidden="true"
    />
  );
}
