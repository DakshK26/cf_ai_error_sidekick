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
        label: "Fix CORS headers",
        prompt: `My Cloudflare Worker returns this error:

Access to fetch blocked by CORS policy: No 'Access-Control-Allow-Origin' header present.

Here's my current code:

export default {
  async fetch(request) {
    const data = { message: "Hello" };
    return new Response(JSON.stringify(data));
  }
};

How do I fix this? Show me the complete working code.`
    },
    {
        label: "Handle D1 errors",
        prompt: `I'm getting this D1 error in my Cloudflare Worker:

D1_ERROR: SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email

My insert code:
const result = await env.DB.prepare("INSERT INTO users (email, name) VALUES (?, ?)").bind(email, name).run();

How should I properly handle this error and return appropriate responses? Show me a robust implementation with error handling.`
    },
    {
        label: "Fix KV binding",
        prompt: `TypeError: Cannot read properties of undefined (reading 'get')
    at Object.fetch (worker.js:8:24)

My code:
export default {
  async fetch(request, env) {
    const value = await env.MY_KV.get("config");
    return new Response(value);
  }
};

My wrangler.toml has the KV namespace but it's not working. What's wrong and how do I fix it?`
    },
    {
        label: "Stream response",
        prompt: `How do I stream a response from my Cloudflare Worker? I want to use Server-Sent Events to stream data to the client.

Show me a complete example with:
1. The Worker code that streams
2. How to properly format SSE messages
3. Client-side code to consume the stream`
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
        <div className="h-full">
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
