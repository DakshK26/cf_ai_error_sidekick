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
        <div className="border-t border-slate-800/50 p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex gap-2 sm:gap-3 items-end">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or paste logs..."
                    disabled={disabled}
                    className="flex-1 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all placeholder:text-slate-600"
                    rows={3}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm sm:text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 min-h-[44px] sm:h-[52px]"
                >
                    Send
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 sm:mt-3 hidden sm:block">
                Press Enter to send • Shift+Enter for new line
            </p>
        </div>
    );
}
