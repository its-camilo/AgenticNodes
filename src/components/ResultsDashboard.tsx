import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import SupplierCard from "@/components/SupplierCard";
import RouteMap from "@/components/RouteMap";
import NegotiationTerms from "@/components/NegotiationTerms";
import SummaryDisplay from "@/components/SummaryDisplay";
import type { SimulationResponse } from "@/types/simulation";

interface ResultsDashboardProps {
  data: SimulationResponse;
  onReset: () => void;
}

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
          <Button variant="outline" size="sm" onClick={onReset} className="shrink-0">
            <RotateCcw className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </header>

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
      </div>
    </div>
  );
};

export default ResultsDashboard;
