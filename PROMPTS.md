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

*More prompts will be added as development progresses through each phase.*
