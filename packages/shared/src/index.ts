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
