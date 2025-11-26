# PROMPTS
This file tracks system prompts and AI-assisted coding prompts used during development. The file was tracked with the help of Github Copilot with context provided by me.

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

### Phase 3: D1 Session and Message Persistence

**Prompt**: "Create a D1 schema with sessions and messages tables including foreign keys and indexes. Build a SessionRepository class that handles session creation, last-active updates, message persistence, and retrieval with proper chronological ordering. Update the chat handler to parse ChatRequest bodies, persist user and assistant messages to D1, and return sessionId in the SSE stream."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-25
- **Context**: I designed the database schema to support multi-turn conversations with proper session tracking. The SessionRepository pattern was architected to be reusable by the Cloudflare Agent in Phase 3.5, providing a clean data access layer that abstracts D1 operations. I ensured the session creation logic handles both new and existing sessions gracefully.

**Debug Prompt**: "The SessionRepository.saveMessage is failing with a foreign key constraint error. Add an ensureSession method that creates the session if it doesn't exist, and call it before saving messages in the ErrorAgent."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: Discovered during Phase 5 integration that D1 was throwing FOREIGN KEY constraint failures when messages were saved before their session existed. I designed the ensureSession pattern to gracefully handle session creation with INSERT OR IGNORE.

---

### Phase 3.5: Cloudflare Agents Integration

**Prompt**: "Install the @cloudflare/agents SDK and create an ErrorAgent class extending the Agent base class. Implement WebSocket upgrade handling in the fetch method, webSocketMessage handler for incoming user messages, and initial state management using ctx.storage. Add a route /agent/connect/:sessionId and /api/agent/session endpoint that generates UUIDs and returns WebSocket connection URLs."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: After researching the Cloudflare Agents SDK documentation, I architected the agent system to use Durable Objects for persistent WebSocket connections. I designed the WebSocket message flow to eventually integrate with the RAG pipeline and LLM streaming. The state management pattern was chosen to support both in-memory (Durable Object storage) and persistent (D1) conversation history.

---

### Phase 4: Rust WASM Log Parser

**Prompt**: "Create a Rust library crate that compiles to WASM using wasm-bindgen. Implement a parse_log function that takes a log string, uses regex to extract timestamp/severity/message fields, and returns a structured ParsedLog JSON. Set up the Cargo.toml with wasm32-unknown-unknown target and wasm-bindgen dependency. Generate TypeScript bindings and integrate the WASM module into the Worker with proper initialization."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: I designed the log parsing architecture to leverage Rust's performance for regex-heavy operations at the edge. The WASM module was structured as a reusable library that can be extended with more complex parsing logic. I ensured the TypeScript integration used a singleton initialization pattern to avoid re-compiling the WASM module on every request, which is critical for Worker performance.

**Debug Prompt**: "Getting deprecation warning 'Passing an object to `wasm_bindgen::init` is deprecated'. Update the init call in logParser.ts to use the new {module_or_path: wasmBinary} format."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: After deployment, wrangler showed a deprecation warning for the WASM initialization pattern. I updated the code to match the new wasm-bindgen API while maintaining the singleton pattern.

---

### Phase 5: Full AI Pipeline with RAG

**Prompt**: "Create ai.ts with embedText (handling multiple Workers AI response formats) and chatWithLlmStream (using ReadableStream with SSE parsing). Build vectorStore.ts with upsertDocuments and querySimilar functions. Update ErrorAgent to integrate the full pipeline: parse logs with WASM, retrieve context from Vectorize using embeddings, construct prompt with system message and RAG context, stream LLM tokens over WebSocket, and persist conversation to D1. Handle the Workers AI streaming response format that returns SSE data chunks."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: I architected the complete RAG pipeline after analyzing Workers AI's streaming response format and Vectorize API patterns. The design separates concerns: ai.ts for Workers AI interactions, vectorStore.ts for Vectorize operations, and ErrorAgent as the orchestration layer. I debugged the SSE parsing after discovering Workers AI returns streaming responses in Server-Sent Events format rather than simple JSON chunks. The integration ensures RAG context is retrieved before LLM generation, and all messages are persisted with proper session management including ensureSession to prevent foreign key violations.

**Debug Prompt**: "embedText is throwing 'undefined is not iterable' errors. The Workers AI bge-base-en-v1.5 model returns different response formats - sometimes array of arrays, sometimes objects with 'values' or 'embedding' properties. Update embedText to handle all these formats."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: Discovered that Workers AI embedding responses vary by model version. I added format detection logic to handle both legacy and new response structures, ensuring backward compatibility.

**Debug Prompt**: "WebSocket connects successfully and sends [Done] event, but fullResponse.length is 0 - no tokens are being streamed. The LLM is returning 0 tokens according to wrangler tail logs. Workers AI streaming returns ReadableStream with SSE format 'data: {\"response\":\"token\"}\n\n'. Update chatWithLlmStream to use getReader(), parse SSE lines, extract the 'response' field from JSON, and handle the [DONE] marker."

- **Tool**: GitHub Copilot
- **Date**: 2025-11-26
- **Context**: After testing the deployed Worker, I discovered Workers AI uses Server-Sent Events format for streaming rather than simple JSON chunks. I designed a buffered line-by-line parser that handles incomplete chunks and extracts clean tokens from the SSE data field, which finally enabled real-time streaming to work correctly.

---

*More prompts will be added as development progresses through each phase.*
