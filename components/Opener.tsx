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
//
// Sound: the opener plays with audio, no mute control. Browsers refuse
// unmuted autoplay without a user gesture, so we try it, and when refused we
// hold on the poster with a "press to open" gate; the tap starts video+sound.
export default function Opener() {
  const [phase, setPhase] = useState<"init" | "gate" | "video" | "bloom" | "doors" | "opening" | "done">("init");
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealed = useRef(false);
  const started = useRef(false);

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

  // attempt unmuted autoplay; when the browser refuses, fall back to the gate
  useEffect(() => {
    if (phase !== "video" || started.current) return;
    const v = videoRef.current;
    if (!v) return;
    started.current = true;
    v.muted = false;
    v.play().catch(() => setPhase("gate"));
  }, [phase]);

  useEffect(() => {
    return () => document.body.classList.remove("hg-revealing");
  }, []);

  function openWithSound() {
    const v = videoRef.current;
    setPhase("video");
    if (v) {
      v.muted = false;
      v.play().catch(() => {
        // a tap is a gesture; if playback still fails, let the page through
        beginReveal();
      });
    }
  }

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
    if (v) {
      v.pause();
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
      {(phase === "video" || phase === "gate" || phase === "bloom") && (
        <video
          ref={videoRef}
          playsInline
          preload="auto"
          poster={openerConfig.poster}
          onEnded={beginReveal}
          onError={beginReveal}
        >
          <source src={openerConfig.videoSrcWebm} type="video/webm" />
          <source src={openerConfig.videoSrc} type="video/mp4" />
        </video>
      )}
      {phase === "gate" && (
        <button className="gate-btn" onClick={openWithSound}>
          press to open
        </button>
      )}
      {bloomMode && (phase === "bloom" || phase === "opening") && <div className="bloom" />}
      {(phase === "doors" || phase === "opening") && !bloomMode && !fadeMode && (
        <>
          <div className="door door-left" style={{ backgroundImage: `url(${openerConfig.doorLeft})` }} />
          <div className="door door-right" style={{ backgroundImage: `url(${openerConfig.doorRight})` }} />
          <div className="glow-wash" />
        </>
      )}
      {(phase === "video" || phase === "gate") && showSkip && (
        <button className="skip-btn" onClick={skip}>
          skip →
        </button>
      )}
    </div>
  );
}
