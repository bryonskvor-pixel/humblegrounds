"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Coffee } from "@/lib/types";
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

    const arrive = () => {
      const src = map.getSource("route") as mapboxgl.GeoJSONSource | undefined;
      src?.setData(routeFeature(line));
      setPhase("arrived");
    };

    map.on("load", () => {
      // The route and waypoints ride on top of the style at runtime, so the
      // same code works with the repo JSON or a Studio-hosted style URL
      // (Studio uploads refuse geojson sources).
      const labelAnchor = map.getLayer("ocean-labels") ? "ocean-labels" : undefined;
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
            setPhase("arrived");
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
                <h3>{coffee.name}</h3>
                {journey.story && <p>{journey.story}</p>}
              </>
            )}
            <div className="journey-actions">
              {phase !== "arrived" && (
                <button className="close-btn" onClick={() => skipRef.current()}>
                  Skip ahead →
                </button>
              )}
              <button className="close-btn" onClick={onClose}>
                Back to the menu
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
