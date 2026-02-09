import { useMemo, useRef, useEffect } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import type { SimulationReport } from "@/types/simulation";

interface WorldMapProps {
  report: SimulationReport;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
}

interface PointData {
  lat: number;
  lng: number;
  label: string;
  color: string;
  size: number;
  type: "buyer" | "supplier" | "port";
}

const riskColor = (level: string) =>
  level === "low"
    ? "#2d8a4e"
    : level === "medium"
    ? "#c9a832"
    : "#c94040";

const WorldMap = ({ report }: WorldMapProps) => {
  const globeRef = useRef<GlobeMethods>();
  const mapData = report.map_data;

  const { points, arcs } = useMemo(() => {
    const points: PointData[] = [];
    const arcs: ArcData[] = [];

    if (mapData) {
      // Buyer pin
      if (mapData.buyer_pin?.lat != null && mapData.buyer_pin?.lng != null) {
        points.push({
          lat: mapData.buyer_pin.lat,
          lng: mapData.buyer_pin.lng,
          label: mapData.buyer_pin.label || "Buyer",
          color: "#38bdf8",
          size: 0.8,
          type: "buyer",
        });
      }

      // Supplier pins
      (mapData.supplier_pins ?? []).forEach((s) => {
        if (s?.lat != null && s?.lng != null) {
          points.push({
            lat: s.lat,
            lng: s.lng,
            label: `${s.name} (${s.material})`,
            color: "#2d8a4e",
            size: 0.5,
            type: "supplier",
          });
        }
      });

      // Port pins
      (mapData.port_pins ?? []).forEach((p) => {
        if (p?.lat != null && p?.lng != null) {
          points.push({
            lat: p.lat,
            lng: p.lng,
            label: `${p.name}, ${p.country}`,
            color: "#6b93d6",
            size: 0.3,
            type: "port",
          });
        }
      });

      // Route arcs
      (mapData.route_lines ?? []).forEach((r) => {
        if (
          r.from_coords?.lat != null &&
          r.from_coords?.lng != null &&
          r.to_coords?.lat != null &&
          r.to_coords?.lng != null
        ) {
          arcs.push({
            startLat: r.from_coords.lat,
            startLng: r.from_coords.lng,
            endLat: r.to_coords.lat,
            endLng: r.to_coords.lng,
            color: riskColor(r.risk_level ?? "medium"),
            label: `${r.supplier_name || r.supplier_id}: ${r.material} (${r.transit_days}d)`,
          });
        }
      });
    } else {
      // Fallback: use legacy data
      const buyer = report.world_context?.buyer_coordinates;
      if (buyer?.lat != null && buyer?.lng != null) {
        points.push({
          lat: buyer.lat,
          lng: buyer.lng,
          label: "Buyer",
          color: "#38bdf8",
          size: 0.8,
          type: "buyer",
        });
      }

      (report.discovery_paths ?? []).forEach((s) => {
        if (s.lat != null && s.lng != null) {
          points.push({
            lat: s.lat,
            lng: s.lng!,
            label: s.identity,
            color: "#2d8a4e",
            size: 0.5,
            type: "supplier",
          });

          if (buyer?.lat != null && buyer?.lng != null) {
            arcs.push({
              startLat: buyer.lat,
              startLng: buyer.lng,
              endLat: s.lat,
              endLng: s.lng!,
              color: "#c9a832",
              label: s.identity,
            });
          }
        }
      });
    }

    return { points, arcs };
  }, [mapData, report.world_context, report.discovery_paths]);

  // Auto-position camera to fit data
  useEffect(() => {
    if (!globeRef.current || points.length === 0) return;
    const timer = setTimeout(() => {
      const buyer = points.find((p) => p.type === "buyer");
      if (buyer) {
        globeRef.current?.pointOfView({ lat: buyer.lat, lng: buyer.lng, altitude: 2.5 }, 1000);
      } else {
        const first = points[0];
        globeRef.current?.pointOfView({ lat: first.lat, lng: first.lng, altitude: 2.5 }, 1000);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [points]);

  if (points.length === 0 && arcs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden relative flex justify-center" style={{ height: 500 }}>
      <Globe
        ref={globeRef}
        width={600}
        height={500}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        showAtmosphere={true}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.15}
        // Points
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.01}
        pointLabel="label"
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
        arcDashAnimateTime={1500}
        arcLabel="label"
      />

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-card/90 rounded p-2 text-[10px] space-y-1 border pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#38bdf8" }} /> Buyer
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#2d8a4e" }} /> Supplier
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#6b93d6" }} /> Port
        </div>
        {arcs.length > 0 && (
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
