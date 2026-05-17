"use client";

import { useEffect } from "react";

const SPARKLE_COUNT = 22;
const SPARKLE_COLORS = ["#ff7eb3", "#ffc1de", "#a796ff", "#c4b8ff"];

export default function SparkleCursor() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const sparkles: { el: HTMLDivElement; x: number; y: number; vx: number; vy: number; life: number; max: number }[] = [];
    const layer = document.createElement("div");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
    document.body.appendChild(layer);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const el = document.createElement("div");
      // 4x4 도트 픽셀 느낌, 살짝 회전된 사각형
      el.style.cssText = "position:absolute;width:4px;height:4px;opacity:0;will-change:transform,opacity;";
      layer.appendChild(el);
      sparkles.push({ el, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 50 });
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    let lastSpawn = 0;
    let raf = 0;

    const tick = (t: number) => {
      // spawn 간격 늘림 (60ms) — 더 차분
      if (t - lastSpawn > 50) {
        lastSpawn = t;
        const free = sparkles.find((s) => s.life <= 0);
        if (free) {
          free.x = x + (Math.random() - 0.5) * 4;
          free.y = y + (Math.random() - 0.5) * 4;
          const a = Math.random() * Math.PI * 2;
          const sp = Math.random() * 0.5 + 0.2;
          free.vx = Math.cos(a) * sp;
          free.vy = Math.sin(a) * sp + 0.35;
          free.life = free.max;
          const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
          free.el.style.background = color;
          // 도트 픽셀 느낌 — 옅은 글로우만
          free.el.style.boxShadow = `0 0 4px ${color}`;
        }
      }
      for (const s of sparkles) {
        if (s.life > 0) {
          s.life -= 1;
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.035;
          const k = s.life / s.max;
          s.el.style.opacity = String(k * 0.9);
          s.el.style.transform = `translate3d(${s.x - 2}px, ${s.y - 2}px, 0)`;
        } else if (s.el.style.opacity !== "0") {
          s.el.style.opacity = "0";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      layer.remove();
    };
  }, []);

  return null;
}
