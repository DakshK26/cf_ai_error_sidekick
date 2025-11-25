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

Setup instructions will be added after Phase 1 when Cloudflare bindings are configured.