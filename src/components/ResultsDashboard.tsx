import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import SupplierCard from "@/components/SupplierCard";
import RouteMap from "@/components/RouteMap";
import NegotiationTerms from "@/components/NegotiationTerms";
import NegotiationChat from "@/components/NegotiationChat";
import type { SimulationResponse, NegotiationTerm, Port } from "@/types/simulation";

interface ResultsDashboardProps {
  data: SimulationResponse;
  onReset: () => void;
}

const ResultsDashboard = ({ data, onReset }: ResultsDashboardProps) => {
  const { report, summary, trace_id } = data;
  const [terms, setTerms] = useState(report.negotiation.terms);
  const [totalCost, setTotalCost] = useState(report.negotiation.total_cost_estimate);

  const handleTermsUpdate = (updatedTerms: NegotiationTerm[]) => {
    setTerms(updatedTerms);
    const newTotal = updatedTerms.reduce((sum, t) => sum + t.subtotal, 0);
    setTotalCost(newTotal);
  };

  // Collect all ports
  const allPorts: Port[] = report.world_context.countries.flatMap((c) => c.ports);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-start justify-between gap-4">
          <p className="text-sm text-foreground leading-relaxed flex-1">
            {summary}
          </p>
          <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
            <RotateCcw className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </header>

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
                {report.discovery_paths.map((s, i) => (
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
        <div className="mt-4">
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
