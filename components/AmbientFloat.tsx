"use client";

import { useEffect, useRef } from "react";
import { BeanGlyph } from "./Glyphs";

/* Purely decorative: a handful of small beans drifting on their own slow
   float, plus a gentle cursor-parallax on top (nearer beans drift more).
   Both are inert to layout and screen readers. */
const ITEMS = [
  { top: "10%", left: "7%", size: 30, depth: 12, dur: 9, delay: 0, filled: 1 },
  { top: "72%", left: "12%", size: 20, depth: 22, dur: 7, delay: 1.1, filled: 0.5 },
  { top: "16%", left: "89%", size: 24, depth: 18, dur: 8.4, delay: 0.6, filled: 0.5 },
  { top: "66%", left: "91%", size: 28, depth: 9, dur: 10.2, delay: 2, filled: 1 },
  { top: "42%", left: "3%", size: 16, depth: 26, dur: 6.6, delay: 0.3, filled: 0 },
];

export default function AmbientFloat() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      root.querySelectorAll<HTMLElement>(".mf-item").forEach((el) => {
        const depth = parseFloat(el.dataset.depth || "0");
        el.style.transform = `translate(${(cx * depth).toFixed(2)}px, ${(cy * depth).toFixed(2)}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="masthead-float" ref={rootRef} aria-hidden="true">
      {ITEMS.map((it, i) => (
        <div
          key={i}
          className="mf-item"
          data-depth={it.depth}
          style={{ top: it.top, left: it.left, width: it.size, height: it.size }}
        >
          <span className="mf-bean-anim" style={{ animationDuration: `${it.dur}s`, animationDelay: `${it.delay}s` }}>
            <BeanGlyph filled={it.filled} className="mf-bean" />
          </span>
        </div>
      ))}
    </div>
  );
}
