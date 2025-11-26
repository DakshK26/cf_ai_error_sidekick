"use client";

import { useState } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";

interface ChatMessageBubbleProps {
    message: ChatMessageView;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 px-2 group`}>
            <div
                className={`max-w-2xl px-5 py-3.5 rounded-xl relative ${isUser
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/50 text-slate-100 border border-slate-700/50 backdrop-blur-sm"
                    }`}
            >
                <div className={`text-[10px] font-semibold mb-2 tracking-wide uppercase ${isUser ? "text-blue-100" : "text-slate-400"
                    }`}>
                    {isUser ? "You" : "Assistant"}
                </div>
                <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
                
                {/* Copy button for assistant messages */}
                {!isUser && (
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}