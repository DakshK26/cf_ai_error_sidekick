import type { Env } from "./types";
import { createSSEStream, sseEvent } from "./sse";

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
 * Phase 2: Fake streaming tokens
 * Phase 3.5+: Real Agent + RAG + LLM integration
 */
export async function handleChat(req: Request, _env: Env): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    // Later: parse JSON body into ChatMessage[], sessionId, etc.
    // For now, just stream a fake response

    return createSSEStream((controller) => {
        // Fake streaming tokens
        const tokens = ["Hello", ",", " this", " is", " a", " test", " stream", "."];
        let i = 0;

        const interval = setInterval(() => {
            if (i >= tokens.length) {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(sseEvent("[DONE]")));
                clearInterval(interval);
                controller.close();
            } else {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(sseEvent(tokens[i])));
                i++;
            }
        }, 150);
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
