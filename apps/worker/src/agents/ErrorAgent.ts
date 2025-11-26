import { Agent } from "agents";
import type { Env } from "../types";
import type { ChatMessage } from "@cf_ai/shared";

interface AgentState {
    sessionId: string;
    messages: ChatMessage[];
    createdAt: string;
    lastActiveAt: string;
}

export class ErrorAgent extends Agent<Env, AgentState> {
    // Initialize the agent's state if empty
    async initialize(sessionId: string) {
        const now = new Date().toISOString();

        const state: AgentState = {
            sessionId,
            messages: [],
            createdAt: now,
            lastActiveAt: now,
        };

        await this.ctx.storage.put("state", state);
        return state;
    }

    async getAgentState(): Promise<AgentState | null> {
        const state = await this.ctx.storage.get<AgentState>("state");
        return state ?? null;
    }

    async setAgentState(state: AgentState) {
        await this.ctx.storage.put("state", state);
    }

    // Handle incoming fetch requests (WebSocket upgrade and POST messages)
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        if (request.headers.get("upgrade") === "websocket") {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            const sessionId = url.pathname.split("/")[3] || "unknown";

            // Initialize state if needed
            let state = await this.getAgentState();
            if (!state) {
                state = await this.initialize(sessionId);
            }

            // Accept the WebSocket connection
            this.ctx.acceptWebSocket(server);

            return new Response(null, {
                status: 101,
                webSocket: client,
            });
        }

        // Handle POST messages
        if (url.pathname.endsWith("/message") && request.method === "POST") {
            const { content } = await request.json<{ content: string }>();
            let state = await this.getAgentState();

            if (!state) {
                // Initialize with a default sessionId if not exists
                state = await this.initialize("default-session");
            }

            const userMessage: ChatMessage = {
                role: "user",
                content,
                timestamp: new Date().toISOString(),
            };

            state.messages.push(userMessage);
            state.lastActiveAt = new Date().toISOString();

            await this.setAgentState(state);

            // Fake assistant reply
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: "Acknowledged: " + content,
                timestamp: new Date().toISOString(),
            };

            state.messages.push(assistantMessage);
            await this.setAgentState(state);

            return new Response(JSON.stringify({ messages: state.messages }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Not found", { status: 404 });
    }

    // Handle WebSocket messages
    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        const content = typeof message === "string" ? message : new TextDecoder().decode(message);

        let state = await this.getAgentState();
        if (!state) {
            state = await this.initialize("unknown");
        }

        const userMessage: ChatMessage = {
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };

        state.messages.push(userMessage);
        state.lastActiveAt = new Date().toISOString();

        await this.setAgentState(state);
        ws.send(JSON.stringify({ type: "message", message: userMessage }));

        // Fake assistant reply (Phase 5 will replace with real LLM streaming)
        const assistantMessage: ChatMessage = {
            role: "assistant",
            content: "Acknowledged: " + content,
            timestamp: new Date().toISOString(),
        };

        state.messages.push(assistantMessage);
        await this.setAgentState(state);

        ws.send(JSON.stringify({ type: "message", message: assistantMessage }));
    }

    // Handle WebSocket close
    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        console.log("WebSocket closed:", code, reason, wasClean);
    }

    // Handle WebSocket error
    async webSocketError(ws: WebSocket, error: unknown) {
        console.error("WebSocket error:", error);
    }
}
