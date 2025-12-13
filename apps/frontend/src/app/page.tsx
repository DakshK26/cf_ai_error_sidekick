"use client";

import { useState } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatInput } from "@/components/ChatInput";

export default function HomePage() {
    const [docText, setDocText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const handleUpload = async () => {
        if (!docText.trim()) return;
        setIsUploading(true);
        setUploadStatus(null);

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
            setUploadStatus(`Added ${result.upserted?.length || 0} docs`);
            setDocText("");
            setTimeout(() => setUploadStatus(null), 3000);
        } catch {
            setUploadStatus("Failed");
            setTimeout(() => setUploadStatus(null), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 border-r border-zinc-800 flex flex-col bg-zinc-900/50
                fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-200
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar header */}
                <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-medium text-zinc-100">Error Sidekick</h1>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Paste errors, get explanations</p>
                </div>

                {/* Context upload */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                                Add Context
                            </h3>
                            <p className="text-xs text-zinc-600 mb-3">
                                Paste docs or error patterns to improve responses
                            </p>
                        </div>
                        <textarea
                            value={docText}
                            onChange={(e) => setDocText(e.target.value)}
                            placeholder="Paste documentation here..."
                            className="w-full bg-zinc-800/50 text-zinc-100 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
                            rows={6}
                        />
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !docText.trim()}
                            className="w-full px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {isUploading ? "Adding..." : uploadStatus || "Add to knowledge base"}
                        </button>
                    </div>
                </div>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Session</span>
                        <span className="font-mono text-zinc-400">{sessionId?.slice(0, 8)}</span>
                    </div>
                    <button
                        onClick={resetSession}
                        className="w-full px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
                    >
                        New conversation
                    </button>
                    <div className="pt-2 text-center">
                        <a
                            href="https://github.com/DakshK26"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                            Built by Daksh Khanna
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile header */}
                <header className="lg:hidden flex-shrink-0 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-300">Error Sidekick</span>
                        {isConnecting && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                        {isConnected && !error && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                        {error && <div className="w-2 h-2 rounded-full bg-red-400" />}
                    </div>
                    <div className="w-9" /> {/* Spacer for centering */}
                </header>

                {/* Desktop status bar */}
                <div className="hidden lg:flex flex-shrink-0 px-6 py-2 border-b border-zinc-800/50 items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {isConnecting && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Connecting...</span>
                            </>
                        )}
                        {isConnected && !error && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Connected</span>
                            </>
                        )}
                        {error && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="text-red-400">{error}</span>
                            </>
                        )}
                    </div>
                    <a
                        href="https://github.com/DakshK26/cf_ai_error_sidekick"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                        View source
                    </a>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                    <ChatMessageList messages={messages} isTyping={isTyping} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-zinc-800">
                    <ChatInput onSend={sendMessage} disabled={!isConnected} />
                </div>
            </div>
        </main>
    );
}

