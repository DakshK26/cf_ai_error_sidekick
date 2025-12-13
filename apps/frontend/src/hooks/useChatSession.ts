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
    isTyping: boolean;
    error: string | null;
    sendMessage: (content: string) => void;
    resetSession: () => void;
}

const SESSION_STORAGE_KEY = "cf_ai_error_sidekick_session";
const MESSAGES_STORAGE_KEY = "cf_ai_error_sidekick_messages";

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
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize or restore session ID and messages
    useEffect(() => {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            setSessionId(stored);

            // Restore messages for this session
            const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
            if (storedMessages) {
                try {
                    const parsed = JSON.parse(storedMessages);
                    setMessages(parsed);
                } catch (err) {
                    console.error("Failed to parse stored messages:", err);
                }
            }
        } else {
            const newId = generateUUID();
            localStorage.setItem(SESSION_STORAGE_KEY, newId);
            setSessionId(newId);
        }
    }, []);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages]);

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
                    setIsTyping(false); // Got first token, stop typing indicator
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
                    setIsTyping(false); // Stream complete
                } else if (data.type === "error") {
                    setIsTyping(false);
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
            const timeoutId = reconnectTimeoutRef.current;
            if (timeoutId) {
                clearTimeout(timeoutId);
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
        setIsTyping(true); // Show typing indicator

        // Send to backend
        wsRef.current.send(content);
    };

    const resetSession = () => {
        // Close existing WebSocket
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Clear messages from state and storage
        setMessages([]);
        localStorage.removeItem(MESSAGES_STORAGE_KEY);
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
        isTyping,
        error,
        sendMessage,
        resetSession,
    };
}
