"use client";

import { useState } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatInput } from "@/components/ChatInput";

export default function HomePage() {
    const [showSettings, setShowSettings] = useState(false);
    const {
        sessionId,
        messages,
        isConnecting,
        isConnected,
        isTyping,
        error,
        sendMessage,
        resetSession,
    } = useChatSession();

    return (
        <main className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="flex-shrink-0 border-b border-zinc-800 px-4 sm:px-6 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-base font-medium text-zinc-100">
                            Error Sidekick
                        </h1>
                        <div className="flex items-center gap-1.5">
                            {isConnecting && (
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                            {isConnected && !error && (
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            )}
                            {error && (
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                            title="Settings"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>
                        <button
                            onClick={resetSession}
                            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            New chat
                        </button>
                    </div>
                </div>
            </header>

            {/* Settings panel */}
            {showSettings && (
                <div className="flex-shrink-0 border-b border-zinc-800 px-4 sm:px-6 py-4 bg-zinc-900/50">
                    <div className="max-w-3xl mx-auto">
                        <SettingsPanel sessionId={sessionId} onClose={() => setShowSettings(false)} />
                    </div>
                </div>
            )}

            {/* Chat area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <ChatMessageList messages={messages} isTyping={isTyping} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-zinc-800">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={sendMessage} disabled={!isConnected} />
                </div>
            </div>

            {/* Footer */}
            <footer className="flex-shrink-0 py-3 px-4 text-center">
                <p className="text-xs text-zinc-600">
                    Built by{" "}
                    <a
                        href="https://github.com/DakshK26"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        Daksh Khanna
                    </a>
                    {" · "}
                    <a
                        href="https://github.com/DakshK26/cf_ai_error_sidekick"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        View source
                    </a>
                </p>
            </footer>
        </main>
    );
}

function SettingsPanel({ sessionId, onClose }: { sessionId: string | null; onClose: () => void }) {
    const [docText, setDocText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!docText.trim()) return;
        setIsUploading(true);
        setStatus(null);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
            const response = await fetch(`${baseUrl}/api/docs/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docs: [{ text: docText, source: "user-panel" }],
                }),
            });

            if (!response.ok) throw new Error("Upload failed");
            const result = await response.json();
            setStatus(`Added ${result.upserted?.length || 0} document(s)`);
            setDocText("");
        } catch {
            setStatus("Failed to upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-200">Add context</h3>
                <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p className="text-xs text-zinc-500">
                Paste documentation or error patterns to improve responses.
            </p>
            <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste content here..."
                className="w-full bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400 placeholder:text-zinc-600"
                rows={3}
            />
            <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                    Session: <span className="font-mono text-zinc-400">{sessionId?.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-3">
                    {status && (
                        <span className="text-xs text-zinc-400">{status}</span>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !docText.trim()}
                        className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {isUploading ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}
