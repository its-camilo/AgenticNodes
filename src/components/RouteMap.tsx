import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import MapPortPanel from "@/components/MapPortPanel";
import MapSupplierPanel from "@/components/MapSupplierPanel";
import MapRoutePopup from "@/components/MapRoutePopup";
import type { SimulationReport, PortPin, SupplierPin, RouteLine } from "@/types/simulation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface RouteMapProps {
  report: SimulationReport;
}

const riskColor = (level: string) =>
  level === "low"
    ? "hsl(130, 50%, 45%)"
    : level === "medium"
    ? "hsl(45, 80%, 55%)"
    : "hsl(0, 70%, 50%)";

const trustDotColor = (score: number) =>
  score > 75
    ? "hsl(130, 50%, 45%)"
    : score > 50
    ? "hsl(45, 80%, 55%)"
    : "hsl(0, 70%, 50%)";

const RouteMap = ({ report }: RouteMapProps) => {
  const mapData = report.map_data;
  const [zoom, setZoom] = useState(1);
  const [selectedPort, setSelectedPort] = useState<PortPin | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPin | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteLine | null>(null);

  // Compute center from all pins
  const center = useMemo(() => {
    if (!mapData) return [20, 20] as [number, number];
    const lats: number[] = [];
    const lngs: number[] = [];
    lats.push(mapData.buyer_pin.lat);
    lngs.push(mapData.buyer_pin.lng);
    mapData.port_pins.forEach((p) => { lats.push(p.lat); lngs.push(p.lng); });
    mapData.supplier_pins.forEach((s) => { lats.push(s.lat); lngs.push(s.lng); });
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    return [avgLng, avgLat] as [number, number];
  }, [mapData]);

  // Fallback to old rendering if no map_data
  if (!mapData) {
    return <FallbackMap report={report} />;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(z * 1.5, 8))}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}>
          <Minus className="h-3 w-3" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-card/90 rounded p-2 text-[10px] space-y-1 border">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[hsl(190,70%,50%)] inline-block" /> Buyer</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[hsl(210,60%,60%)] inline-block" /> Port</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[hsl(130,50%,45%)] inline-block" /> Supplier (high trust)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[hsl(130,50%,45%)] inline-block" /> Low risk</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[hsl(45,80%,55%)] inline-block" /> Medium risk</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[hsl(0,70%,50%)] inline-block" /> High risk</div>
      </div>

      <TooltipProvider delayDuration={0}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 140 }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup zoom={zoom} center={center}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsSVGPath}
                    geography={geo}
                    fill="#1a2540"
                    stroke="#2a3a5c"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1f2d4a", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Route lines with waypoints */}
            {mapData.route_lines.map((route) => {
              const points: [number, number][] = [
                [route.from_coords.lng, route.from_coords.lat],
                ...route.waypoints.map((w) => [w.lng, w.lat] as [number, number]),
                [route.to_coords.lng, route.to_coords.lat],
              ];
              const color = riskColor(route.risk_level);

              return points.slice(0, -1).map((from, i) => (
                <Line
                  key={`${route.id}-${i}`}
                  from={from}
                  to={points[i + 1]}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  className="animate-dash cursor-pointer"
                  onClick={() => setSelectedRoute(route)}
                />
              ));
            })}

            {/* Ship icons on routes */}
            {mapData.route_lines.map((route) => {
              // Place ship at midpoint of route
              const midLat = (route.from_coords.lat + route.to_coords.lat) / 2;
              const midLng = (route.from_coords.lng + route.to_coords.lng) / 2;
              return (
                <Marker
                  key={`ship-${route.id}`}
                  coordinates={[midLng, midLat]}
                  onClick={() => setSelectedRoute(route)}
                  style={{ cursor: "pointer" }}
                >
                  <text
                    textAnchor="middle"
                    fontSize={12}
                    className="animate-pulse select-none"
                    style={{ pointerEvents: "all" }}
                  >
                    🚢
                  </text>
                </Marker>
              );
            })}

            {/* Port pins */}
            {mapData.port_pins.map((port) => (
              <Tooltip key={port.id}>
                <TooltipTrigger asChild>
                  <Marker
                    coordinates={[port.lng, port.lat]}
                    onClick={() => setSelectedPort(port)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle r={4} fill="hsl(210, 60%, 60%)" stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
                  </Marker>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {port.name}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Supplier pins */}
            {mapData.supplier_pins.map((s) => (
              <Marker
                key={s.id}
                coordinates={[s.lng, s.lat]}
                onClick={() => setSelectedSupplier(s)}
                style={{ cursor: "pointer" }}
              >
                <circle r={3.5} fill={trustDotColor(s.trust_score)} stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
              </Marker>
            ))}

            {/* Buyer pin */}
            <Marker coordinates={[mapData.buyer_pin.lng, mapData.buyer_pin.lat]}>
              <circle r={7} fill="hsl(190, 70%, 50%)" className="animate-pulse-glow" />
              <circle r={3.5} fill="hsl(200, 20%, 92%)" />
              <text
                textAnchor="middle"
                y={-14}
                style={{ fontSize: 9, fill: "hsl(190, 70%, 50%)", fontWeight: 600 }}
              >
                {mapData.buyer_pin.label || "Buyer"}
              </text>
            </Marker>
          </ZoomableGroup>
        </ComposableMap>
      </TooltipProvider>

      <MapPortPanel port={selectedPort} open={!!selectedPort} onClose={() => setSelectedPort(null)} />
      <MapSupplierPanel supplier={selectedSupplier} open={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      <MapRoutePopup route={selectedRoute} open={!!selectedRoute} onClose={() => setSelectedRoute(null)} />
    </div>
  );
};

// Fallback for when map_data isn't available (legacy response)
const FallbackMap = ({ report }: { report: SimulationReport }) => {
  const { world_context, discovery_paths, routes } = report;
  const buyer = world_context.buyer_coordinates;
  const portMap = new Map<string, { lat: number; lng: number }>();
  world_context.countries.forEach((c) =>
    c.ports.forEach((p) => portMap.set(p.name, { lat: p.lat, lng: p.lng }))
  );

  const legacyRiskColor = (score: number) =>
    score < 0.3 ? "hsl(130, 50%, 45%)" : score < 0.6 ? "hsl(45, 80%, 55%)" : "hsl(0, 70%, 50%)";

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsSVGPath}
                geography={geo}
                fill="#1a2540"
                stroke="#2a3a5c"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1f2d4a", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {routes.map((route, i) => {
          const fromPort = route.ports[0] ? portMap.get(route.ports[0]) : null;
          const toPort = route.ports[route.ports.length - 1] ? portMap.get(route.ports[route.ports.length - 1]) : null;
          if (!fromPort || !toPort) return null;
          return (
            <Line key={i} from={[fromPort.lng, fromPort.lat]} to={[toPort.lng, toPort.lat]}
              stroke={legacyRiskColor(route.risk_score)} strokeWidth={2} strokeDasharray="4 3" strokeLinecap="round" />
          );
        })}
        {Array.from(portMap.entries()).map(([name, coords]) => (
          <Marker key={name} coordinates={[coords.lng, coords.lat]}>
            <circle r={3} fill="hsl(210, 60%, 60%)" stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
            <text textAnchor="middle" y={-8} style={{ fontSize: 7, fill: "hsl(210, 15%, 55%)" }}>{name}</text>
          </Marker>
        ))}
        {discovery_paths.filter((s) => s.lat && s.lng).map((s, i) => (
          <Marker key={`s-${i}`} coordinates={[s.lng!, s.lat!]}>
            <circle r={4} fill="hsl(45, 80%, 55%)" stroke="hsl(200, 20%, 92%)" strokeWidth={0.5} />
          </Marker>
        ))}
        <Marker coordinates={[buyer.lng, buyer.lat]}>
          <circle r={6} fill="hsl(190, 70%, 50%)" className="animate-pulse-glow" />
          <circle r={3} fill="hsl(200, 20%, 92%)" />
          <text textAnchor="middle" y={-12} style={{ fontSize: 9, fill: "hsl(190, 70%, 50%)", fontWeight: 600 }}>Buyer</text>
        </Marker>
      </ComposableMap>
    </div>
  );
};

export default RouteMap;
