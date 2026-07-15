"use client";

import { useEffect, useRef, useState } from "react";
import { openerConfig } from "@/lib/openerConfig";

// The door mechanic (§4.4). Site content is always rendered underneath;
// this component only lays the opener on top and gets out of the way.
export default function Opener() {
  const [phase, setPhase] = useState<"init" | "video" | "doors" | "opening" | "done">("init");
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  function beginReveal() {
    sessionStorage.setItem("hg_opened", "1");
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

  const fadeMode = openerConfig.mode === "video-fade";

  return (
    <div className={`opener ${phase === "opening" ? (fadeMode ? "fading" : "opening") : ""}`} aria-hidden="true">
      {phase === "video" && (
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
      {(phase === "doors" || phase === "opening") && !fadeMode && (
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
