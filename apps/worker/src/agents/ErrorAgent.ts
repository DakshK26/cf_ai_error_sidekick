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

        await this.setState({
            sessionId,
            messages: [],
            createdAt: now,
            lastActiveAt: now,
        });
    }

    // Called when a client WebSocket connects
    async onConnect(client: WebSocket, sessionId: string) {
        let state = await this.getState();

        if (!state) {
            await this.initialize(sessionId);
            state = await this.getState();
        }

        // Send existing messages to client
        for (const m of state!.messages) {
            client.send(JSON.stringify({ type: "message", message: m }));
        }
    }

    // Method to receive a chat message from the user
    async onMessageFromClient(
        client: WebSocket,
        sessionId: string,
        content: string
    ) {
        let state = await this.getState();
        if (!state) {
            await this.initialize(sessionId);
            state = await this.getState();
        }

        const userMessage: ChatMessage = {
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };

        state!.messages.push(userMessage);
        state!.lastActiveAt = new Date().toISOString();

        await this.setState(state!);
        client.send(JSON.stringify({ type: "message", message: userMessage }));

        // Fake assistant reply (Phase 5 will replace with real LLM streaming)
        const assistantMessage: ChatMessage = {
            role: "assistant",
            content: "Acknowledged: " + content,
            timestamp: new Date().toISOString(),
        };

        state!.messages.push(assistantMessage);
        await this.setState(state!);

        client.send(JSON.stringify({ type: "message", message: assistantMessage }));
    }

    // Handle incoming fetch requests (WebSocket upgrade and POST messages)
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Handle WebSocket upgrade
        if (request.headers.get("upgrade") === "websocket") {
            const pair = new WebSocketPair();
            const [client, server] = Object.values(pair);

            this.ctx.acceptWebSocket(server);

            const sessionId = url.pathname.split("/")[3] || "unknown";

            server.addEventListener("open", () => {
                this.onConnect(server, sessionId);
            });

            server.addEventListener("message", (evt) => {
                const content = typeof evt.data === "string" ? evt.data : "";
                this.onMessageFromClient(server, sessionId, content);
            });

            return new Response(null, {
                status: 101,
                webSocket: client,
            });
        }

        // Handle POST messages
        if (url.pathname.endsWith("/message") && request.method === "POST") {
            const { content } = await request.json<{ content: string }>();
            const state = await this.getState();
            const sessionId = state?.sessionId || "unknown";

            // Create a fake client for backend-triggered messages
            const fakeClient = {
                send: () => { },
            } as any;

            await this.onMessageFromClient(fakeClient, sessionId, content);

            return new Response("ok");
        }

        return new Response("Not found", { status: 404 });
    }
}
