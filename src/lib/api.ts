import type { SimulationRequest, SimulationResponse, NegotiateRequest, NegotiateResponse } from "@/types/simulation";

const API_URL = import.meta.env.VITE_API_URL || "https:\ladonna-isotheral-accustomedly.ngrok-free.dev";

const HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

export async function runSimulation(request: SimulationRequest, signal: AbortSignal): Promise<SimulationResponse> {
  const res = await fetch(`${API_URL}/process-intent`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(request),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Simulation failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function negotiate(traceId: string, request: NegotiateRequest): Promise<NegotiateResponse> {
  const res = await fetch(`${API_URL}/process-intent/${traceId}/negotiate`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Negotiation failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function getEventsUrl(): string {
  return `${API_URL}/events`;
}
