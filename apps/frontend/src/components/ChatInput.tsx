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
                <div className="flex-1 relative group">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste an error or ask a question..."
                        disabled={disabled}
                        className="w-full bg-dark-800 text-gray-100 border border-dark-600/50 rounded-xl px-4 py-3 text-[15px] resize-none focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 disabled:opacity-50 transition-all placeholder:text-gray-600 min-h-[48px] max-h-[200px] font-mono"
                        rows={1}
                    />
                    {/* Glow effect on focus */}
                    <div className="absolute inset-0 rounded-xl bg-accent/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="p-3 bg-accent hover:bg-accent-light text-dark-900 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 hover:shadow-glow active:scale-95"
                    title="Send message"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <p className="text-xs text-gray-600 mt-2.5 text-center font-mono">
                <span className="text-accent/60">enter</span> to send · <span className="text-accent/60">shift+enter</span> for new line
            </p>
        </div>
    );
}
