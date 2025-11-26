import { Agent } from "agents";
import type { Env } from "../types";
import type { ChatMessage } from "@cf_ai/shared";
import { parseLogsWithWasm } from "../logParser";
import { querySimilar } from "../vectorStore";
import { chatWithLlmStream } from "../ai";
import { SessionRepository } from "../sessionRepository";

interface AgentState {
    sessionId: string;
    messages: ChatMessage[];
    createdAt: string;
    lastActiveAt: string;
    lastLogSummary?: string;
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

    // Handle WebSocket messages - Full AI pipeline with RAG + LLM streaming
    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        const content = typeof message === "string" ? message : new TextDecoder().decode(message);

        let state = await this.getAgentState();
        if (!state) {
            state = await this.initialize("unknown");
        }

        const repo = new SessionRepository(this.env);
        const userMessage: ChatMessage = {
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };

        state.messages.push(userMessage);
        state.lastActiveAt = new Date().toISOString();
        await this.setAgentState(state);
        await repo.saveMessage(state.sessionId, userMessage);

        // 1. Try to parse as log and create a short summary
        let logSummary = "";
        try {
            const parsed = await parseLogsWithWasm(content);
            if (parsed && parsed.entries && parsed.entries.length > 0) {
                const first = parsed.entries[0];
                logSummary = `Detected ${parsed.entries.length} log entries. First severity: ${first.severity}. Message: ${first.message}`;
                state.lastLogSummary = logSummary;
                await this.setAgentState(state);
            }
        } catch (e) {
            // ignore parsing errors, just fall back to normal chat
        }

        // 2. Retrieve context from Vectorize based on the message (or log summary)
        const queryText = logSummary || content;
        let contextChunks: string[] = [];
        try {
            const results = await querySimilar(this.env, queryText, 4);
            contextChunks = results.map(
                (r, idx) => `# Context ${idx + 1} (score=${r.score?.toFixed(3)}):\n${r.text}`
            );
        } catch (e) {
            // no context available yet is fine
        }

        // 3. Fetch recent history from D1
        const recent = await repo.getRecentMessages(state.sessionId, 10);

        // 4. Build prompt
        const systemPrompt = [
            "You are an AI assistant that helps developers understand and debug errors and logs.",
            "If log analysis is available, prioritize explaining the root cause and next steps.",
            "Use the provided context snippets if they are relevant, but don't hallucinate details."
        ].join("\n");

        const contextSection =
            contextChunks.length > 0
                ? `\n\n=== Retrieved Context ===\n${contextChunks.join("\n\n")}\n\n=== End Context ===\n`
                : "";

        const historyMessages = recent
            .map(m => ({ role: m.role, content: m.content as string }))
            .filter(m => m.role === "user" || m.role === "assistant");

        const messages = [
            { role: "system" as const, content: systemPrompt + contextSection },
            ...historyMessages,
            { role: "user" as const, content }
        ];

        // 5. Stream LLM response tokens to client and buffer them
        let assistantContent = "";

        try {
            await chatWithLlmStream(this.env, messages, token => {
                assistantContent += token;
                ws.send(
                    JSON.stringify({
                        type: "token",
                        token
                    })
                );
            });

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: assistantContent,
                timestamp: new Date().toISOString()
            };

            state.messages.push(assistantMessage);
            await this.setAgentState(state);
            await repo.saveMessage(state.sessionId, assistantMessage);

            ws.send(JSON.stringify({ type: "done" }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error"
            }));
        }
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
