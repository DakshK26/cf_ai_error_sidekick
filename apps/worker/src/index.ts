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
router.on("POST", "/api/docs/upload", handleDocsUpload);
router.on("POST", "/api/log/analyze", handleLogAnalyze);
router.on("GET", /^\/api\/session\/.+/, handleGetSession);

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        return router.route(request, env);
    },
};

export { ErrorAgent };
