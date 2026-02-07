import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import type { SupplierPin } from "@/types/simulation";

interface MapSupplierPanelProps {
  supplier: SupplierPin | null;
  open: boolean;
  onClose: () => void;
}

const MapSupplierPanel = ({ supplier, open, onClose }: MapSupplierPanelProps) => {
  if (!supplier) return null;

  const trustColor =
    supplier.trust_score > 75
      ? "text-emerald-400"
      : supplier.trust_score > 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{supplier.name}</SheetTitle>
          <p className="text-xs text-muted-foreground">{supplier.country} · {supplier.material}</p>
        </SheetHeader>

        {/* Trust score */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Trust Score</span>
            <span className={`text-sm font-bold ${trustColor}`}>{supplier.trust_score}</span>
          </div>
          <Progress value={supplier.trust_score} className="h-2" />
        </div>

        {/* Trust rationale */}
        {supplier.trust_rationale.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">Rationale</p>
            <ul className="space-y-1">
              {supplier.trust_rationale.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance flags */}
        {supplier.compliance_flags.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-destructive">Compliance Flags</p>
            <div className="flex flex-wrap gap-1">
              {supplier.compliance_flags.map((f, i) => (
                <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {supplier.certifications.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">Certifications</p>
            <div className="flex flex-wrap gap-1">
              {supplier.certifications.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-secondary/30 p-3">
            <p className="text-xs text-muted-foreground">Base Price</p>
            <p className="text-sm font-bold text-foreground">
              {supplier.currency} {supplier.base_price?.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3">
            <p className="text-xs text-muted-foreground">Negotiated Price</p>
            <p className="text-sm font-bold text-primary">
              {supplier.currency} {supplier.negotiated_price?.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3">
            <p className="text-xs text-muted-foreground">Lead Time</p>
            <p className="text-sm font-bold text-foreground">{supplier.lead_time_days}d</p>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3">
            <p className="text-xs text-muted-foreground">Negotiated Qty</p>
            <p className="text-sm font-bold text-foreground">{supplier.negotiated_qty?.toLocaleString()}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MapSupplierPanel;
