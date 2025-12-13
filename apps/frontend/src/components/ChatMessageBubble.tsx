"use client";

import { useState } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import ReactMarkdown from "react-markdown";

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
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 sm:mb-4 px-1 sm:px-2 group`}>
            <div
                className={`max-w-[85%] sm:max-w-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg relative ${isUser
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/60 text-slate-100 border border-slate-700/40"
                    }`}
            >
                <div className={`text-[10px] font-medium mb-1.5 sm:mb-2 tracking-wide uppercase ${isUser ? "text-blue-200" : "text-slate-500"
                    }`}>
                    {isUser ? "You" : "Sidekick"}
                </div>

                {/* Render Markdown for assistant messages, plain text for user messages */}
                {isUser ? (
                    <div className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
                        {message.content}
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-slate-100 prose-headings:font-semibold prose-h3:text-lg prose-h4:text-base prose-p:text-slate-200 prose-strong:text-slate-100 prose-li:text-slate-200 prose-code:text-cyan-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                )}

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