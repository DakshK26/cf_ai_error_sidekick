"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { RobotMascot } from "./RobotMascot";

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
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 min-h-[60vh]">
                <div className="text-center max-w-lg mb-10 animate-fade-in-up">
                    {/* Robot mascot for empty state on mobile */}
                    <div className="lg:hidden mb-6 flex justify-center">
                        <RobotMascot size="md" />
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                        Paste an error or stack trace
                    </h2>
                    <p className="text-sm text-gray-500 font-mono">
                        {`// I'll explain what went wrong and suggest fixes`}
                    </p>
                </div>

                {onSendExample && (
                    <div className="w-full max-w-2xl animate-fade-in-up animation-delay-200">
                        <p className="text-xs text-accent uppercase tracking-widest mb-4 text-center font-semibold flex items-center justify-center gap-2">
                            <span className="w-8 h-px bg-accent/30" />
                            Try an example
                            <span className="w-8 h-px bg-accent/30" />
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {EXAMPLE_PROMPTS.map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSendExample(example.prompt)}
                                    className="text-left px-4 py-3.5 bg-dark-800/50 hover:bg-dark-700/50 border border-dark-600/50 hover:border-accent/40 rounded-xl transition-all group card-hover"
                                    style={{ animationDelay: `${(i + 2) * 100}ms` }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm text-gray-200 group-hover:text-accent font-medium transition-colors">
                                            {example.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-mono flex items-center gap-1">
                                        click to try 
                                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Terminal-style output indicator */}
                <div className="mt-10 animate-fade-in-up animation-delay-400">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/60" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                            <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        </div>
                        <span>ready for input</span>
                        <span className="w-2 h-4 bg-accent animate-blink" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
                {messages.map((message, index) => (
                    <div 
                        key={message.id} 
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <ChatMessageBubble message={message} />
                    </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
