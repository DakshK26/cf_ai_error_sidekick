import type { Env } from "./types";
import { createSSEStream, sseEvent } from "./sse";
import { ChatMessage, ChatRequest } from "@cf_ai/shared";
import { SessionRepository } from "./sessionRepository";
import { parseLogsWithWasm } from "./logParser";
import { upsertDocuments } from "./vectorStore";
import { runLangChainRagOnLog } from "./langchainRag";

/**
 * Root endpoint - basic health check
 */
export async function handleRoot(_req: Request, _env: Env): Promise<Response> {
    return new Response("Worker running with AI models configured.", { status: 200 });
}

/**
 * Health check endpoint
 */
export async function handleHealth(_req: Request, _env: Env): Promise<Response> {
    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * AI test endpoint - verify Workers AI binding
 */
export async function handleAiTest(_req: Request, env: Env): Promise<Response> {
    const result = await env.AI.run(env.LLM_MODEL as any, {
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello in one short sentence." },
        ],
    });

    return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Chat endpoint - streaming SSE response
 * Phase 3: Uses D1 to persist messages
 * Phase 3.5+: Real Agent + RAG + LLM integration
 */
export async function handleChat(req: Request, env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: ChatRequest;
    try {
        body = await req.json<ChatRequest>();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    if (!body.message || typeof body.message !== "string") {
        return new Response("Missing 'message' field", { status: 400 });
    }

    const repo = new SessionRepository(env);
    const session = await repo.ensureSession(body.sessionId);

    const userMessage: ChatMessage = {
        role: "user",
        content: body.message,
        timestamp: new Date().toISOString(),
    };

    await repo.saveMessage(session.id, userMessage);

    // For now, we stream fake tokens but still persist as if an assistant replied
    return createSSEStream((controller) => {
        const encoder = new TextEncoder();

        // Send sessionId first so client can store it if it was newly created
        controller.enqueue(
            encoder.encode(sseEvent(JSON.stringify({ type: "session", sessionId: session.id })))
        );

        const tokens = ["This", " is", " a", " placeholder", " response", " for", " now."];
        let buffer = "";
        let i = 0;

        const interval = setInterval(async () => {
            if (i >= tokens.length) {
                clearInterval(interval);

                const assistantMessage: ChatMessage = {
                    role: "assistant",
                    content: buffer,
                    timestamp: new Date().toISOString(),
                };

                await repo.saveMessage(session.id, assistantMessage);

                controller.enqueue(encoder.encode(sseEvent(JSON.stringify({ type: "done" }))));
                controller.close();
            } else {
                const token = tokens[i];
                buffer += token;
                controller.enqueue(
                    encoder.encode(sseEvent(JSON.stringify({ type: "token", value: token })))
                );
                i++;
            }
        }, 120);
    });
}

/**
 * Document upload endpoint - Phase 5: Upload documents to Vectorize for RAG
 */
export async function handleDocsUpload(req: Request, env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: { docs?: { id?: string; text: string; source?: string }[] };
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const docs = body.docs ?? [];
    if (!docs.length) {
        return new Response("Missing 'docs' array", { status: 400 });
    }

    const normalized = docs.map(d => ({
        id: d.id ?? crypto.randomUUID(),
        text: d.text,
        metadata: d.source ? { source: d.source } : {}
    }));

    await upsertDocuments(env, normalized);

    return new Response(
        JSON.stringify({ upserted: normalized.map(d => d.id) }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}

/**
 * Get session endpoint - retrieve session messages for debugging
 */
export async function handleGetSession(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // ["", "api", "session", ":id"]
    const sessionId = parts[3];

    if (!sessionId) {
        return new Response("Missing session ID", { status: 400 });
    }

    const repo = new SessionRepository(env);
    const recent = await repo.getRecentMessages(sessionId);

    return new Response(JSON.stringify({ sessionId, messages: recent }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Log analysis endpoint - parse logs using Rust WASM module
 * Phase 4: Uses WASM log parser for fast, structured log analysis
 */
export async function handleLogAnalyze(req: Request, _env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: { log?: string };
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    if (!body.log || typeof body.log !== "string") {
        return new Response("Missing 'log' field", { status: 400 });
    }

    try {
        const parsed = await parseLogsWithWasm(body.log);

        return new Response(JSON.stringify(parsed, null, 2), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Failed to parse log",
                details: error instanceof Error ? error.message : String(error)
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

/**
 * Agent session endpoint - Create or get WebSocket session for Agent
 * Phase 5: Returns sessionId and WebSocket URL for frontend
 */
export async function handleAgentSession(req: Request, _env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const { sessionId } = await req.json<{ sessionId?: string }>().catch(() => ({ sessionId: undefined }));
    const id = sessionId ?? crypto.randomUUID();

    return new Response(
        JSON.stringify({
            sessionId: id,
            websocketUrl: `/agent/connect/${id}`
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}

/**
 * LangChain RAG endpoint - Analyze logs using LangChain with Cloudflare Vectorize
 * This endpoint uses LangChain's RunnableSequence and PromptTemplate
 * to orchestrate RAG-based log analysis with Cloudflare Vectorize as the retriever
 * and Workers AI as the LLM.
 */
export async function handleLangChainLogAnalyze(req: Request, env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    let body: { log?: string };
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    if (!body.log || typeof body.log !== "string") {
        return new Response("Missing 'log' field", { status: 400 });
    }

    try {
        console.log("[LangChain RAG] Starting analysis for log:", body.log.substring(0, 100));
        const answer = await runLangChainRagOnLog(env, body.log);
        console.log("[LangChain RAG] Analysis complete, answer length:", answer.length);

        return new Response(
            JSON.stringify({ answer }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("[LangChain RAG] Error:", error);
        console.error("[LangChain RAG] Error stack:", error instanceof Error ? error.stack : "no stack");
        return new Response(
            JSON.stringify({
                error: "Failed to analyze log with LangChain RAG",
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
