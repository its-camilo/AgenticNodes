import type { SimulationRequest, SimulationResponse } from "@/types/simulation";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

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

export function getEventsUrl(): string {
  return `${API_URL}/events`;
}
