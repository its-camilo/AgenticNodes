import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import type { SimulationReport } from "@/types/simulation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface RouteMapProps {
  report: SimulationReport;
}

const RouteMap = ({ report }: RouteMapProps) => {
  const { world_context, discovery_paths, routes } = report;
  const buyer = world_context.buyer_coordinates;

  // Collect all ports with coordinates
  const portMap = new Map<string, { lat: number; lng: number }>();
  world_context.countries.forEach((c) =>
    c.ports.forEach((p) => portMap.set(p.name, { lat: p.lat, lng: p.lng }))
  );

  const riskColor = (score: number) =>
    score < 0.3 ? "hsl(130, 50%, 45%)" : score < 0.6 ? "hsl(45, 80%, 55%)" : "hsl(0, 70%, 50%)";

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120, center: [20, 20] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsSVGPath}
                geography={geo}
                fill="hsl(215, 25%, 18%)"
                stroke="hsl(215, 20%, 25%)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "hsl(215, 25%, 22%)", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Route lines */}
        {routes.map((route, i) => {
          // Try to find port coordinates for route endpoints
          const fromPort = route.ports[0] ? portMap.get(route.ports[0]) : null;
          const toPort = route.ports[route.ports.length - 1]
            ? portMap.get(route.ports[route.ports.length - 1])
            : null;
          if (!fromPort || !toPort) return null;
          return (
            <Line
              key={i}
              from={[fromPort.lng, fromPort.lat]}
              to={[toPort.lng, toPort.lat]}
              stroke={riskColor(route.risk_score)}
              strokeWidth={2}
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          );
        })}

        {/* Port markers */}
        {Array.from(portMap.entries()).map(([name, coords]) => (
          <Marker key={name} coordinates={[coords.lng, coords.lat]}>
            <circle r={3} fill="hsl(175, 60%, 40%)" stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontSize: 7, fill: "hsl(210, 15%, 55%)" }}
            >
              {name}
            </text>
          </Marker>
        ))}

        {/* Supplier markers */}
        {discovery_paths
          .filter((s) => s.lat && s.lng)
          .map((s, i) => (
            <Marker key={`s-${i}`} coordinates={[s.lng!, s.lat!]}>
              <circle r={4} fill="hsl(45, 80%, 55%)" stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
            </Marker>
          ))}

        {/* Buyer marker */}
        <Marker coordinates={[buyer.lng, buyer.lat]}>
          <circle r={6} fill="hsl(190, 70%, 50%)" className="animate-pulse-glow" />
          <circle r={3} fill="hsl(200, 20%, 92%)" />
          <text
            textAnchor="middle"
            y={-12}
            style={{ fontSize: 9, fill: "hsl(190, 70%, 50%)", fontWeight: 600 }}
          >
            Buyer
          </text>
        </Marker>
      </ComposableMap>
    </div>
  );
};

export default RouteMap;
