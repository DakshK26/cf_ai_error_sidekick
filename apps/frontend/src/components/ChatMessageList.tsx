"use client";

import { useEffect, useRef } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessageListProps {
    messages: ChatMessageView[];
    isTyping?: boolean;
}

export function ChatMessageList({ messages, isTyping }: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-medium text-slate-300 mb-2">
                            Start a conversation
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Share error logs, stack traces, or describe technical issues. The assistant will analyze them using contextual knowledge retrieval.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
}
