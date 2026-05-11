"use client";

import { useEffect } from "react";

const SPARKLE_COUNT = 40;
const GOLD_COLORS = ["#FFD700", "#FFC107", "#FFB300", "#FFCA28", "#FFE082"];

export default function SparkleCursor() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ox = x;
    let oy = y;
    let swide = window.innerWidth;
    let shigh = window.innerHeight;

    const stars: HTMLDivElement[] = [];
    const tinies: HTMLDivElement[] = [];
    const starv: number[] = new Array(SPARKLE_COUNT).fill(0);
    const tinyv: number[] = new Array(SPARKLE_COUNT).fill(0);
    const starx: number[] = new Array(SPARKLE_COUNT).fill(0);
    const stary: number[] = new Array(SPARKLE_COUNT).fill(0);
    const tinyx: number[] = new Array(SPARKLE_COUNT).fill(0);
    const tinyy: number[] = new Array(SPARKLE_COUNT).fill(0);

    const createDiv = (h: number, w: number, color: string): HTMLDivElement => {
      const d = document.createElement("div");
      d.style.position = "fixed";
      d.style.height = h + "px";
      d.style.width = w + "px";
      d.style.overflow = "hidden";
      d.style.backgroundColor = color;
      d.style.pointerEvents = "none";
      d.style.zIndex = "9999";
      d.style.visibility = "hidden";
      d.style.boxShadow = `0 0 4px ${color}`;
      return d;
    };

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const color = GOLD_COLORS[i % GOLD_COLORS.length];

      const tiny = createDiv(3, 3, color);
      tiny.style.borderRadius = "50%";
      document.body.appendChild(tiny);
      tinies.push(tiny);

      // Plus-shape star: outer container + 2 inner bars
      const star = createDiv(5, 5, "transparent");
      star.style.boxShadow = "none";
      const vBar = createDiv(5, 1, color);
      const hBar = createDiv(1, 5, color);
      vBar.style.position = "absolute";
      hBar.style.position = "absolute";
      vBar.style.top = "2px";
      vBar.style.left = "0";
      hBar.style.top = "0";
      hBar.style.left = "2px";
      vBar.style.visibility = "visible";
      hBar.style.visibility = "visible";
      vBar.style.boxShadow = `0 0 4px ${color}`;
      hBar.style.boxShadow = `0 0 4px ${color}`;
      star.appendChild(vBar);
      star.appendChild(hBar);
      document.body.appendChild(star);
      stars.push(star);
    }

    const updateStar = (i: number): void => {
      starv[i]--;
      if (starv[i] === 25) {
        const inner = stars[i].children;
        if (inner[0]) (inner[0] as HTMLDivElement).style.height = "3px";
        if (inner[1]) (inner[1] as HTMLDivElement).style.width = "3px";
      }
      if (starv[i] > 0) {
        stary[i] += 1 + Math.random() * 3;
        if (stary[i] < shigh) {
          stars[i].style.top = stary[i] + "px";
          starx[i] += (i % 5 - 2) / 5;
          stars[i].style.left = starx[i] + "px";
        } else {
          stars[i].style.visibility = "hidden";
          starv[i] = 0;
          return;
        }
      } else {
        tinyv[i] = 50;
        tinyx[i] = starx[i];
        tinyy[i] = stary[i];
        tinies[i].style.top = tinyy[i] + "px";
        tinies[i].style.left = tinyx[i] + "px";
        tinies[i].style.width = "2px";
        tinies[i].style.height = "2px";
        stars[i].style.visibility = "hidden";
        tinies[i].style.visibility = "visible";
      }
    };

    const updateTiny = (i: number): void => {
      tinyv[i]--;
      if (tinyv[i] === 25) {
        tinies[i].style.width = "1px";
        tinies[i].style.height = "1px";
      }
      if (tinyv[i] > 0) {
        tinyy[i] += 1 + Math.random() * 3;
        if (tinyy[i] < shigh) {
          tinies[i].style.top = tinyy[i] + "px";
          tinyx[i] += (i % 5 - 2) / 5;
          tinies[i].style.left = tinyx[i] + "px";
        } else {
          tinies[i].style.visibility = "hidden";
          tinyv[i] = 0;
          return;
        }
      } else {
        tinies[i].style.visibility = "hidden";
      }
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const sparkle = (): void => {
      if (x !== ox || y !== oy) {
        ox = x;
        oy = y;
        for (let c = 0; c < SPARKLE_COUNT; c++) {
          if (!starv[c]) {
            starx[c] = x;
            stary[c] = y;
            stars[c].style.left = x + "px";
            stars[c].style.top = y + "px";
            const inner = stars[c].children;
            if (inner[0]) (inner[0] as HTMLDivElement).style.height = "5px";
            if (inner[1]) (inner[1] as HTMLDivElement).style.width = "5px";
            stars[c].style.visibility = "visible";
            starv[c] = 50;
            break;
          }
        }
      }
      for (let c = 0; c < SPARKLE_COUNT; c++) {
        if (starv[c]) updateStar(c);
        if (tinyv[c]) updateTiny(c);
      }
      timer = setTimeout(sparkle, 40);
    };

    const onMouseMove = (e: MouseEvent): void => {
      x = e.clientX;
      y = e.clientY;
    };
    const onResize = (): void => {
      swide = window.innerWidth;
      shigh = window.innerHeight;
    };

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    sparkle();

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      stars.forEach((s) => s.remove());
      tinies.forEach((t) => t.remove());
    };
  }, []);

  return null;
}
