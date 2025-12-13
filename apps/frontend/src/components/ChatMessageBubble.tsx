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

    if (isUser) {
        return (
            <div className="mb-6">
                <div className="bg-zinc-800 rounded-2xl rounded-br-md px-4 py-3 inline-block max-w-[85%] ml-auto">
                    <div className="whitespace-pre-wrap break-words text-zinc-100 text-[15px] leading-relaxed">
                        {message.content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 group">
            <div className="text-zinc-100 relative">
                <div className="prose prose-invert prose-zinc max-w-none text-[15px] leading-relaxed prose-p:text-zinc-300 prose-p:my-3 prose-headings:text-zinc-100 prose-headings:font-medium prose-h3:text-base prose-strong:text-zinc-100 prose-strong:font-medium prose-li:text-zinc-300 prose-code:text-violet-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute -top-1 right-0 p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}