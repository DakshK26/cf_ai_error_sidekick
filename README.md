# cf_ai_error_sidekick

An edge-hosted AI assistant that analyzes logs and error messages using Cloudflare Workers AI, Rust-to-WebAssembly, and retrieval-augmented generation.

## Tech stack

- **Cloudflare Platform**: Workers, Durable Objects, KV, D1, Workflows, Vectorize, Workers AI
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Zustand
- **Performance**: Rust-to-WebAssembly utility for log parsing
- **Infrastructure**: Monorepo with pnpm workspaces, GitHub Actions

## Project structure

- `apps/worker` – Cloudflare Worker API and orchestration
- `apps/frontend` – Next.js chat UI
- `packages/rust_log_parser` – Rust crate compiled to WebAssembly
- `packages/shared` – Shared TypeScript types and utilities

## Getting started

### Prerequisites

- Node.js >= 20
- pnpm (install with `npm install -g pnpm`)
- Cloudflare account with Workers Paid plan
- Wrangler CLI (`npm install -g wrangler`)

### Phase 1: Initial Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Provision Cloudflare services**
   
   Follow the detailed instructions in [`PHASE1_SETUP.md`](./PHASE1_SETUP.md) to:
   - Create KV namespace
   - Create D1 database
   - Create Vectorize index
   - Update `apps/worker/wrangler.toml` with resource IDs

4. **Run the Worker locally**
   ```bash
   cd apps/worker
   pnpm dev
   ```

5. **Run the Frontend locally**
   ```bash
   cd apps/frontend
   pnpm dev
   ```

### Current Status

- ✅ **Phase 0**: Project bootstrap complete
- ✅ **Phase 1**: Cloudflare environment setup complete
- ✅ **Phase 2**: Worker routing & SSE complete
- ⏳ **Phase 3**: D1 session storage
- ⏳ **Phase 3.5**: Cloudflare Agents integration (critical)
- ⏳ **Phase 4-9**: AI, RAG, Frontend, Testing, Documentation

### Available Endpoints

Once the Worker is running (`cd apps/worker && pnpm dev`):

- `GET /` - Root endpoint
- `GET /health` - Health check (returns `{"ok": true}`)
- `GET /ai-test` - Test Workers AI with Llama 3.3
- `POST /api/chat` - Chat endpoint with SSE streaming (fake tokens for now)
- `POST /api/docs/upload` - Document upload placeholder (Phase 7)