# ⚡ ForgeEngine — AI Software Compiler

> **Natural language → Validated, executable application schema**
> Built for the Base44 AI Engineer Internship challenge.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange)](https://groq.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 What is ForgeEngine?

ForgeEngine is a **deterministic AI compiler** that transforms natural language software requirements into a strict, cross-layer validated, executable application configuration — in seconds.

Think of it as a **compiler pipeline**, not a prompt-engineering tool:

```
"Build a CRM with login, contacts, and admin analytics"
              ↓  ForgeEngine  ↓
{
  ui:   { pages, components, roles }
  api:  { endpoints, methods, payloads }
  db:   { tables, columns, relations }
  auth: { strategy, roles, permissions }
}
```

---

## 🔧 Architecture

### Pipeline Stages

| Stage | Description |
|-------|-------------|
| **Stage 1 — Intent Extraction** | Parses natural language into structured product intent (type, features, users, complexity) |
| **Stage 2 — Architecture Design** | Designs system architecture: entities, pages, roles |
| **Stage 3 — Schema Synthesis** | Generates full AppConfig: UI + API + DB + Auth schemas |
| **Stage 4 — Validation** | Cross-layer consistency engine checks role mapping, endpoint-table alignment |
| **Stage 5 — Repair** | LLM surgical patching (1–3 cycles in Balanced/Production mode) |
| **Stage 6 — Emission** | Final validated config emitted + rendered in live Runtime Preview |

### Tech Stack

- **LLM**: Groq API (`llama-3.3-70b-versatile`) via direct `groq-sdk` (JSON Object mode)
- **Framework**: Next.js 16 + React 19 (App Router, Server Actions)
- **Validation**: Zod schemas + custom cross-layer rule engine
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Runtime**: In-browser live app simulator with real form state management

---

## 🚀 Features

### ✅ Compiler Pipeline
- 3-stage LLM compilation with deterministic schema mapping
- Zod-validated output at every stage
- Cross-layer consistency rules (UI roles ↔ Auth, API paths ↔ DB tables)

### ✅ Repair Engine
- Detects schema drift and logical inconsistencies
- Performs targeted LLM repairs (up to 3 cycles)
- Reports repair cycle count in the UI

### ✅ Live Runtime Preview
- Fully interactive UI simulator — forms actually save data
- Tables update in real-time after form submissions
- Delete rows with hover trash icon
- Toast notifications on every action
- API call log shows simulated POST requests
- DB Inspector shows live row counts and data
- Role switcher changes page visibility instantly

### ✅ Professional UI
- Documentation modal with full pipeline breakdown
- Architecture modal with system diagram
- Evaluation Test Suite (4 hardcoded cases, auto-compile on click)
- Compiler stdout log with color-coded stage output
- AST viewer with 4 tabs (ui / api / db / auth)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API Key](https://console.groq.com/keys)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/bnssaanirudh/ForgeEngine.git
cd ForgeEngine

# 2. Install dependencies
npm install

# 3. Set up environment
echo "GROQ_API_KEY=your_groq_api_key_here" > .env.local

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📦 Deployment (Vercel)

```bash
# Push to GitHub, then in Vercel:
# 1. Import your GitHub repo
# 2. Set Environment Variable: GROQ_API_KEY = your_key
# 3. Deploy — zero config needed
```

Or use the Vercel CLI:
```bash
npx vercel --prod
```

> ⚠️ **Important**: The `GROQ_API_KEY` must be set as an Environment Variable in Vercel's project settings. Never commit `.env.local`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Entry point
├── components/
│   ├── Dashboard.tsx        # Main compiler UI + modals
│   ├── RuntimeRenderer.tsx  # Live app preview with working forms
│   └── JsonViewer.tsx       # Monaco editor for AST display
├── services/
│   ├── compiler.ts          # Server Action orchestrator
│   ├── llm.ts               # Groq SDK integration (3-stage pipeline)
│   ├── validator.ts         # Cross-layer consistency rules
│   └── repair.ts            # LLM repair engine
└── types/
    └── schema.ts            # Zod schemas for all layers
```

---

## 🧪 Evaluation Test Suite

ForgeEngine includes 4 built-in test cases:

1. **CRM** — Login, contacts, dashboard, role-based access
2. **Restaurant POS** — Tables, orders, kitchen view
3. **Hospital System** — Doctor and nurse roles
4. **Edge Case** — No login with role-based permissions (tests repair engine)

Click any test case on the home screen to auto-compile it.

---

## 🏗️ Design Decisions

### Why Groq SDK directly (not Vercel AI SDK)?
The `@ai-sdk/groq` package forces `json_schema` response format in `generateObject()`, which most Groq models don't support. We use the native `groq-sdk` with `response_format: { type: 'json_object' }` which gives us full control and works with all models.

### Why 3-stage LLM pipeline?
Breaking compilation into Intent → Architecture → Schema improves reliability. Each stage has a focused, simpler task, leading to much higher schema consistency than a single monolithic prompt.

### Why Zod for validation?
Zod gives us runtime type safety and clear error messages, making the repair engine's job precise — it knows exactly which field in which layer is invalid.

---

## 📝 License

MIT License — Built for educational/internship purposes.

---

*ForgeEngine — Compile intent. Engineer reliability.*
