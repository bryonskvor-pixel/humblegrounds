"use client";

import { useEffect, useRef, useState } from "react";
import { openerConfig } from "@/lib/openerConfig";

// The opener (§4.4, light-bloom variant). Site content is always rendered
// underneath; this component only lays the opener on top and gets out of the way.
//
// video-bloom sequence: video plays through the bean's metamorphosis and ends
// on the split bean with light pouring from the seam. We continue that light:
// a gold bloom floods the viewport over the final frame, the video drops away
// at full flood, and the bloom fades to reveal the page — masthead first.
export default function Opener() {
  const [phase, setPhase] = useState<"init" | "video" | "bloom" | "doors" | "opening" | "done">("init");
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealed = useRef(false);

  useEffect(() => {
    if (openerConfig.mode === "open") {
      setPhase("done");
      return;
    }
    if (sessionStorage.getItem("hg_opened") === "1") {
      setPhase("done");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("hg_opened", "1");
      setPhase("done");
      return;
    }
    setPhase("video");
    const t = setTimeout(() => setShowSkip(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => document.body.classList.remove("hg-revealing");
  }, []);

  function beginReveal() {
    if (revealed.current) return;
    revealed.current = true;
    sessionStorage.setItem("hg_opened", "1");

    if (openerConfig.mode === "video-bloom") {
      // 1) bloom floods the viewport over the video's final frame
      setPhase("bloom");
      setTimeout(() => {
        // 2) at full flood, drop the video and let the light fade over the
        //    page; the masthead settles in first, the rest follows
        document.body.classList.add("hg-revealing");
        setPhase("opening");
        setTimeout(() => setPhase("done"), 1300);
      }, 750);
      return;
    }

    if (openerConfig.mode === "video-doors") {
      // swap video for door panels wearing P6's halves, then slide
      setPhase("doors");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("opening")));
    } else {
      setPhase("opening");
    }
    setTimeout(() => setPhase("done"), 1300);
  }

  function skip() {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration)) {
      v.currentTime = v.duration;
    }
    beginReveal();
  }

  if (phase === "done" || phase === "init") return null;

  const bloomMode = openerConfig.mode === "video-bloom";
  const fadeMode = openerConfig.mode === "video-fade";

  const stateClass =
    phase === "bloom" ? "blooming" : phase === "opening" ? (bloomMode || fadeMode ? "fading" : "opening") : "";

  return (
    <div
      className={`opener ${stateClass}`}
      style={phase === "opening" && bloomMode ? { background: "transparent" } : undefined}
      aria-hidden="true"
    >
      {(phase === "video" || phase === "bloom") && (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          preload="auto"
          poster={openerConfig.poster}
          onEnded={beginReveal}
          onError={beginReveal}
        >
          <source src={openerConfig.videoSrcWebm} type="video/webm" />
          <source src={openerConfig.videoSrc} type="video/mp4" />
        </video>
      )}
      {bloomMode && (phase === "bloom" || phase === "opening") && <div className="bloom" />}
      {(phase === "doors" || phase === "opening") && !bloomMode && !fadeMode && (
        <>
          <div className="door door-left" style={{ backgroundImage: `url(${openerConfig.doorLeft})` }} />
          <div className="door door-right" style={{ backgroundImage: `url(${openerConfig.doorRight})` }} />
          <div className="glow-wash" />
        </>
      )}
      {phase === "video" && showSkip && (
        <button className="skip-btn" onClick={skip}>
          skip →
        </button>
      )}
    </div>
  );
}
