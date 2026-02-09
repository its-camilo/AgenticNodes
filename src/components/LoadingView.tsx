import { useMemo, useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import { PHASES } from "@/types/simulation";

const PHASE_LABELS: Record<string, string> = {
  generating_world: "Analyzing demand...",
  discovering_suppliers: "Validating suppliers...",
  planning_routes: "Agents traveling to ports...",
  negotiating: "Agents negotiating with suppliers...",
  complete: "Complete",
};

export interface EvaluatedRoute {
  from: [number, number]; // [lng, lat]
  to: [number, number]; // [lng, lat]
  label?: string;
  status?: string;
}

interface LoadingViewProps {
  currentPhase: string;
  phaseMessage: string;
  evaluatedRoutes?: EvaluatedRoute[];
}

// Default demo arcs while waiting for real data
const DEMO_ARCS = [
  { startLat: 40.7, startLng: -74.0, endLat: 51.5, endLng: -0.1, color: "#c9a832" },
  { startLat: 35.7, startLng: 139.7, endLat: 1.3, endLng: 103.8, color: "#2d8a4e" },
  { startLat: -33.9, startLng: 18.4, endLat: 22.3, endLng: 114.2, color: "#c94040" },
  { startLat: 31.2, startLng: 121.5, endLat: 37.6, endLng: -122.4, color: "#c9a832" },
  { startLat: 19.4, startLng: -99.1, endLat: -23.5, endLng: -46.6, color: "#2d8a4e" },
  { startLat: 55.8, startLng: 37.6, endLat: 28.6, endLng: 77.2, color: "#c94040" },
];

const LoadingView = ({ currentPhase, phaseMessage, evaluatedRoutes = [] }: LoadingViewProps) => {
  const globeRef = useRef<GlobeMethods>();
  const phaseIndex = PHASES.indexOf(currentPhase as typeof PHASES[number]);
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  // Build arcs from evaluated routes or use demo arcs
  const arcs = useMemo(() => {
    if (evaluatedRoutes.length > 0) {
      return evaluatedRoutes.map((r) => ({
        startLat: r.from[1],
        startLng: r.from[0],
        endLat: r.to[1],
        endLng: r.to[0],
        color: r.status === "evaluating" ? "#c9a832" : "#2d8a4e",
      }));
    }
    return DEMO_ARCS;
  }, [evaluatedRoutes]);

  // Build point markers from evaluated routes
  const points = useMemo(() => {
    if (evaluatedRoutes.length === 0) return [];
    const pointMap = new Map<string, { lat: number; lng: number; color: string }>();
    evaluatedRoutes.forEach((r) => {
      const fromKey = `${r.from[0]},${r.from[1]}`;
      const toKey = `${r.to[0]},${r.to[1]}`;
      if (!pointMap.has(fromKey)) {
        pointMap.set(fromKey, { lat: r.from[1], lng: r.from[0], color: "#38bdf8" });
      }
      if (!pointMap.has(toKey)) {
        pointMap.set(toKey, { lat: r.to[1], lng: r.to[0], color: "#2d8a4e" });
      }
    });
    return Array.from(pointMap.values());
  }, [evaluatedRoutes]);

  // Slow auto-rotation
  useEffect(() => {
    if (!globeRef.current || !isGlobeReady) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [isGlobeReady]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-6">
      <div className="text-center space-y-3 max-w-lg">
        <h2 className="text-2xl font-bold text-foreground">
          Simulation in progress
        </h2>
        <p className="text-muted-foreground">
          This may take a few minutes...
        </p>
        <p className="text-primary font-medium text-lg min-h-[1.75rem]">
          {phaseMessage || "Connecting..."}
        </p>
      </div>

      {/* Phase progress indicators */}
      <div className="flex gap-2 flex-wrap justify-center">
        {PHASES.map((phase, i) => (
          <div
            key={phase}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              i < phaseIndex
                ? "bg-primary/20 text-primary"
                : i === phaseIndex
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {PHASE_LABELS[phase]}
          </div>
        ))}
      </div>

      {/* 3D Globe */}
      <div className="w-full max-w-3xl rounded-lg border bg-card overflow-hidden relative flex justify-center" style={{ height: 420 }}>
        <Globe
          ref={globeRef}
          width={800}
          height={420}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          showAtmosphere={true}
          atmosphereColor="#38bdf8"
          atmosphereAltitude={0.15}
          onGlobeReady={() => setIsGlobeReady(true)}
          // Points
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius={0.5}
          pointAltitude={0.01}
          // Arcs
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcStroke={0.5}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
        />
      </div>
    </div>
  );
};

export default LoadingView;
