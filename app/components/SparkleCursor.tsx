"use client";

import { useEffect } from "react";

const SPARKLE_COUNT = 40;
const PINK_COLORS = ["#FF69B4", "#FF85C0", "#FFA8D6", "#FFB6C1", "#FFD1DC"];

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
      const color = PINK_COLORS[i % PINK_COLORS.length];

      const tiny = createDiv(3, 3, color);
      tiny.style.borderRadius = "50%";
      document.body.appendChild(tiny);
      tinies.push(tiny);

      // Plus-shape star: 7x7 outer container + 2 inner bars (vBar vertical, hBar horizontal)
      const star = createDiv(7, 7, "transparent");
      star.style.boxShadow = "none";
      const vBar = createDiv(7, 1, color); // vertical: 7h x 1w
      const hBar = createDiv(1, 7, color); // horizontal: 1h x 7w
      vBar.style.position = "absolute";
      hBar.style.position = "absolute";
      vBar.style.top = "0";
      vBar.style.left = "3px";   // center horizontally (7/2 = 3)
      hBar.style.top = "3px";    // center vertically
      hBar.style.left = "0";
      vBar.style.visibility = "visible";
      hBar.style.visibility = "visible";
      vBar.style.boxShadow = `0 0 6px ${color}`;
      hBar.style.boxShadow = `0 0 6px ${color}`;
      star.appendChild(vBar);
      star.appendChild(hBar);
      document.body.appendChild(star);
      stars.push(star);
    }

    const updateStar = (i: number): void => {
      starv[i]--;
      if (starv[i] === 25) {
        const inner = stars[i].children;
        if (inner[0]) (inner[0] as HTMLDivElement).style.height = "5px";
        if (inner[1]) (inner[1] as HTMLDivElement).style.width = "5px";
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
            if (inner[0]) (inner[0] as HTMLDivElement).style.height = "7px";
            if (inner[1]) (inner[1] as HTMLDivElement).style.width = "7px";
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
