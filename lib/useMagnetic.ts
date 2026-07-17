"use client";

import { useEffect, useRef } from "react";

/* Subtle magnetic pull toward the cursor on mouse-capable pointers only. */
export function useMagnetic<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // owns both the pull and the press-scale so the two never fight over
    // the inline transform (a CSS :active rule can't win against inline style)
    let tx = 0;
    let ty = 0;
    let pressed = false;
    const apply = () => {
      el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${pressed ? 0.96 : 1})`;
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * strength;
      ty = ((e.clientY - rect.top - rect.height / 2) / rect.height) * strength;
      apply();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      pressed = false;
      apply();
    };
    const onDown = () => {
      pressed = true;
      apply();
    };
    const onUp = () => {
      pressed = false;
      apply();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [strength]);

  return ref;
}
