import type { Env } from "./types";
import { createSSEStream, sseEvent } from "./sse";
import { ChatMessage, ChatRequest } from "@cf_ai/shared";
import { SessionRepository } from "./sessionRepository";
import { parseLogsWithWasm } from "./logParser";

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
 * Document upload endpoint - placeholder for Phase 7
 */
export async function handleDocsUpload(_req: Request, _env: Env): Promise<Response> {
    // Placeholder; real ingestion comes in Phase 7
    return new Response(
        JSON.stringify({
            status: "not_implemented",
            message: "Docs upload coming in Phase 7.",
        }),
        { status: 501, headers: { "Content-Type": "application/json" } }
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
