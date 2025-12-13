"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessageListProps {
    messages: ChatMessageView[];
    isTyping?: boolean;
    onSendExample?: (message: string) => void;
}

const EXAMPLE_PROMPTS = [
    {
        label: "Worker timeout error",
        prompt: `Error: Worker exceeded CPU time limit
    at async handleRequest (worker.js:45:12)
    at async Object.fetch (worker.js:12:5)
Status: 500
Duration: 50021ms
Ray ID: 8a2f3b4c5d6e7f8g`
    },
    {
        label: "D1 database error",
        prompt: `D1_ERROR: SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email
    at D1Database.exec (d1.js:89:15)
    at insertUser (api/users.js:23:8)
Query: INSERT INTO users (email, name) VALUES (?, ?)`
    },
    {
        label: "KV binding missing",
        prompt: `TypeError: Cannot read properties of undefined (reading 'get')
    at Object.fetch (worker.js:8:24)
Code: const value = await env.MY_KV.get("key");
Bindings configured: ASSETS, DB`
    },
    {
        label: "CORS preflight failing",
        prompt: `Access to fetch at 'https://api.example.com/data' from origin 'https://mysite.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present.

My worker handles GET requests but OPTIONS requests return 404.`
    }
];

export function ChatMessageList({ messages, isTyping, onSendExample }: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8">
                <div className="text-center max-w-lg mb-8">
                    <p className="text-xl text-zinc-300 mb-2">
                        Paste an error or stack trace
                    </p>
                    <p className="text-sm text-zinc-500">
                        I&apos;ll explain what went wrong and suggest fixes.
                    </p>
                </div>

                {onSendExample && (
                    <div className="w-full max-w-2xl">
                        <p className="text-xs text-zinc-600 uppercase tracking-wide mb-3 text-center">
                            Try an example
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {EXAMPLE_PROMPTS.map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSendExample(example.prompt)}
                                    className="text-left px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-lg transition-all group"
                                >
                                    <span className="text-sm text-zinc-300 group-hover:text-zinc-100">
                                        {example.label}
                                    </span>
                                    <span className="block text-xs text-zinc-600 mt-0.5 truncate">
                                        Click to try →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
                {messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
