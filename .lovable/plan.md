

# Supply Chain AI Simulation Platform

A single-page React app that lets users run AI-powered supply chain simulations, visualize routes on a world map, and negotiate with an AI agent — all connected to a FastAPI backend.

## Design Theme
- **Dark theme** with blue/teal accents evoking a maritime/logistics feel
- Clean dashboard aesthetic, fully responsive for mobile

---

## View 1: Home / Intent Input
- Centered layout with a large text area for natural-language procurement requests
- "Buyer Location" text input (defaults to "United States")
- "Simulate Disruptions" toggle switch
- "Run Simulation" button that POSTs to `/process-intent`
- Example placeholder text to guide users

## View 2: Loading / Ship Animation
- **SSE connects FIRST** (before the POST) using `event-source-polyfill` with custom header `ngrok-skip-browser-warning: true`, so no phase events are missed
- Once SSE is open, fire the POST to `/process-intent` with a **5-minute timeout (300000ms)** via AbortController
- Show "Simulation in progress, this may take a few minutes..." message while waiting
- Displays the current phase message as it progresses through: generating world → discovering suppliers → planning routes → negotiating → complete
- Animated SVG world map with pulsing buyer pin and animated dotted route lines / ship icons that progress with each phase
- **Disconnect SSE** when the `/process-intent` response arrives (or on error/timeout)
- Transitions to the Results view when the API response arrives

## View 3: Results Dashboard
- **Top bar:** English summary text from the response
- **Left panel — Suppliers & Trust:** Card list showing supplier name, material, trust score (color-coded badge: green >75, yellow >50, red ≤50), and rationale
- **Center panel — Interactive Map:** World map (using react-simple-maps) with buyer pin, port pins, supplier pins, and animated route lines color-coded by risk (green/yellow/red)
- **Right panel — Negotiation Terms:** Table of materials, quantities, pricing, lead times, plus total cost and execution plan summary
- **Bottom section — Negotiation Chat:** Chat interface to negotiate with the AI agent, with optional supplier/port dropdowns. POSTs to `/process-intent/{trace_id}/negotiate`. Shows conversation history and live-updates the terms table when updated terms are returned.

## Global / Cross-cutting
- `VITE_API_URL` environment variable for configurable backend URL (default `http://localhost:8000`)
- **All fetch/API requests include the header `ngrok-skip-browser-warning: true`**
- **SSE uses `event-source-polyfill`** (new dependency) instead of native EventSource to support custom headers
- Toast notifications for API errors (including timeout)
- All state managed client-side (single-page app with state transitions)

