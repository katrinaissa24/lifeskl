"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#6b46ff", "#ff6f9c", "#f5c542", "#1f8a5b", "#4a2ed1", "#ffe6ee"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  color: string;
  shape: "rect" | "circle";
}

/**
 * Dependency-free canvas confetti. Fires two bursts from the bottom corners
 * plus a center shower on mount — celebration without a 40kb library.
 */
export function Confetti({ pieces = 160 }: { pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = window.innerWidth;
    const H = window.innerHeight;

    const all: Piece[] = [];
    const spawn = (cx: number, cy: number, count: number, spread: number, power: number) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        const speed = power * (0.5 + Math.random());
        all.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 6 + Math.random() * 7,
          h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() > 0.4 ? "rect" : "circle",
        });
      }
    };

    spawn(W * 0.12, H * 0.85, Math.floor(pieces / 3), 1.1, 15);
    spawn(W * 0.88, H * 0.85, Math.floor(pieces / 3), 1.1, 15);
    spawn(W * 0.5, H * 0.4, Math.floor(pieces / 3), Math.PI * 2, 7);

    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const elapsed = t - t0;
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of all) {
        p.vy += 0.32; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y < H + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, 1 - (elapsed - 2600) / 800));
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive && elapsed < 3600) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pieces]);

  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />;
}
