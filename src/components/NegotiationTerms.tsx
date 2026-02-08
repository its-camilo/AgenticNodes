import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NegotiationTerm, ExecutionPlan } from "@/types/simulation";

interface NegotiationTermsProps {
  terms: NegotiationTerm[];
  totalCost: number;
  executionPlan: ExecutionPlan;
}

const NegotiationTerms = ({ terms, totalCost, executionPlan }: NegotiationTermsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Negotiation Terms</h3>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs">Material</TableHead>
              <TableHead className="text-xs">Qty</TableHead>
              <TableHead className="text-xs">Unit Price</TableHead>
              <TableHead className="text-xs">Subtotal</TableHead>
              <TableHead className="text-xs">Lead Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(terms ?? []).map((t, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{t.material}</TableCell>
                <TableCell className="text-xs">{t.qty.toLocaleString()}</TableCell>
                <TableCell className="text-xs">
                  {t.currency} {t.unit_price_est.toFixed(2)}
                </TableCell>
                <TableCell className="text-xs">
                  {t.currency} {t.subtotal.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">{t.lead_time_days}d</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="text-lg font-bold text-primary">
            ${totalCost.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground">Timeline</p>
          <p className="text-lg font-bold text-foreground">
            {executionPlan.timeline_days}d
          </p>
          <p className="text-xs text-muted-foreground">
            Risk: {(executionPlan.risk_score * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationTerms;
