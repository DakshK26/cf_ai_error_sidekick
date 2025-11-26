"use client";

import { useChatSession } from "@/hooks/useChatSession";
import { ChatMessageList } from "@/components/ChatMessageList";
import { ChatInput } from "@/components/ChatInput";
import { DocUploadPanel } from "@/components/DocUploadPanel";

export default function HomePage() {
    const {
        sessionId,
        messages,
        isConnecting,
        isConnected,
        error,
        sendMessage,
        resetSession,
    } = useChatSession();

    return (
        <main className="h-screen bg-slate-950 text-slate-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto">
                {/* Logo and title */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-xl font-bold text-blue-400 mb-1">
                        🤖 CF AI Error Sidekick
                    </h1>
                    <p className="text-xs text-slate-400">
                        Edge-hosted AI assistant for analyzing logs and errors with RAG
                    </p>
                </div>

                {/* Document upload panel */}
                <DocUploadPanel />

                {/* Session info */}
                <div className="mt-auto border-t border-slate-800 pt-4">
                    <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between items-center">
                            <span>Session:</span>
                            <span className="font-mono text-slate-400 text-[10px]">
                                {sessionId?.slice(0, 8)}...
                            </span>
                        </div>
                        <button
                            onClick={resetSession}
                            className="w-full mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
                        >
                            New Session
                        </button>
                    </div>
                </div>
            </aside>

            {/* Chat area */}
            <section className="flex-1 flex flex-col h-full">
                {/* Header with connection status */}
                <header className="border-b border-slate-800 px-6 py-3 bg-slate-900 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-300">Chat</h2>
                        <div className="flex items-center gap-2 text-xs">
                            {isConnecting && (
                                <span className="text-yellow-400">⏳ Connecting...</span>
                            )}
                            {isConnected && (
                                <span className="text-green-400">✓ Connected</span>
                            )}
                            {error && <span className="text-red-400">✗ Error: {error}</span>}
                        </div>
                    </div>
                </header>

                {/* Messages list */}
                <ChatMessageList messages={messages} />

                {/* Input bar */}
                <ChatInput onSend={sendMessage} disabled={!isConnected} />
            </section>
        </main>
    );
}
