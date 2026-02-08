import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, SkipForward } from "lucide-react";
import SupplierCard from "@/components/SupplierCard";
import RouteMap from "@/components/RouteMap";
import NegotiationTerms from "@/components/NegotiationTerms";
import NegotiationChat from "@/components/NegotiationChat";
import SummaryDisplay from "@/components/SummaryDisplay";
import type { SimulationResponse, NegotiationTerm, NegotiationReadyPayload, Port } from "@/types/simulation";

interface ResultsDashboardProps {
  data: SimulationResponse;
  onReset: () => void;
  negotiationMode?: boolean;
  onFinalizeNegotiation?: () => void;
  negotiationReadyData?: NegotiationReadyPayload | null;
}

const ResultsDashboard = ({ data, onReset, negotiationMode = false, onFinalizeNegotiation, negotiationReadyData }: ResultsDashboardProps) => {
  const { report, summary, trace_id } = data;
  const [terms, setTerms] = useState(report.negotiation?.terms ?? []);
  const [totalCost, setTotalCost] = useState(report.negotiation?.total_cost_estimate ?? 0);
  const [showBanner, setShowBanner] = useState(negotiationMode);

  // Sync showBanner when negotiationMode prop changes
  useEffect(() => {
    if (negotiationMode) {
      setShowBanner(true);
    }
  }, [negotiationMode]);

  const handleTermsUpdate = (updatedTerms: NegotiationTerm[]) => {
    setTerms(updatedTerms);
    const newTotal = updatedTerms.reduce((sum, t) => sum + t.subtotal, 0);
    setTotalCost(newTotal);
  };

  const handleSkipNegotiation = () => {
    setShowBanner(false);
    onFinalizeNegotiation?.();
  };

  // Collect all ports
  const allPorts: Port[] = report.world_context?.countries?.flatMap((c) => c.ports ?? []) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-primary shrink-0">Simulation Results</h2>
          <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
            <RotateCcw className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </header>

      {/* Negotiation banner */}
      {showBanner && (
        <div className="bg-primary/10 border-b border-primary/30">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-primary font-medium">
              Initial terms are ready. Negotiate with suppliers below, or skip to finalize.
            </p>
            <Button variant="outline" size="sm" onClick={handleSkipNegotiation} className="shrink-0">
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Negotiation / Finalize
            </Button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="max-w-[1600px] mx-auto w-full px-4 pt-4">
        <SummaryDisplay summary={summary} />
      </div>

      {/* Main grid */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left - Suppliers */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Suppliers & Trust
            </h3>
            <ScrollArea className="h-[calc(100vh-220px)] lg:h-[500px]">
              <div className="space-y-3 pr-2">
                {(report.discovery_paths ?? []).map((s, i) => (
                  <SupplierCard key={i} supplier={s} />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Center - Map */}
          <div className="lg:col-span-5">
            <RouteMap report={report} />
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

        {/* Bottom - Chat */}
        <div className={`mt-4 ${showBanner ? "ring-2 ring-primary/50 rounded-lg" : ""}`}>
          <NegotiationChat
            traceId={trace_id}
            suppliers={report.discovery_paths}
            ports={allPorts}
            onTermsUpdate={handleTermsUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
