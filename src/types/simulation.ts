export interface SimulationRequest {
  intent: string;
  buyer_location: string;
  simulate_disruptions: boolean;
  disruptions?: string[];
  constraints?: Record<string, unknown>;
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

// --- Map Data types ---

export interface BuyerPin {
  id: string;
  type: string;
  label: string;
  lat: number;
  lng: number;
  coordinates?: [number, number]; // [lng, lat]
}

export interface PortAgent {
  agent_id: string;
  role: string;
  supplier_id: string;
  status: string;
  negotiation_summary: string;
  eta_days: number;
}

export interface PortConditions {
  issues: string[];
  risk_level: string;
}

export interface PortPin {
  id: string;
  type: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  coordinates?: [number, number]; // [lng, lat]
  agents: PortAgent[];
  conditions: PortConditions;
}

export interface SupplierPin {
  id: string;
  type: string;
  name: string;
  country: string;
  material: string;
  lat: number;
  lng: number;
  coordinates?: [number, number]; // [lng, lat]
  trust_score: number;
  trust_rationale: string[];
  compliance_flags: string[];
  base_price: number;
  currency: string;
  lead_time_days: number;
  certifications: string[];
  negotiated_price: number;
  negotiated_qty: number;
  negotiated_subtotal: number;
}

export interface RouteAgents {
  travel_agent: {
    agent_id: string;
    status: string;
    eta_days: number;
    meeting_port: string;
  };
  port_agents: {
    agent_id: string;
    port: string;
    status: string;
    negotiation_summary: string;
  }[];
}

export interface RouteLine {
  id: string;
  material: string;
  supplier_id: string;
  supplier_name: string;
  from_coords: { lat: number; lng: number };
  to_coords: { lat: number; lng: number };
  waypoints: { name: string; lat: number; lng: number }[];
  polyline?: [number, number][]; // [[lng, lat], ...] complete path
  transit_days: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  status: string;
  agents: RouteAgents;
}

export interface MapData {
  buyer_pin: BuyerPin;
  port_pins: PortPin[];
  supplier_pins: SupplierPin[];
  route_lines: RouteLine[];
}

// --- Report ---

export interface SimulationReport {
  world_context: WorldContext;
  discovery_paths: DiscoveryPath[];
  routes: Route[];
  negotiation: Negotiation;
  execution_plan: ExecutionPlan;
  map_data?: MapData;
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

export interface NegotiationReadyPayload {
  negotiation: Negotiation;
  suppliers: { id: string; name: string; material: string }[];
}

export type AppView = "input" | "loading" | "results";

export const PHASES = [
  "generating_world",
  "discovering_suppliers",
  "planning_routes",
  "negotiating",
  "awaiting_negotiation",
  "complete",
] as const;
