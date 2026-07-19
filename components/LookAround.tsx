"use client";

import { useEffect, useRef, useState } from "react";
import type { LookAroundSpot } from "@/lib/types";

// Street-level "step outside" at the origin: a real Google Street View
// panorama near the farm's region — El Tajín for Veracruz, the colonial
// plaza for Comayagua. The Maps JS API only downloads when someone actually
// clicks "Look around", same lazy pattern as the journey map itself.

declare global {
  interface Window {
    __gmapsLoader?: Promise<void>;
  }
}

function loadGoogleMaps(key: string): Promise<void> {
  if (!window.__gmapsLoader) {
    window.__gmapsLoader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
      s.async = true;
      // With loading=async, importLibrary appears a beat AFTER the script's
      // onload (the bootstrap fetches main.js first) — poll for it.
      s.onload = () => {
        const t0 = Date.now();
        const poll = () => {
          if (typeof google !== "undefined" && typeof google.maps !== "undefined" && "importLibrary" in google.maps) {
            resolve();
          } else if (Date.now() - t0 > 10000) {
            reject(new Error("maps js never became ready"));
          } else {
            setTimeout(poll, 50);
          }
        };
        poll();
      };
      s.onerror = () => reject(new Error("maps js failed to load"));
      document.head.appendChild(s);
    });
  }
  return window.__gmapsLoader;
}

export default function LookAround({ spot, onClose }: { spot: LookAroundSpot; onClose: () => void }) {
  const panoRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!key || !panoRef.current) {
      setState("failed");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleMaps(key);
        const { StreetViewService, StreetViewPanorama } = (await google.maps.importLibrary(
          "streetView"
        )) as google.maps.StreetViewLibrary;
        const [lng, lat] = spot.lngLat;
        // Radius search instead of a hardcoded pano id: Google retires and
        // re-shoots panoramas, and this always lands on the freshest one.
        // No source restriction — Comayagua's plaza and Kayanza town are
        // user-contributed 360s, not Google car imagery.
        const { data } = await new StreetViewService().getPanorama({
          location: { lat, lng },
          radius: spot.radius ?? 1500,
          preference: google.maps.StreetViewPreference.BEST,
          ...(spot.outdoorOnly ? { sources: [google.maps.StreetViewSource.OUTDOOR] } : {}),
        });
        if (cancelled || !panoRef.current || !data.location?.pano) {
          if (!cancelled) setState("failed");
          return;
        }
        new StreetViewPanorama(panoRef.current, {
          pano: data.location.pano,
          pov: { heading: spot.heading ?? 0, pitch: spot.pitch ?? 0 },
          zoom: 0,
          addressControl: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
          showRoadLabels: false,
        });
        setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    // capture phase so Escape closes this overlay, not the journey under it
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div className="look-overlay" role="dialog" aria-label={spot.label}>
      <div ref={panoRef} className="look-pano" />
      {state === "loading" && <p className="look-status">Stepping outside…</p>}
      {state === "failed" && (
        <p className="look-status">No street imagery reachable right now. The mountains are shy.</p>
      )}
      <div className="look-caption">
        <p className="journey-route">{spot.label}</p>
        {spot.note && <p className="look-note">{spot.note}</p>}
        <button className="close-btn" onClick={onClose}>
          Back to the map
        </button>
      </div>
    </div>
  );
}
