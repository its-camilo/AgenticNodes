import { useState, useRef, useCallback } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { toast } from "@/hooks/use-toast";
import { runSimulation, getEventsUrl } from "@/lib/api";
import IntentInput from "@/components/IntentInput";
import LoadingView from "@/components/LoadingView";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AppView, SimulationResponse } from "@/types/simulation";
import type { EvaluatedRoute } from "@/components/LoadingView";

const Index = () => {
  const [view, setView] = useState<AppView>("input");
  const [currentPhase, setCurrentPhase] = useState("");
  const [phaseMessage, setPhaseMessage] = useState("");
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [evaluatedRoutes, setEvaluatedRoutes] = useState<EvaluatedRoute[]>([]);
  const sseRef = useRef<EventSourcePolyfill | null>(null);

  const closeSse = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(
    async (intent: string, buyerLocation: string, simulateDisruptions: boolean) => {
      setView("loading");
      setCurrentPhase("");
      setPhaseMessage("Connecting...");
      setEvaluatedRoutes([]);

      // 1. Connect SSE FIRST
      const sse = new EventSourcePolyfill(getEventsUrl(), {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      sseRef.current = sse;

      sse.addEventListener("phase", (event: any) => {
        try {
          const data = JSON.parse(event.data);
          setCurrentPhase(data.phase);
          setPhaseMessage(data.message);

          // Extract evaluated routes if the phase event carries them
          if (data.evaluated_routes) {
            setEvaluatedRoutes((prev) => [...prev, ...data.evaluated_routes]);
          }
        } catch {}
      });

      sse.addEventListener("route_eval", (event: any) => {
        try {
          const data = JSON.parse(event.data);
          if (data.from && data.to) {
            setEvaluatedRoutes((prev) => [
              ...prev,
              {
                from: [data.from.lng, data.from.lat] as [number, number],
                to: [data.to.lng, data.to.lat] as [number, number],
                label: data.label || "",
                status: data.status || "evaluating",
              },
            ]);
          }
        } catch {}
      });

      sse.onerror = () => {
        // SSE errors are common during reconnect; ignore silently
      };

      // 2. Fire POST with 5-minute timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000);

      try {
        const response = await runSimulation(
          { intent, buyer_location: buyerLocation, simulate_disruptions: simulateDisruptions },
          controller.signal
        );
        clearTimeout(timeout);
        closeSse();
        setResult(response);
        setView("results");
      } catch (err: any) {
        clearTimeout(timeout);
        closeSse();
        setView("input");
        const message =
          err.name === "AbortError"
            ? "Simulation timed out after 5 minutes. Please try again."
            : err.message || "An error occurred";
        toast({ title: "Simulation Error", description: message, variant: "destructive" });
      }
    },
    [closeSse]
  );

  const handleReset = useCallback(() => {
    setView("input");
    setResult(null);
    setCurrentPhase("");
    setPhaseMessage("");
    setEvaluatedRoutes([]);
  }, []);

  if (view === "loading") {
    return (
      <LoadingView
        currentPhase={currentPhase}
        phaseMessage={phaseMessage}
        evaluatedRoutes={evaluatedRoutes}
      />
    );
  }

  if (view === "results" && result) {
    return (
      <ResultsDashboard
        data={result}
        onReset={handleReset}
      />
    );
  }

  return <IntentInput onSubmit={handleSubmit} isLoading={view === "loading"} />;
};

export default Index;
