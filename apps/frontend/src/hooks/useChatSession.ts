"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

export interface ChatMessageView {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export interface UseChatSessionResult {
    sessionId: string | null;
    messages: ChatMessageView[];
    isConnecting: boolean;
    isConnected: boolean;
    error: string | null;
    sendMessage: (content: string) => void;
    resetSession: () => void;
}

const SESSION_STORAGE_KEY = "cf_ai_error_sidekick_session";

function generateUUID(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function useChatSession(): UseChatSessionResult {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageView[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize or restore session ID
    useEffect(() => {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            setSessionId(stored);
        } else {
            const newId = generateUUID();
            localStorage.setItem(SESSION_STORAGE_KEY, newId);
            setSessionId(newId);
        }
    }, []);

    // Establish WebSocket connection when sessionId changes
    useEffect(() => {
        if (!sessionId) return;

        setIsConnecting(true);
        setError(null);

        const wsUrl = apiUrl(`/agent/connect/${sessionId}`).replace(/^http/, "ws");
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setIsConnecting(false);
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "token") {
                    // Append token to the last assistant message, or create a new one
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (last && last.role === "assistant") {
                            return [
                                ...prev.slice(0, -1),
                                { ...last, content: last.content + data.token },
                            ];
                        } else {
                            // Create new assistant message
                            return [
                                ...prev,
                                {
                                    id: generateUUID(),
                                    role: "assistant",
                                    content: data.token,
                                },
                            ];
                        }
                    });
                } else if (data.type === "done") {
                    // Streaming complete, nothing to do
                } else if (data.type === "error") {
                    setError(data.error || "Unknown error from agent");
                } else if (data.type === "message" && data.message) {
                    // Legacy message format (if backend sends complete messages)
                    const msg = data.message;
                    if (msg.role === "user" || msg.role === "assistant") {
                        setMessages((prev) => [
                            ...prev,
                            {
                                id: generateUUID(),
                                role: msg.role,
                                content: msg.content,
                            },
                        ]);
                    }
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            setError("WebSocket connection error");
            setIsConnected(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
            setIsConnecting(false);
            // Optional: implement reconnection logic here
        };

        wsRef.current = ws;

        return () => {
            ws.close();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [sessionId]);

    const sendMessage = (content: string) => {
        if (!content.trim()) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setError("WebSocket is not connected");
            return;
        }

        // Immediately add user message to UI
        const userMessage: ChatMessageView = {
            id: generateUUID(),
            role: "user",
            content,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send to backend
        wsRef.current.send(content);
    };

    const resetSession = () => {
        // Close existing WebSocket
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Clear messages
        setMessages([]);
        setError(null);

        // Generate new session ID
        const newId = generateUUID();
        localStorage.setItem(SESSION_STORAGE_KEY, newId);
        setSessionId(newId);
    };

    return {
        sessionId,
        messages,
        isConnecting,
        isConnected,
        error,
        sendMessage,
        resetSession,
    };
}
