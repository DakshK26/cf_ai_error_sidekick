"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import { ChatMessageBubble } from "./ChatMessageBubble";

interface ChatMessageListProps {
    messages: ChatMessageView[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-slate-400 max-w-md">
                    <p className="text-lg mb-2">
                        👋 Paste an error log, stack trace, or describe your issue.
                    </p>
                    <p className="text-sm">
                        I will analyze it and suggest next steps using RAG-powered context.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
