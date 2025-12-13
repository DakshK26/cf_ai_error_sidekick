"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");

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

    return (
        <div className="border-t border-slate-800/40 p-3 sm:p-6 bg-[#0a0f1a]/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex gap-2 sm:gap-3 items-end">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste your error here..."
                    disabled={disabled}
                    className="flex-1 bg-slate-800/40 text-slate-100 border border-slate-700/40 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 disabled:opacity-50 transition-all placeholder:text-slate-600"
                    rows={3}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors min-h-[44px] sm:h-[52px]"
                >
                    Send
                </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 sm:mt-3 hidden sm:block">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
