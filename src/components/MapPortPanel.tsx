import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { PortPin } from "@/types/simulation";

interface MapPortPanelProps {
  port: PortPin | null;
  open: boolean;
  onClose: () => void;
}

const riskBadge = (level: string) => {
  const cls =
    level === "low"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : level === "medium"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";
  return <Badge className={cls}>{level}</Badge>;
};

const MapPortPanel = ({ port, open, onClose }: MapPortPanelProps) => {
  if (!port) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {port.name} {riskBadge(port.conditions.risk_level)}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">{port.country}</p>
        </SheetHeader>

        {port.conditions.issues.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold text-destructive">Issues</p>
            <ul className="space-y-1">
              {port.conditions.issues.map((issue, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold text-foreground mb-2">Agents at Port</p>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Supplier</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {port.agents.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{a.role}</TableCell>
                    <TableCell className="text-xs">{a.supplier_id}</TableCell>
                    <TableCell className="text-xs">{a.status}</TableCell>
                    <TableCell className="text-xs">{a.eta_days}d</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {port.agents.some((a) => a.negotiation_summary) && (
            <div className="mt-3 space-y-2">
              {port.agents
                .filter((a) => a.negotiation_summary)
                .map((a, i) => (
                  <div key={i} className="text-xs text-muted-foreground rounded bg-secondary/30 p-2">
                    <span className="font-medium text-foreground">{a.role}:</span> {a.negotiation_summary}
                  </div>
                ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MapPortPanel;
