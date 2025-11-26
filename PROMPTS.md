# PROMPTS

This file tracks system prompts and AI-assisted coding prompts used during development.

## System prompts

- To be added in the AI integration phase (Phase 5).

## Development prompts

Record of key prompts used to coordinate AI assistance during the build process.

### Phase 0: Project Bootstrap

**Prompt**: "I need to structure a monorepo for a Cloudflare Workers project with Next.js frontend, Rust WASM module, and shared TypeScript types. Create the initial folder structure with proper TypeScript configurations extending a base config, and set up pnpm workspaces."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-24
- **Context**: Setting up the foundational architecture. I designed the phase-by-phase development approach and defined all technical requirements, then had AI help scaffold the boilerplate.

---

### Phase 0: TypeScript Configuration Strategy

**Prompt**: "Generate a base TypeScript config that can be extended by both Cloudflare Workers (with Workers types) and Next.js (with DOM types), ensuring strict mode and modern ES2022 features."

- **Tool**: GitHub Copilot  
- **Date**: 2025-11-24
- **Context**: I outlined the requirements for cross-environment TypeScript compatibility after analyzing the architectural constraints of running code on both edge and client.

---

### Phase 1: Cloudflare Bindings Configuration

**Prompt**: "Create a complete wrangler.toml configuration with bindings for KV, D1, Vectorize, Workers AI, and Workflows. Include TypeScript type definitions for all bindings and build a verification utility that checks binding availability at runtime."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-25
- **Context**: After manually provisioning the Cloudflare services through the dashboard, I designed the binding architecture and had AI generate the type-safe configuration layer. I specified the exact model names and binding structure based on my infrastructure planning.

---

### Phase 2: Worker Routing and SSE Infrastructure

**Prompt**: "Build a clean routing system for the Cloudflare Worker with pattern-based URL matching. Implement Server-Sent Events utilities for streaming responses. Create handler functions for /health, /api/chat with fake token streaming, and /api/docs/upload placeholder. Structure the code with separation of concerns - router, handlers, SSE utils, and types."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-25
- **Context**: I architected the routing layer to prepare for Phase 3.5 Agent integration. The SSE implementation was designed to support real-time LLM streaming that will be added later. I structured the handlers to be easily replaceable when we wire in the actual Cloudflare Agent and RAG pipeline.

---

*More prompts will be added as development progresses through each phase.*
