import { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import type { SimulationReport } from "@/types/simulation";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  report: SimulationReport;
}

interface PinData {
  id: string;
  label: string;
  coords: [number, number]; // [lng, lat]
  type: "buyer" | "supplier";
  country?: string;
}

interface RouteData {
  from: [number, number];
  to: [number, number];
  riskLevel: string;
}

const riskStroke = (level: string) =>
  level === "low"
    ? "#2d8a4e"
    : level === "medium"
    ? "#c9a832"
    : "#c94040";

const WorldMap = ({ report }: WorldMapProps) => {
  const mapData = report.map_data;

  const { pins, routes, hasData } = useMemo(() => {
    const pins: PinData[] = [];
    const routes: RouteData[] = [];

    if (mapData) {
      // Buyer pin
      if (mapData.buyer_pin?.lat != null && mapData.buyer_pin?.lng != null) {
        pins.push({
          id: mapData.buyer_pin.id || "buyer",
          label: mapData.buyer_pin.label || "Buyer",
          coords: [mapData.buyer_pin.lng, mapData.buyer_pin.lat],
          type: "buyer",
        });
      }

      // Supplier pins
      (mapData.supplier_pins ?? []).forEach((s) => {
        if (s?.lat != null && s?.lng != null) {
          pins.push({
            id: s.id,
            label: s.name,
            coords: [s.lng, s.lat],
            type: "supplier",
            country: s.country,
          });
        }
      });

      // Route lines
      (mapData.route_lines ?? []).forEach((r) => {
        if (
          r.from_coords?.lat != null &&
          r.from_coords?.lng != null &&
          r.to_coords?.lat != null &&
          r.to_coords?.lng != null
        ) {
          routes.push({
            from: [r.from_coords.lng, r.from_coords.lat],
            to: [r.to_coords.lng, r.to_coords.lat],
            riskLevel: r.risk_level ?? "medium",
          });
        }
      });
    } else {
      // Fallback: use legacy data
      const buyer = report.world_context?.buyer_coordinates;
      if (buyer?.lat != null && buyer?.lng != null) {
        pins.push({
          id: "buyer",
          label: "Buyer",
          coords: [buyer.lng, buyer.lat],
          type: "buyer",
        });
      }

      (report.discovery_paths ?? []).forEach((s, i) => {
        if (s.lat != null && s.lng != null) {
          pins.push({
            id: `supplier-${i}`,
            label: s.identity,
            coords: [s.lng!, s.lat!],
            type: "supplier",
          });
        }
      });
    }

    return { pins, routes, hasData: pins.length > 0 };
  }, [mapData, report.world_context, report.discovery_paths]);

  // If no valid geo data, render nothing
  if (!hasData) {
    return null;
  }

  const buyerPin = pins.find((p) => p.type === "buyer");
  const supplierPins = pins.filter((p) => p.type === "supplier");

  return (
    <div className="rounded-lg border bg-card overflow-hidden relative" style={{ height: 500 }}>
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
                key={geo.rpiKey}
                geography={geo}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#334155" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Route lines */}
        {routes.map((r, i) => (
          <Line
            key={`route-${i}`}
            from={r.from}
            to={r.to}
            stroke={riskStroke(r.riskLevel)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        ))}

        {/* Fallback routes: draw lines from buyer to each supplier */}
        {routes.length === 0 && buyerPin && supplierPins.map((s, i) => (
          <Line
            key={`fallback-route-${i}`}
            from={buyerPin.coords}
            to={s.coords}
            stroke="#c9a832"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        ))}

        {/* Supplier markers */}
        {supplierPins.map((pin) => (
          <Marker key={pin.id} coordinates={pin.coords}>
            <circle r={5} fill="#2d8a4e" stroke="#fff" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={-10}
              style={{
                fontFamily: "system-ui",
                fontSize: 8,
                fill: "#94a3b8",
              }}
            >
              {pin.label}
            </text>
          </Marker>
        ))}

        {/* Buyer marker */}
        {buyerPin && (
          <Marker coordinates={buyerPin.coords}>
            <circle r={7} fill="#38bdf8" stroke="#fff" strokeWidth={2} />
            <text
              textAnchor="middle"
              y={-12}
              style={{
                fontFamily: "system-ui",
                fontSize: 9,
                fill: "#38bdf8",
                fontWeight: 600,
              }}
            >
              {buyerPin.label}
            </text>
          </Marker>
        )}
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-card/90 rounded p-2 text-[10px] space-y-1 border pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#38bdf8" }} /> Buyer (origin)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#2d8a4e" }} /> Supplier (destination)
        </div>
        {routes.length > 0 && (
          <>
            <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "#2d8a4e" }} /> Low risk</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "#c9a832" }} /> Medium risk</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 inline-block" style={{ background: "#c94040" }} /> High risk</div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
