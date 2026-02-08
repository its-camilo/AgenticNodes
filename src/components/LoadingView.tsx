import { PHASES } from "@/types/simulation";

const PHASE_LABELS: Record<string, string> = {
  generating_world: "Analyzing demand...",
  discovering_suppliers: "Validating suppliers...",
  planning_routes: "Agents traveling to ports...",
  negotiating: "Agents negotiating with suppliers...",
  complete: "Complete",
};

interface LoadingViewProps {
  currentPhase: string;
  phaseMessage: string;
}

const LoadingView = ({ currentPhase, phaseMessage }: LoadingViewProps) => {
  const phaseIndex = PHASES.indexOf(currentPhase as typeof PHASES[number]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 gap-8">
      <div className="text-center space-y-3 max-w-lg">
        <h2 className="text-2xl font-bold text-foreground">
          Simulation in progress
        </h2>
        <p className="text-muted-foreground">
          This may take a few minutes...
        </p>
        <p className="text-primary font-medium text-lg min-h-[1.75rem]">
          {phaseMessage || "Connecting..."}
        </p>
      </div>

      {/* Phase progress indicators */}
      <div className="flex gap-2 flex-wrap justify-center">
        {PHASES.map((phase, i) => (
          <div
            key={phase}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              i < phaseIndex
                ? "bg-primary/20 text-primary"
                : i === phaseIndex
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {PHASE_LABELS[phase]}
          </div>
        ))}
      </div>

      {/* Animated SVG World Map */}
      <div className="w-full max-w-3xl">
        <svg viewBox="0 0 800 400" className="w-full h-auto">
          <rect width="800" height="400" fill="#0a1628" rx="12" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#1a2540" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#1a2540" strokeWidth="0.5" />
          ))}

          {/* Simplified continents */}
          <path d="M120,80 L180,60 L220,80 L230,120 L210,160 L200,200 L180,220 L150,200 L130,170 L110,130 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />
          <path d="M190,230 L220,220 L240,250 L250,300 L230,340 L210,360 L190,340 L180,300 L175,260 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />
          <path d="M370,70 L420,60 L440,80 L430,110 L410,130 L380,120 L360,100 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />
          <path d="M380,150 L430,140 L450,180 L460,230 L440,290 L420,320 L390,300 L370,260 L360,200 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />
          <path d="M450,60 L550,50 L650,70 L700,100 L680,140 L640,160 L580,170 L520,150 L480,130 L450,100 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />
          <path d="M620,260 L680,250 L710,280 L700,310 L660,320 L630,300 Z" fill="#1a2540" stroke="#2a3a5c" strokeWidth="0.5" opacity="0.6" />

          {/* Animated route lines */}
          {phaseIndex >= 2 && (
            <>
              <line x1="200" y1="150" x2="600" y2="130" stroke="hsl(130, 50%, 45%)" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" opacity="0.8" />
              <line x1="200" y1="150" x2="420" y2="200" stroke="hsl(45, 80%, 55%)" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" opacity="0.8" />
              <line x1="600" y1="130" x2="420" y2="200" stroke="hsl(0, 70%, 50%)" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" opacity="0.6" />
            </>
          )}

          {/* Buyer pin */}
          <circle cx="200" cy="150" r="6" fill="hsl(190, 70%, 50%)" className="animate-pulse-glow" />
          <circle cx="200" cy="150" r="3" fill="hsl(200, 20%, 92%)" />

          {/* Supplier pins */}
          {phaseIndex >= 1 && (
            <>
              <circle cx="600" cy="130" r="5" fill="hsl(130, 50%, 45%)" opacity="0.9" />
              <circle cx="600" cy="130" r="2.5" fill="hsl(200, 20%, 92%)" />
              <circle cx="650" cy="100" r="5" fill="hsl(130, 50%, 45%)" opacity="0.9" />
              <circle cx="650" cy="100" r="2.5" fill="hsl(200, 20%, 92%)" />
              <circle cx="220" cy="280" r="5" fill="hsl(130, 50%, 45%)" opacity="0.9" />
              <circle cx="220" cy="280" r="2.5" fill="hsl(200, 20%, 92%)" />
            </>
          )}

          {/* Ships */}
          {phaseIndex >= 2 && (
            <>
              <text x="400" y="135" fontSize="16" textAnchor="middle" className="animate-pulse">🚢</text>
              <text x="310" y="180" fontSize="16" textAnchor="middle" className="animate-pulse">🚢</text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default LoadingView;
