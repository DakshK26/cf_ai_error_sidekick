import { Router } from "./router";
import type { Env } from "./types";
import {
    handleRoot,
    handleHealth,
    handleAiTest,
    handleChat,
    handleDocsUpload,
    handleGetSession,
    handleLogAnalyze,
    handleAgentSession,
} from "./handlers";
import { ErrorAgent } from "./agents/ErrorAgent";

const router = new Router();

// Agent WebSocket connection route
router.on("GET", /^\/agent\/connect\/.+/, async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const sessionId = url.pathname.split("/")[3];

    if (!sessionId) {
        return new Response("Missing session ID", { status: 400 });
    }

    const id = env.ERROR_AGENT.idFromName(sessionId);
    const stub = env.ERROR_AGENT.get(id);

    return stub.fetch(req);
});

// Agent POST message route
router.on("POST", /^\/agent\/message\/.+/, async (req: Request, env: Env) => {
    const url = new URL(req.url);
    const sessionId = url.pathname.split("/")[3];

    if (!sessionId) {
        return new Response("Missing session ID", { status: 400 });
    }

    const { content } = await req.json<{ content: string }>();

    const id = env.ERROR_AGENT.idFromName(sessionId);
    const stub = env.ERROR_AGENT.get(id);

    return stub.fetch("https://agent/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
});

// Existing routes
router.on("GET", "/", handleRoot);
router.on("GET", "/health", handleHealth);
router.on("GET", "/ai-test", handleAiTest);
router.on("POST", "/api/chat", handleChat);
router.on("POST", "/api/agent/session", handleAgentSession);
router.on("POST", "/api/docs/upload", handleDocsUpload);
router.on("POST", "/api/log/analyze", handleLogAnalyze);
router.on("GET", /^\/api\/session\/.+/, handleGetSession);

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        // WebSocket upgrades bypass normal CORS - handle directly
        if (request.headers.get("upgrade") === "websocket") {
            const url = new URL(request.url);

            // Check if it's an agent connection
            if (url.pathname.startsWith("/agent/connect/")) {
                const sessionId = url.pathname.split("/")[3];

                if (!sessionId) {
                    return new Response("Missing session ID", { status: 400 });
                }

                const id = env.ERROR_AGENT.idFromName(sessionId);
                const stub = env.ERROR_AGENT.get(id);

                return stub.fetch(request);
            }
        }

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        const response = await router.route(request, env);

        // Add CORS headers to all responses
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    },
};

export { ErrorAgent };
