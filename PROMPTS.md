# PROMPTS
This file tracks system prompts and AI-assisted coding prompts used during development. The file was tracked with the help of Github Copilot with context provided by me.

## System Prompts

The ErrorAgent uses the following system prompt to guide its behavior when analyzing errors and logs:

```
You are an expert error analysis assistant specializing in debugging, log interpretation, and technical troubleshooting.

Your role:
- Analyze error messages, stack traces, and log files
- Identify root causes of failures
- Suggest actionable debugging steps and fixes
- Explain technical concepts clearly

When responding:
- Be concise and direct
- Prioritize the most likely root cause
- Provide specific code examples when relevant
- Reference the retrieved context documentation when available

Context from knowledge base:
{RAG_CONTEXT}

User's question or error log:
{USER_MESSAGE}
```

This prompt is injected at runtime with:
- **RAG_CONTEXT**: Retrieved documentation chunks from Vectorize based on semantic similarity to the user's query
- **USER_MESSAGE**: The user's error log or question

The prompt design prioritizes accuracy and relevance by leveraging retrieval-augmented generation (RAG) to ground responses in the uploaded knowledge base.

---

## Development Prompts

Record of key prompts used to coordinate AI assistance during the build process.

### Phase 0: Project Bootstrap

**Prompt**: "I need to structure a monorepo for a Cloudflare Workers project with Next.js frontend, Rust WASM module, and shared TypeScript types. Create the initial folder structure with proper TypeScript configurations extending a base config, and set up pnpm workspaces."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-24
- **Context**: Setting up the foundational architecture. I designed the phase-by-phase development approach and defined all technical requirements, then had AI help scaffold the boilerplate.

---

### Phase 0: TypeScript Configuration Strategy

**Prompt**: "Generate a base TypeScript config that can be extended by both Cloudflare Workers (with Workers types) and Next.js (with DOM types), ensuring strict mode and modern ES2022 features."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-24
- **Context**: I outlined the requirements for cross-environment TypeScript compatibility after analyzing the architectural constraints of running code on both edge and client.

---

### Phase 1: Cloudflare Bindings Configuration

**Prompt**: "Create a complete wrangler.toml configuration with bindings for KV, D1, Vectorize, Workers AI, and Workflows. Include TypeScript type definitions for all bindings and build a verification utility that checks binding availability at runtime."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-25
- **Context**: After manually provisioning the Cloudflare services through the dashboard, I designed the binding architecture and had AI generate the type-safe configuration layer. I specified the exact model names and binding structure based on my infrastructure planning.

---

### Phase 2: Worker Routing and SSE Infrastructure

**Prompt**: "Build a clean routing system for the Cloudflare Worker with pattern-based URL matching. Implement Server-Sent Events utilities for streaming responses. Create handler functions for /health, /api/chat with fake token streaming, and /api/docs/upload placeholder. Structure the code with separation of concerns - router, handlers, SSE utils, and types."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-25
- **Context**: I architected the routing layer to prepare for Phase 3.5 Agent integration. The SSE implementation was designed to support real-time LLM streaming that will be added later. I structured the handlers to be easily replaceable when we wire in the actual Cloudflare Agent and RAG pipeline.

---

### Phase 3: D1 Session and Message Persistence

**Prompt**: "Create a D1 schema with sessions and messages tables including foreign keys and indexes. Build a SessionRepository class that handles session creation, last-active updates, message persistence, and retrieval with proper chronological ordering. Update the chat handler to parse ChatRequest bodies, persist user and assistant messages to D1, and return sessionId in the SSE stream."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-25
- **Context**: I designed the database schema to support multi-turn conversations with proper session tracking. The SessionRepository pattern was architected to be reusable by the Cloudflare Agent in Phase 3.5, providing a clean data access layer that abstracts D1 operations. I ensured the session creation logic handles both new and existing sessions gracefully.

**Debug Prompt**: "The SessionRepository.saveMessage is failing with a foreign key constraint error. Add an ensureSession method that creates the session if it doesn't exist, and call it before saving messages in the ErrorAgent."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: Discovered during Phase 5 integration that D1 was throwing FOREIGN KEY constraint failures when messages were saved before their session existed. I designed the ensureSession pattern to gracefully handle session creation with INSERT OR IGNORE.

---

### Phase 3.5: Cloudflare Agents Integration

**Prompt**: "Install the @cloudflare/agents SDK and create an ErrorAgent class extending the Agent base class. Implement WebSocket upgrade handling in the fetch method, webSocketMessage handler for incoming user messages, and initial state management using ctx.storage. Add a route /agent/connect/:sessionId and /api/agent/session endpoint that generates UUIDs and returns WebSocket connection URLs."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: After researching the Cloudflare Agents SDK documentation, I architected the agent system to use Durable Objects for persistent WebSocket connections. I designed the WebSocket message flow to eventually integrate with the RAG pipeline and LLM streaming. The state management pattern was chosen to support both in-memory (Durable Object storage) and persistent (D1) conversation history.

---

### Phase 4: Rust WASM Log Parser

**Prompt**: "Create a Rust library crate that compiles to WASM using wasm-bindgen. Implement a parse_log function that takes a log string, uses regex to extract timestamp/severity/message fields, and returns a structured ParsedLog JSON. Set up the Cargo.toml with wasm32-unknown-unknown target and wasm-bindgen dependency. Generate TypeScript bindings and integrate the WASM module into the Worker with proper initialization."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: I designed the log parsing architecture to leverage Rust's performance for regex-heavy operations at the edge. The WASM module was structured as a reusable library that can be extended with more complex parsing logic. I ensured the TypeScript integration used a singleton initialization pattern to avoid re-compiling the WASM module on every request, which is critical for Worker performance.

**Debug Prompt**: "Getting deprecation warning 'Passing an object to `wasm_bindgen::init` is deprecated'. Update the init call in logParser.ts to use the new {module_or_path: wasmBinary} format."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: After deployment, wrangler showed a deprecation warning for the WASM initialization pattern. I updated the code to match the new wasm-bindgen API while maintaining the singleton pattern.

---

### Phase 5: Full AI Pipeline with RAG

**Prompt**: "Create ai.ts with embedText (handling multiple Workers AI response formats) and chatWithLlmStream (using ReadableStream with SSE parsing). Build vectorStore.ts with upsertDocuments and querySimilar functions. Update ErrorAgent to integrate the full pipeline: parse logs with WASM, retrieve context from Vectorize using embeddings, construct prompt with system message and RAG context, stream LLM tokens over WebSocket, and persist conversation to D1. Handle the Workers AI streaming response format that returns SSE data chunks."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: I architected the complete RAG pipeline after analyzing Workers AI's streaming response format and Vectorize API patterns. The design separates concerns: ai.ts for Workers AI interactions, vectorStore.ts for Vectorize operations, and ErrorAgent as the orchestration layer. I debugged the SSE parsing after discovering Workers AI returns streaming responses in Server-Sent Events format rather than simple JSON chunks. The integration ensures RAG context is retrieved before LLM generation, and all messages are persisted with proper session management including ensureSession to prevent foreign key violations.

**Debug Prompt**: "embedText is throwing 'undefined is not iterable' errors. The Workers AI bge-base-en-v1.5 model returns different response formats - sometimes array of arrays, sometimes objects with 'values' or 'embedding' properties. Update embedText to handle all these formats."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: Discovered that Workers AI embedding responses vary by model version. I added format detection logic to handle both legacy and new response structures, ensuring backward compatibility.

**Debug Prompt**: "WebSocket connects successfully and sends [Done] event, but fullResponse.length is 0 - no tokens are being streamed. The LLM is returning 0 tokens according to wrangler tail logs. Workers AI streaming returns ReadableStream with SSE format 'data: {\"response\":\"token\"}\n\n'. Update chatWithLlmStream to use getReader(), parse SSE lines, extract the 'response' field from JSON, and handle the [DONE] marker."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: After testing the deployed Worker, I discovered Workers AI uses Server-Sent Events format for streaming rather than simple JSON chunks. I designed a buffered line-by-line parser that handles incomplete chunks and extracts clean tokens from the SSE data field, which finally enabled real-time streaming to work correctly.

---

### Phase 6: Next.js Frontend Development

**Prompt**: "Build a Next.js 14 frontend with App Router. Create a useChatSession hook that manages WebSocket connections to the ErrorAgent, handles session persistence with localStorage, and provides typing indicators. Build UI components: ChatMessageBubble with copy-to-clipboard for assistant messages, ChatMessageList with auto-scroll and empty state, ChatInput with Enter-to-send, and DocUploadPanel for uploading knowledge base documents via REST API. Style everything with Tailwind using a modern dark theme with gradient accents."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: I architected the frontend to match the backend's WebSocket-based streaming architecture. The useChatSession hook manages connection lifecycle, message state, and persistence. I designed the UI to be production-ready with professional styling, proper loading states, and UX enhancements like typing indicators and copy buttons. The localStorage persistence ensures sessions survive page reloads.

**Enhancement Prompt**: "Add CORS headers to the Worker to allow cross-origin requests from localhost:3000 and any deployed Vercel domain. Move WebSocket upgrade handling before the router so it bypasses CORS middleware. Update ChatMessageList to show a typing indicator when the assistant is generating responses, using animated bouncing dots that match the assistant message styling."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: After initial frontend deployment testing, CORS blocked document uploads and WebSocket connections from the deployed frontend. I designed the CORS configuration to be permissive for development while maintaining security. The typing indicator improves perceived performance by showing activity during LLM generation.

**Mobile Optimization Prompt**: "Make the website fully mobile-responsive. Add a collapsible sidebar with hamburger menu for mobile devices, implement touch-friendly button sizes (minimum 44px), use responsive spacing and typography with Tailwind breakpoints (sm:, lg:), and hide non-essential text on small screens. Add viewport configuration to prevent zooming issues. The sidebar should slide in from the left with a dark overlay on mobile."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: To ensure the application works well on all devices, I designed a mobile-first responsive layout. The sidebar becomes a slide-out drawer on mobile with proper touch interactions, and all UI elements scale appropriately. This makes the app professional and usable on phones and tablets.

---

### Phase 7+: Documentation and Polish

**Prompt**: "Complete PROMPTS.md with the system prompt used by ErrorAgent including how RAG context is injected. Create a professional README.md suitable for recruiters with: project overview, architecture diagram, live demo link, test cases to try, tech stack breakdown, deployment instructions for both Worker and Next.js frontend, and local development setup as a fallback. Include a complete phase plan showing all 10 development phases with clear objectives. Make it concise, well-structured, and impressive."

- **Tool**: GitHub Copilot (Claude Sonnet)
- **Date**: 2025-11-26
- **Context**: Preparing the repository for public visibility and portfolio presentation. I designed the documentation to highlight technical achievements, architectural decisions, and the complete development journey from concept to deployment. The README targets technical recruiters and hiring managers who need to quickly understand scope, complexity, and execution quality.

---

### Phase 8: LangChain RAG Integration

**Prompt**: "I want to add LangChain to the project for the RAG pipeline. Help me create a dedicated endpoint that uses LangChain patterns - Document format for retrieved chunks, PromptTemplate for structuring the analysis prompt, and integrate it with my existing Vectorize retriever and Workers AI LLM."

- **Tool**: GitHub Copilot (Claude Opus)
- **Date**: 2025-11-27
- **Context**: After completing the core RAG implementation, I wanted to incorporate LangChain to leverage its abstractions for the log analysis pipeline. I designed the integration to use LangChain's Document format and PromptTemplate patterns while keeping the existing Cloudflare Vectorize and Workers AI infrastructure. The new `/api/langchain/log-analyze` endpoint provides a dedicated path for LangChain-powered analysis.

**Integration Prompt**: "Update the ErrorAgent to detect log-like messages and route them through the LangChain RAG path instead of the standard path. Add a looksLikeLog helper that checks for common patterns like ERROR, Exception, timestamps, and stack traces."

- **Tool**: GitHub Copilot (Claude Opus)
- **Date**: 2025-11-27
- **Context**: To make the LangChain integration practical, I added intelligent routing in the ErrorAgent. Messages that look like logs or error traces are automatically processed through the LangChain pipeline, which provides more structured analysis with root cause identification and debugging steps. Regular chat messages continue through the standard path.

---
