# CognitiveCompiler

**Multi-Stage Application Compiler with Runtime Repair Engine**

A system that behaves like a software compiler, translating open-ended natural language into executable, strictly-typed application configurations. Instead of relying on single-shot prompt engineering, the system utilizes a **Multi-Stage Generation Pipeline** (Intent → Architecture → Schema Synthesis → Refinement).

## Features

- **Multi-Stage Generation Pipeline**: Breaks the generation into discrete, controllable stages.
- **Strict Schema Enforcement**: UI, API, DB, and Auth layers have strict contracts.
- **Validation & Repair Engine (CORE)**: Detects schema mismatches (e.g., UI referencing a non-existent API endpoint) and intelligently patches them without blindly retrying.
- **Execution Awareness**: Outputs a verified Abstract Syntax Tree (AST) that is immediately executed by an integrated `RuntimeRenderer` to prove usability.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the compiler in action.

## Current State & Next Steps

- The current pipeline utilizes a **Mock LLM** for deterministic execution demonstration.
- **Evaluation Suite**: An initial UI evaluation suite is built-in with 5 edge cases.
