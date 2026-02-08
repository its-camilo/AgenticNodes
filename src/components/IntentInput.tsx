import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Anchor, Ship } from "lucide-react";

interface IntentInputProps {
  onSubmit: (intent: string, buyerLocation: string, simulateDisruptions: boolean) => void;
  isLoading: boolean;
}

const IntentInput = ({ onSubmit, isLoading }: IntentInputProps) => {
  const [intent, setIntent] = useState("");
  const [buyerLocation, setBuyerLocation] = useState("United States");
  const [simulateDisruptions, setSimulateDisruptions] = useState(false);

  const handleSubmit = () => {
    if (!intent.trim() || intent.length > 2000) return;
    onSubmit(intent.trim(), buyerLocation.trim() || "United States", simulateDisruptions);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Ship className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Supply Chain AI
            </h1>
            <Anchor className="h-8 w-8 text-accent" />
          </div>
          <p className="text-muted-foreground text-lg">
            Describe your procurement needs and let AI optimize your supply chain
          </p>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-6 shadow-lg">
          <div className="space-y-2">
            <Label htmlFor="intent" className="text-sm font-medium">
              Procurement Request
            </Label>
            <Textarea
              id="intent"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              maxLength={2000}
              placeholder="I need to source lithium-ion battery cells and cobalt for EV batteries in Detroit. Find suppliers in Asia and South America, plan shipping routes, and negotiate pricing for 50,000 units."
              className="min-h-[140px] resize-none bg-secondary/50 text-foreground placeholder:text-muted-foreground"
            />
            {intent.length > 1900 && (
              <p className="text-xs text-muted-foreground text-right" aria-live="polite">
                {intent.length}/2000
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Buyer Location
            </Label>
            <Input
              id="location"
              value={buyerLocation}
              onChange={(e) => setBuyerLocation(e.target.value)}
              placeholder="United States"
              className="bg-secondary/50"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-4">
            <Label htmlFor="disruptions" className="text-sm font-medium cursor-pointer">
              Simulate Disruptions
            </Label>
            <Switch
              id="disruptions"
              checked={simulateDisruptions}
              onCheckedChange={setSimulateDisruptions}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!intent.trim() || intent.length > 2000 || isLoading}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Ship className="h-5 w-5 mr-2" />
            Run Simulation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntentInput;
