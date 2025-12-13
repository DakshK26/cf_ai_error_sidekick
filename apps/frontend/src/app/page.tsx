"use client";

import { useState } from "react";
import { useChatSession } from "@/hooks/useChatSession";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatInput } from "@/components/ChatInput";
import { RobotMascot } from "@/components/RobotMascot";

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
        <main className="h-screen flex relative z-10 bg-dark-900">

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 border-r border-dark-600/50 flex flex-col bg-dark-800/80 backdrop-blur-md
                fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar header */}
                <div className="p-4 border-b border-dark-600/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                            <h1 className="text-base font-semibold text-white tracking-tight">
                                Error Sidekick
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                        {`// paste errors, get fixes`}
                    </p>
                </div>

                {/* Context upload */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                Add Context
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                                Paste docs or error patterns to improve responses
                            </p>
                        </div>
                        <textarea
                            value={docText}
                            onChange={(e) => setDocText(e.target.value)}
                            placeholder="Paste documentation here..."
                            className="w-full bg-dark-900/50 text-gray-100 border border-dark-600/50 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 placeholder:text-gray-600 transition-all font-mono"
                            rows={6}
                        />
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !docText.trim()}
                            className="w-full px-3 py-2.5 text-sm bg-dark-700 hover:bg-dark-600 text-gray-200 rounded-lg disabled:opacity-40 transition-all border border-dark-600/50 hover:border-accent/30 group"
                        >
                            <span className="group-hover:text-accent transition-colors">
                                {isUploading ? "Adding..." : uploadStatus || "Add to knowledge base →"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-dark-600/50 space-y-3">
                    <button
                        onClick={resetSession}
                        className="w-full px-3 py-2.5 text-sm text-gray-400 hover:text-accent border border-dark-600/50 hover:border-accent/50 rounded-lg transition-all hover:shadow-glow-sm"
                    >
                        New conversation
                    </button>
                    <div className="pt-2 text-center">
                        <a
                            href="https://github.com/DakshK26"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-accent transition-colors font-mono"
                        >
                            built by @DakshK26
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Robot mascot - floating in top left */}
                <div className="absolute top-12 left-6 z-50 hidden lg:block opacity-90 hover:opacity-100 transition-opacity">
                    <RobotMascot size="md" />
                </div>

                {/* Mobile header */}
                <header className="lg:hidden flex-shrink-0 border-b border-dark-600/50 px-4 py-3 flex items-center justify-between bg-dark-800/50 backdrop-blur-md">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <RobotMascot size="sm" className="!w-8 !h-10" />
                        <span className="text-sm text-white font-medium">Error Sidekick</span>
                        {isConnecting && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                        {isConnected && !error && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />}
                        {error && <div className="w-2 h-2 rounded-full bg-red-400" />}
                    </div>
                    <div className="w-9" />
                </header>

                {/* Desktop status bar */}
                <div className="hidden lg:flex flex-shrink-0 px-6 py-2.5 border-b border-dark-600/30 items-center justify-between bg-dark-800/30">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        {isConnecting && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>connecting...</span>
                            </>
                        )}
                        {isConnected && !error && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <span className="text-green-400">online</span>
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
                        className="text-xs text-gray-600 hover:text-accent transition-colors font-mono flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        source
                    </a>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <ChatMessageList
                        messages={messages}
                        isTyping={isTyping}
                        onSendExample={isConnected ? sendMessage : undefined}
                    />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 border-t border-dark-600/30 bg-dark-800/30">
                    <ChatInput onSend={sendMessage} disabled={!isConnected} />
                </div>
            </div>
        </main>
    );
}
