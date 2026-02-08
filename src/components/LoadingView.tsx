import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { PHASES } from "@/types/simulation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

const LoadingView = ({ currentPhase, phaseMessage, evaluatedRoutes = [] }: LoadingViewProps) => {
  const phaseIndex = PHASES.indexOf(currentPhase as typeof PHASES[number]);

  // Derive origin and destination markers from evaluated routes
  const origins = evaluatedRoutes.length > 0
    ? [evaluatedRoutes[0].from]
    : [];
  const destinations = evaluatedRoutes.map((r) => r.to);

  // Place ships at the midpoint of each route
  const shipPositions = evaluatedRoutes.map((r) => {
    const midLng = (r.from[0] + r.to[0]) / 2;
    const midLat = (r.from[1] + r.to[1]) / 2;
    return [midLng, midLat] as [number, number];
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-8">
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

      {/* React Simple Maps World Map */}
      <div className="w-full max-w-3xl rounded-lg border bg-card overflow-hidden relative" style={{ height: 420 }}>
        <ComposableMap
          projectionConfig={{ scale: 140, center: [0, 20] }}
          width={800}
          height={450}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Evaluated route lines */}
          {evaluatedRoutes.map((r, i) => (
            <Line
              key={`eval-route-${i}`}
              from={r.from}
              to={r.to}
              stroke="#c9a832"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray="6 4"
            />
          ))}

          {/* Destination markers (suppliers) */}
          {destinations.map((coords, i) => (
            <Marker key={`dest-${i}`} coordinates={coords}>
              <circle r={5} fill="#2d8a4e" stroke="#fff" strokeWidth={1.5} />
            </Marker>
          ))}

          {/* Origin marker (buyer) */}
          {origins.map((coords, i) => (
            <Marker key={`origin-${i}`} coordinates={coords}>
              <circle r={7} fill="#38bdf8" stroke="#fff" strokeWidth={2} />
            </Marker>
          ))}

          {/* Ship markers on route midpoints */}
          {shipPositions.map((coords, i) => (
            <Marker key={`ship-${i}`} coordinates={coords}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
              >
                🚢
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};

export default LoadingView;
