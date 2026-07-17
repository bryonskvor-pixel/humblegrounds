"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Combines the plate card's two hover/scroll effects on one element ref:
   a scroll-triggered reveal (IntersectionObserver) and a pointer-tracked
   tilt + shine (CSS custom properties consumed in globals.css). One ref
   because an element can only take one `ref` prop. */
export function useCardFx<T extends HTMLElement>(tiltMax = 6) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (e.pointerType !== "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--rx", `${((0.5 - py) * tiltMax * 2).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * tiltMax * 2).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    },
    [tiltMax]
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return { ref, visible, onPointerMove, onPointerLeave };
}
