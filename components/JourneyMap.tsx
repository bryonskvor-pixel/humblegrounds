"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Coffee } from "@/lib/types";
import LookAround from "./LookAround";
import fieldGuideStyle from "@/assets/map/humble-grounds-field-guide.json";

const HOME: [number, number] = [-82.2174, 41.293];
const HOME_LABEL = "Oberlin, Ohio";
const FLIGHT_MS = 11000;
const HOLD_MS = 1200;

/* Great-circle interpolation so the route arcs the way a drawn voyage line should. */
function greatCircle(a: [number, number], b: [number, number], steps = 128): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const [lon1, lat1] = a.map(toRad) as [number, number];
  const [lon2, lat2] = b.map(toRad) as [number, number];
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
      )
    );
  if (d === 0) return [a, b];
  const line: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    line.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.hypot(x, y)))]);
  }
  return line;
}

function routeFeature(coords: [number, number][]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } }],
  };
}

function pointsFeature(points: [number, number][]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: p },
    })),
  };
}

type Phase = "depart" | "travel" | "arrived";

export default function JourneyMap({ coffee, onClose }: { coffee: Coffee; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("depart");
  const [looking, setLooking] = useState<number | null>(null);
  const phaseRef = useRef<Phase>("depart");
  phaseRef.current = phase;

  const journey = coffee.journey;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!journey || !token || !containerRef.current) return;

    mapboxgl.accessToken = token;
    const dest = journey.lngLat;
    const line = greatCircle(HOME, dest);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:
        process.env.NEXT_PUBLIC_MAPBOX_STYLE ||
        (fieldGuideStyle as unknown as mapboxgl.StyleSpecification),
      center: reduceMotion ? dest : HOME,
      zoom: reduceMotion ? journey.zoom ?? 11.5 : 9.5,
      pitch: reduceMotion ? journey.pitch ?? 60 : 0,
      bearing: reduceMotion ? journey.bearing ?? 0 : 0,
      attributionControl: true,
    });
    mapRef.current = map;

    // Hypsometric color tint. Deliberately NOT baked into the style (tried
    // once — it loaded from departure and tore the terrain mesh mid-flight,
    // a third concurrent consumer of the same DEM tileset fighting the 3D
    // terrain + hillshade for tiles during the flyTo; see assets/map/README.md).
    // Strip any stale copy that might already be sitting in the style JSON
    // (published styles can lag behind edits by minutes on Mapbox's CDN) so
    // it's never live during the flight, then add our own fresh, gated to
    // only appear once the camera is static.
    const stripStaleTint = () => {
      if (map.getLayer("elevation-tint")) map.removeLayer("elevation-tint");
      if (map.getSource("terrain-rgb")) map.removeSource("terrain-rgb");
    };

    const arrive = () => {
      const src = map.getSource("route") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(routeFeature(line));
      setPhase("arrived");

      try {
        stripStaleTint();
        map.addSource("terrain-rgb", {
          type: "raster",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.addLayer(
          {
            id: "elevation-tint",
            type: "raster",
            source: "terrain-rgb",
            paint: {
              "raster-color-mix": [6553.6, 25.6, 0.1, -10000],
              "raster-color-range": [0, 3200],
              "raster-color": [
                "interpolate",
                ["linear"],
                ["raster-value"],
                0, "#8fa07a",
                600, "#a3a56f",
                1400, "#c2a15f",
                2200, "#8f6a46",
                3200, "#f2e6d3",
              ],
              "raster-opacity": 0,
              "raster-opacity-transition": { duration: 700 },
            },
          },
          map.getLayer("national-park-wash") ? "national-park-wash" : undefined
        );
        // fade in rather than pop, once the layer's own tiles are in
        map.once("idle", () => {
          if (map.getLayer("elevation-tint")) {
            map.setPaintProperty("elevation-tint", "raster-opacity", 0.55);
          }
        });
      } catch {
        // decorative only — a GPU/driver combo that chokes on raster-color-mix
        // should never take down the rest of the map with it
      }
    };

    map.on("load", () => {
      // Do this before anything else: a stale published style could still
      // have the old always-on tint baked in, and it must never render
      // during the upcoming flight.
      stripStaleTint();

      // The route and waypoints ride on top of the style at runtime, so the
      // same code works with the repo JSON or a Studio-hosted style URL
      // (Studio uploads refuse geojson sources).
      const labelAnchor = map.getLayer("ocean-labels") ? "ocean-labels" : undefined;

      // At flight altitude the globe must read against the page: deeper
      // parchment space and a gold horizon rim, whatever the style shipped.
      map.setFog({
        color: "#f7e7cc",
        "high-color": "#e8c878",
        "space-color": "#e9d5ac",
        "horizon-blend": 0.08,
        "star-intensity": 0,
      });

      // If the style still has the launch-era paper-tan ocean, nudge it to the
      // agreed wash blue; a deliberate Studio recolor wins over this.
      if (map.getLayer("water") && String(map.getPaintProperty("water", "fill-color")) === "#d9d3b4") {
        map.setPaintProperty("water", "fill-color", "#c3d3d1");
      }

      // Engraved-relief shading so the arrival mountains have form, not just
      // contour lines. Separate DEM source: sharing one with terrain is
      // discouraged by GL JS.
      if (!map.getSource("hillshade-dem")) {
        map.addSource("hillshade-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.addLayer(
          {
            id: "relief-shading",
            type: "hillshade",
            source: "hillshade-dem",
            minzoom: 7,
            paint: {
              "hillshade-exaggeration": 0.35,
              "hillshade-shadow-color": "#5f5240",
              "hillshade-highlight-color": "#fdf3da",
              "hillshade-accent-color": "#6b4a32",
            },
          },
          map.getLayer("contours-engraved") ? "contours-engraved" : labelAnchor
        );
      }
      if (!map.getSource("route")) {
        map.addSource("route", {
          type: "geojson",
          lineMetrics: true,
          data: routeFeature([HOME, HOME]),
        });
        map.addLayer(
          {
            id: "route-dashed-ink",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#2b2620",
              "line-opacity": 0.85,
              "line-width": ["interpolate", ["linear"], ["zoom"], 1, 1.6, 8, 2.4],
              "line-dasharray": [2.2, 2],
            },
          },
          labelAnchor
        );
      }
      if (!map.getSource("waypoints")) {
        map.addSource("waypoints", { type: "geojson", data: pointsFeature([]) });
        map.addLayer({
          id: "waypoint-dots",
          type: "circle",
          source: "waypoints",
          paint: {
            "circle-color": "#a63a2e",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 3.5, 8, 5.5],
            "circle-stroke-color": "#2b2620",
            "circle-stroke-width": 1.2,
            "circle-opacity": 0.95,
          },
        });
      }
      (map.getSource("waypoints") as mapboxgl.GeoJSONSource | undefined)?.setData(
        pointsFeature([HOME, dest])
      );

      if (reduceMotion) {
        arrive();
        return;
      }

      timerRef.current = setTimeout(() => {
        if (phaseRef.current === "arrived") return;
        setPhase("travel");
        map.flyTo({
          center: dest,
          zoom: journey.zoom ?? 11.5,
          pitch: journey.pitch ?? 60,
          bearing: journey.bearing ?? 0,
          duration: FLIGHT_MS,
          curve: 1.6,
          // Cap the flight ceiling: below this the globe shrinks to a dot and
          // the whole screen is atmosphere — the "blank page" effect.
          minZoom: 2.2,
        });

        const start = performance.now();
        const draw = (now: number) => {
          if (phaseRef.current === "arrived") return;
          const f = Math.min(1, (now - start) / FLIGHT_MS);
          const count = Math.max(2, Math.round(f * line.length));
          (map.getSource("route") as mapboxgl.GeoJSONSource | undefined)?.setData(
            routeFeature(line.slice(0, count))
          );
          if (f < 1) {
            rafRef.current = requestAnimationFrame(draw);
          } else {
            arrive();
          }
        };
        rafRef.current = requestAnimationFrame(draw);
      }, HOLD_MS);
    });

    const skip = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      map.stop();
      map.jumpTo({
        center: dest,
        zoom: journey.zoom ?? 11.5,
        pitch: journey.pitch ?? 60,
        bearing: journey.bearing ?? 0,
      });
      arrive();
    };
    skipRef.current = skip;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!journey) return null;

  return (
    <div className="journey-overlay" role="dialog" aria-label={`Journey to ${journey.label}`}>
      {!token ? (
        <div className="journey-caption">
          <p>The map needs a Mapbox token in .env.local (NEXT_PUBLIC_MAPBOX_TOKEN) before it can travel.</p>
          <button className="close-btn" onClick={onClose}>
            Back
          </button>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="journey-map" />
          <div className="journey-caption">
            <p className="journey-route">
              {HOME_LABEL} → {journey.label}
            </p>
            {phase === "depart" && <p>Leaving the roastery.</p>}
            {phase === "travel" && <p>Traveling south. The dashed line is roughly 2,100 miles.</p>}
            {phase === "arrived" && (
              <>
                {coffee.header && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="journey-header" src={coffee.header} alt="" />
                )}
                <h3>{coffee.name}</h3>
                {journey.story && <p>{journey.story}</p>}
                {coffee.aboutFarm && (
                  <>
                    <p className="journey-label">ABOUT THE FARM</p>
                    {coffee.aboutFarm.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </>
                )}
              </>
            )}
            <div className="journey-actions">
              {phase !== "arrived" && (
                <button className="close-btn" onClick={() => skipRef.current()}>
                  Skip ahead →
                </button>
              )}
              {phase === "arrived" &&
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY &&
                journey.lookArounds?.map((spot, i) => (
                  <button key={i} className="close-btn look-btn" onClick={() => setLooking(i)}>
                    {spot.label} →
                  </button>
                ))}
              <button className="close-btn" onClick={onClose}>
                Back to the menu
              </button>
            </div>
          </div>
        </>
      )}
      {looking !== null && journey.lookArounds?.[looking] && (
        <LookAround spot={journey.lookArounds[looking]} onClose={() => setLooking(null)} />
      )}
    </div>
  );
}
