export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
    role: Role;
    content: string;
    timestamp?: string;
}

export interface SessionMeta {
    id: string;
    createdAt: string;
    lastActiveAt: string;
}

export interface ChatRequest {
    sessionId?: string;
    message: string;
}

export interface RetrievedContextChunk {
    id: string;
    text: string;
    source?: string;
    score?: number;
}

export interface AgentResponseChunk {
    type: "session" | "token" | "done" | "error";
    sessionId?: string;
    token?: string;
    error?: string;
}
