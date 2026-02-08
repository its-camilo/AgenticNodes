# ⚓ Agentic Nodes

**AI-powered supply chain simulation platform.** Describe your procurement needs in natural language and let autonomous agents discover suppliers, plan shipping routes, negotiate pricing, and build execution plans — all in real time.

## ✨ Features

- **Natural Language Input** — Describe what you need to procure and where you are located; the system handles the rest.
- **Multi-Phase Simulation** — Watch the pipeline progress through world generation, supplier discovery, route planning, negotiation, and execution planning.
- **Live Map Visualization** — An interactive world map shows evaluated routes, supplier locations, ports, and buyer position as the simulation runs.
- **Supplier Trust Scoring** — Each supplier is evaluated with a trust score, rationale, certifications, and compliance flags.
- **Route Risk Analysis** — Shipping routes are scored by transit time, risk level, and port conditions.
- **Negotiation Dashboard** — View negotiated terms including unit price, quantity, subtotals, lead times, and total cost estimates.
- **Execution Plan** — A step-by-step timeline with overall risk scoring.
- **Disruption Simulation** — Toggle simulated disruptions to stress-test the supply chain.

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Maps** | [React Simple Maps](https://www.react-simple-maps.io/) · [React Leaflet](https://react-leaflet.js.org/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **State / Data** | [TanStack React Query](https://tanstack.com/query) · [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |

## 🏗 Architecture

```
User ──▶ IntentInput (natural language + location + disruptions toggle)
              │
              ▼
         POST /process-intent  ──────────────────▶  Backend API
              │                                         │
              │  SSE /events ◀──────────────────────────┘
              │   (phase updates + evaluated routes)
              ▼
         LoadingView (live world map + phase progress)
              │
              ▼
         ResultsDashboard
           ├── Supplier Cards + Trust Logic
           ├── Interactive Map (routes, ports, suppliers)
           └── Negotiation Terms + Execution Plan
```

The frontend connects to a backend API via:
- **REST** (`POST /process-intent`) — starts the simulation and returns the full report.
- **SSE** (`GET /events`) — streams real-time phase updates and route evaluations while the simulation runs.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18 (recommended: install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm (included with Node.js)

### Installation

```sh
# Clone the repository
git clone https://github.com/its-camilo/agentic-nodes.git
cd agentic-nodes

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Environment Variables

Create a `.env.local` file in the project root to configure the backend API URL:

```env
VITE_API_URL=http://localhost:8000
```

If not set, the app defaults to `http://localhost:8000`.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## 📁 Project Structure

```
src/
├── components/
│   ├── IntentInput.tsx          # Procurement request form
│   ├── LoadingView.tsx          # Simulation progress + live map
│   ├── ResultsDashboard.tsx     # Final results layout
│   ├── WorldMap.tsx             # Interactive Leaflet map
│   ├── RouteMap.tsx             # Route visualization
│   ├── SupplierCard.tsx         # Supplier info card
│   ├── NegotiationTerms.tsx     # Negotiation terms table
│   ├── SummaryDisplay.tsx       # AI-generated summary
│   ├── MapPortPanel.tsx         # Port details panel
│   ├── MapSupplierPanel.tsx     # Supplier details panel
│   ├── MapRoutePopup.tsx        # Route popup on map
│   └── ui/                     # shadcn/ui primitives
├── hooks/                       # Custom React hooks
├── lib/
│   ├── api.ts                   # Backend API client
│   └── utils.ts                 # Utility functions
├── pages/
│   ├── Index.tsx                # Main page (simulation flow)
│   └── NotFound.tsx             # 404 page
├── test/                        # Test files
└── types/
    └── simulation.ts            # TypeScript type definitions
```
