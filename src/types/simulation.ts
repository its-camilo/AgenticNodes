export interface SimulationRequest {
  intent: string;
  buyer_location: string;
  simulate_disruptions: boolean;
}

export interface PhaseEvent {
  type: "phase";
  trace_id: string;
  phase: string;
  message: string;
}

export interface Port {
  name: string;
  lat: number;
  lng: number;
}

export interface Country {
  name: string;
  ports: Port[];
}

export interface WorldContext {
  buyer_coordinates: { lat: number; lng: number };
  countries: Country[];
}

export interface DiscoveryPath {
  identity: string;
  material: string;
  trust_score: number;
  rationale: string;
  lat?: number;
  lng?: number;
}

export interface Route {
  from: string;
  to: string;
  ports: string[];
  transit_days: number;
  risk_score: number;
}

export interface NegotiationTerm {
  material: string;
  supplier_id: string;
  qty: number;
  unit_price_est: number;
  subtotal: number;
  currency: string;
  lead_time_days: number;
}

export interface Negotiation {
  terms: NegotiationTerm[];
  total_cost_estimate: number;
}

export interface ExecutionPlan {
  timeline_days: number;
  risk_score: number;
}

export interface SimulationReport {
  world_context: WorldContext;
  discovery_paths: DiscoveryPath[];
  routes: Route[];
  negotiation: Negotiation;
  execution_plan: ExecutionPlan;
}

export interface SimulationResponse {
  trace_id: string;
  report: SimulationReport;
  summary: string;
}

export interface NegotiateRequest {
  message: string;
  supplier_id: string | null;
  port: string | null;
}

export interface ChatMessage {
  role: "user" | "agent";
  content: string;
}

export interface NegotiateResponse {
  trace_id: string;
  agent_reply: string;
  updated_terms: NegotiationTerm[] | null;
  negotiation_history: ChatMessage[];
}

export type AppView = "input" | "loading" | "results";

export const PHASES = [
  "generating_world",
  "discovering_suppliers",
  "planning_routes",
  "negotiating",
  "complete",
] as const;
