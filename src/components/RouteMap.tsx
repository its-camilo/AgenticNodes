import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip as LeafletTooltip,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import MapPortPanel from "@/components/MapPortPanel";
import MapSupplierPanel from "@/components/MapSupplierPanel";
import MapRoutePopup from "@/components/MapRoutePopup";
import type { SimulationReport, PortPin, SupplierPin, RouteLine } from "@/types/simulation";

// Fix default marker icon issue in Leaflet + bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
    ? "#2d8a4e"
    : score > 50
    ? "#c9a832"
    : "#c94040";

// Custom div icons
const buyerIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:hsl(190,70%,50%);border:3px solid hsl(200,20%,92%);box-shadow:0 0 12px hsl(190,70%,50%);animation:pulse-glow 2s ease-in-out infinite"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const portIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:hsl(210,60%,60%);border:2px solid hsl(200,20%,92%)"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const makeSupplierIcon = (score: number) =>
  L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${trustDotColor(score)};border:2px solid hsl(200,20%,92%)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

/** Convert route polyline from [[lng,lat],...] to [[lat,lng],...] for Leaflet */
const toLeafletPositions = (route: RouteLine): L.LatLngExpression[] => {
  if (route.polyline && route.polyline.length > 0) {
    return route.polyline.map((p) => [p[1], p[0]] as [number, number]);
  }
  // Fallback: build from from_coords -> waypoints -> to_coords
  const pts: L.LatLngExpression[] = [];
  if (route.from_coords?.lat != null) pts.push([route.from_coords.lat, route.from_coords.lng]);
  route.waypoints?.forEach((w) => { if (w?.lat != null) pts.push([w.lat, w.lng]); });
  if (route.to_coords?.lat != null) pts.push([route.to_coords.lat, route.to_coords.lng]);
  return pts;
};

/** Auto-fit map bounds to all pins */
const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useMemo(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  }, [bounds, map]);
  return null;
};

const RouteMap = ({ report }: RouteMapProps) => {
  const mapData = report.map_data;
  const [selectedPort, setSelectedPort] = useState<PortPin | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPin | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteLine | null>(null);

  // Compute bounds
  const bounds = useMemo(() => {
    if (!mapData) return null;
    const pts: [number, number][] = [];
    if (mapData.buyer_pin?.lat != null) pts.push([mapData.buyer_pin.lat, mapData.buyer_pin.lng]);
    mapData.port_pins?.forEach((p) => { if (p?.lat != null) pts.push([p.lat, p.lng]); });
    mapData.supplier_pins?.forEach((s) => { if (s?.lat != null) pts.push([s.lat, s.lng]); });
    if (pts.length === 0) return null;
    return L.latLngBounds(pts);
  }, [mapData]);

  if (!mapData) {
    return <FallbackMap report={report} />;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden relative" style={{ height: 500 }}>
      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-card/90 rounded p-2 text-[10px] space-y-1 border pointer-events-none">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "hsl(190,70%,50%)" }} /> Buyer</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "hsl(210,60%,60%)" }} /> Port</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#2d8a4e" }} /> Supplier (high trust)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "hsl(130,50%,45%)" }} /> Low risk</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "hsl(45,80%,55%)" }} /> Medium risk</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "hsl(0,70%,50%)" }} /> High risk</div>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <FitBounds bounds={bounds} />

        {/* Route polylines */}
        {mapData.route_lines?.map((route) => {
          const positions = toLeafletPositions(route);
          if (positions.length < 2) return null;
          return (
            <Polyline
              key={route.id}
              positions={positions}
              pathOptions={{
                color: riskColor(route.risk_level),
                weight: 3,
                dashArray: "10 6",
              }}
              eventHandlers={{ click: () => setSelectedRoute(route) }}
            />
          );
        })}

        {/* Port markers */}
        {mapData.port_pins?.map((port) => {
          if (port?.lat == null || port?.lng == null) return null;
          return (
            <Marker
              key={port.id}
              position={[port.lat, port.lng]}
              icon={portIcon}
              eventHandlers={{ click: () => setSelectedPort(port) }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]}>
                <span className="text-xs font-medium">{port.name}</span>
              </LeafletTooltip>
            </Marker>
          );
        })}

        {/* Supplier markers */}
        {mapData.supplier_pins?.map((s) => {
          if (s?.lat == null || s?.lng == null) return null;
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={makeSupplierIcon(s.trust_score)}
              eventHandlers={{ click: () => setSelectedSupplier(s) }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]}>
                <span className="text-xs">{s.name} — {s.material}</span>
              </LeafletTooltip>
            </Marker>
          );
        })}

        {/* Buyer marker */}
        {mapData.buyer_pin?.lat != null && (
          <Marker position={[mapData.buyer_pin.lat, mapData.buyer_pin.lng]} icon={buyerIcon}>
            <LeafletTooltip direction="top" offset={[0, -12]} permanent>
              <span className="text-xs font-semibold">{mapData.buyer_pin.label || "Buyer"}</span>
            </LeafletTooltip>
          </Marker>
        )}
      </MapContainer>

      <MapPortPanel port={selectedPort} open={!!selectedPort} onClose={() => setSelectedPort(null)} />
      <MapSupplierPanel supplier={selectedSupplier} open={!!selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      <MapRoutePopup route={selectedRoute} open={!!selectedRoute} onClose={() => setSelectedRoute(null)} />
    </div>
  );
};

// Fallback for when map_data isn't available (legacy response)
const FallbackMap = ({ report }: { report: SimulationReport }) => {
  const { world_context, discovery_paths, routes } = report;
  const buyer = world_context?.buyer_coordinates;
  const portMap = new Map<string, { lat: number; lng: number }>();
  world_context?.countries?.forEach((c) =>
    c.ports?.forEach((p) => portMap.set(p.name, { lat: p.lat, lng: p.lng }))
  );

  const legacyRiskColor = (score: number) =>
    score < 0.3 ? "hsl(130, 50%, 45%)" : score < 0.6 ? "hsl(45, 80%, 55%)" : "hsl(0, 70%, 50%)";

  const routePolylines = (routes || []).map((route, i) => {
    const fromPort = route.ports?.[0] ? portMap.get(route.ports[0]) : null;
    const toPort = route.ports?.[route.ports.length - 1] ? portMap.get(route.ports[route.ports.length - 1]) : null;
    if (!fromPort?.lat || !toPort?.lat) return null;
    return (
      <Polyline
        key={i}
        positions={[[fromPort.lat, fromPort.lng], [toPort.lat, toPort.lng]]}
        pathOptions={{ color: legacyRiskColor(route.risk_score), weight: 2, dashArray: "4 3" }}
      />
    );
  });

  return (
    <div className="rounded-lg border bg-card overflow-hidden" style={{ height: 500 }}>
      <MapContainer
        center={buyer?.lat ? [buyer.lat, buyer.lng] : [20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {routePolylines}
        {Array.from(portMap.entries()).map(([name, coords]) => (
          <Marker key={name} position={[coords.lat, coords.lng]} icon={portIcon}>
            <LeafletTooltip direction="top">{name}</LeafletTooltip>
          </Marker>
        ))}
        {(discovery_paths || []).filter((s) => s.lat && s.lng).map((s, i) => (
          <Marker key={`s-${i}`} position={[s.lat!, s.lng!]} icon={makeSupplierIcon(s.trust_score)} />
        ))}
        {buyer?.lat && (
          <Marker position={[buyer.lat, buyer.lng]} icon={buyerIcon}>
            <LeafletTooltip direction="top" permanent>Buyer</LeafletTooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
