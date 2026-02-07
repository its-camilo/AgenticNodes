import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RouteLine } from "@/types/simulation";

interface MapRoutePopupProps {
  route: RouteLine | null;
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

const MapRoutePopup = ({ route, open, onClose }: MapRoutePopupProps) => {
  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Route: {route.supplier_name} {riskBadge(route.risk_level)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Material:</span> <span className="text-foreground font-medium">{route.material}</span></div>
            <div><span className="text-muted-foreground">Transit:</span> <span className="text-foreground font-medium">{route.transit_days}d</span></div>
            <div><span className="text-muted-foreground">Risk Score:</span> <span className="text-foreground font-medium">{(route.risk_score * 100).toFixed(0)}%</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="text-foreground font-medium">{route.status}</span></div>
          </div>

          {route.agents.travel_agent && (
            <div className="rounded bg-secondary/30 p-2">
              <p className="font-semibold text-foreground mb-1">Travel Agent</p>
              <p className="text-muted-foreground">
                {route.agents.travel_agent.agent_id} — {route.agents.travel_agent.status} · 
                ETA {route.agents.travel_agent.eta_days}d · Meeting at {route.agents.travel_agent.meeting_port}
              </p>
            </div>
          )}

          {route.agents.port_agents.length > 0 && (
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Port Agents</p>
              {route.agents.port_agents.map((pa, i) => (
                <div key={i} className="rounded bg-secondary/30 p-2 text-muted-foreground">
                  <span className="font-medium text-foreground">{pa.port}</span>: {pa.status}
                  {pa.negotiation_summary && <> — {pa.negotiation_summary}</>}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapRoutePopup;
