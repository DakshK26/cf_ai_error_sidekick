"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!input.trim() || disabled) return;
        onSend(input);
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
        }
    }, [input]);

    return (
        <div className="p-4 sm:p-6">
            <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste an error or ask a question..."
                        disabled={disabled}
                        className="w-full bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-[15px] resize-none focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-colors placeholder:text-zinc-500 min-h-[48px] max-h-[200px]"
                        rows={1}
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    title="Send message"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <p className="text-xs text-zinc-600 mt-2 text-center">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
