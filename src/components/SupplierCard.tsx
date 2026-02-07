import { Badge } from "@/components/ui/badge";
import type { DiscoveryPath } from "@/types/simulation";

interface SupplierCardProps {
  supplier: DiscoveryPath;
}

const SupplierCard = ({ supplier }: SupplierCardProps) => {
  const trustColor =
    supplier.trust_score > 75
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : supplier.trust_score > 50
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm text-foreground leading-tight">
          {supplier.identity}
        </h4>
        <Badge className={`shrink-0 ${trustColor}`}>
          {supplier.trust_score}
        </Badge>
      </div>
      <p className="text-xs text-primary font-medium">{supplier.material}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {supplier.rationale}
      </p>
    </div>
  );
};

export default SupplierCard;
