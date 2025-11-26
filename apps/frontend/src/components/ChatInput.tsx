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
        <div className="border-t border-slate-800 p-4 bg-slate-900 flex-shrink-0">
            <div className="flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message or paste logs... (Enter to send, Shift+Enter for new line)"
                    disabled={disabled}
                    className="flex-1 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    rows={3}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                    Send
                </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Paste raw logs to get log-specific analysis powered by WASM parsing
            </p>
        </div>
    );
}
