import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Home } from "lucide-react";
import SupplierCard from "@/components/SupplierCard";
import WorldMap from "@/components/WorldMap";
import NegotiationTerms from "@/components/NegotiationTerms";
import SummaryDisplay from "@/components/SummaryDisplay";
import type { SimulationResponse, TrustLogicEntry, Route } from "@/types/simulation";

interface ResultsDashboardProps {
  data: SimulationResponse;
  onReset: () => void;
}

const TrustLogicCard = ({ entry }: { entry: TrustLogicEntry }) => {
  const trustColor =
    entry.trust_score > 75
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : entry.trust_score > 50
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm text-foreground leading-tight">
          {entry.supplier_id}
        </h4>
        <Badge className={`shrink-0 ${trustColor}`}>{entry.trust_score}</Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{entry.rationale}</p>
      {entry.flags && entry.flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.flags.map((f, i) => (
            <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const RouteCard = ({ route }: { route: Route }) => {
  const riskPct = route.risk_pct != null ? route.risk_pct : Math.round((route.risk_score ?? 0) * 100);
  const portsText = route.ports && route.ports.length > 0 ? route.ports.join(" → ") : "—";
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          {route.supplier_name || route.from}{route.material ? ` (${route.material})` : ""}{route.to ? ` → ${route.to}` : ""}
        </span>
        <span className="text-xs text-muted-foreground">{route.transit_days}d</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Risk: {riskPct}% · Ports: {portsText}
      </p>
    </div>
  );
};

const ResultsDashboard = ({ data, onReset }: ResultsDashboardProps) => {
  const { report, summary } = data;
  const terms = report.negotiation?.terms ?? [];
  const totalCost = report.negotiation?.total_cost_estimate ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-primary shrink-0">Simulation Results</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
              <RotateCcw className="h-4 w-4 mr-1" />
              New
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.reload()}
              className="shrink-0"
            >
              <Home className="h-4 w-4 mr-1" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="max-w-[1600px] mx-auto w-full px-4 pt-4">
        <SummaryDisplay summary={summary} />
      </div>

      {/* Main grid */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left - Suppliers & Routes */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Suppliers & Trust
            </h3>
            <ScrollArea className="h-[calc(100vh-220px)] lg:h-[500px]">
              <div className="space-y-3 pr-2">
                {/* Show suppliers from map_data.supplier_pins when available */}
                {report.map_data?.supplier_pins && report.map_data.supplier_pins.length > 0
                  ? report.map_data.supplier_pins.map((s, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-foreground leading-tight">
                            {s.name}
                          </h4>
                          <Badge
                            className={`shrink-0 ${
                              s.trust_score > 75
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : s.trust_score > 50
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {s.trust_score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.material} · {s.country}
                        </p>
                        {s.trust_rationale && s.trust_rationale.length > 0 && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {s.trust_rationale.join("; ")}
                          </p>
                        )}
                      </div>
                    ))
                  : (report.discovery_paths ?? []).length > 0
                  ? (report.discovery_paths ?? []).map((s, i) => (
                      <SupplierCard key={i} supplier={s} />
                    ))
                  : (report.trust_logic ?? []).map((entry, i) => (
                      <TrustLogicCard key={i} entry={entry} />
                    ))}
                {(report.routes ?? []).length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold text-foreground mt-4">Routes</h4>
                    {report.routes.map((r, i) => (
                      <RouteCard key={i} route={r} />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Center - Map */}
          <div className="lg:col-span-5">
            <WorldMap report={report} />
          </div>

          {/* Right - Terms */}
          <div className="lg:col-span-4">
            <NegotiationTerms
              terms={terms}
              totalCost={totalCost}
              executionPlan={report.execution_plan}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
