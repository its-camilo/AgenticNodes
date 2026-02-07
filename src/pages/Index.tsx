import { useState, useRef, useCallback } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { toast } from "@/hooks/use-toast";
import { runSimulation, getEventsUrl } from "@/lib/api";
import IntentInput from "@/components/IntentInput";
import LoadingView from "@/components/LoadingView";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AppView, SimulationResponse } from "@/types/simulation";

const Index = () => {
  const [view, setView] = useState<AppView>("input");
  const [currentPhase, setCurrentPhase] = useState("");
  const [phaseMessage, setPhaseMessage] = useState("");
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [negotiationMode, setNegotiationMode] = useState(false);
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
      setNegotiationMode(false);

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
        } catch {}
      });

      // Listen for negotiation_ready event
      sse.addEventListener("negotiation_ready", (event: any) => {
        try {
          const _data = JSON.parse(event.data);
          // The negotiation data will be in the final response; 
          // this event signals we should enter negotiation mode
          setNegotiationMode(true);
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
    setNegotiationMode(false);
  }, []);

  const handleFinalizeNegotiation = useCallback(() => {
    setNegotiationMode(false);
  }, []);

  if (view === "loading") {
    return <LoadingView currentPhase={currentPhase} phaseMessage={phaseMessage} />;
  }

  if (view === "results" && result) {
    return (
      <ResultsDashboard
        data={result}
        onReset={handleReset}
        negotiationMode={negotiationMode}
        onFinalizeNegotiation={handleFinalizeNegotiation}
      />
    );
  }

  return <IntentInput onSubmit={handleSubmit} isLoading={false} />;
};

export default Index;
