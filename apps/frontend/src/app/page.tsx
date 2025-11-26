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
            <aside className="w-80 border-r border-slate-800/50 p-6 flex flex-col gap-6 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950">
                {/* Logo and title */}
                <div className="pb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                                Error Sidekick
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Cloudflare Edge
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        AI-powered log analysis with intelligent context retrieval
                    </p>
                </div>

                {/* Document upload panel */}
                <DocUploadPanel />

                {/* Session info */}
                <div className="mt-auto pt-6 space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-slate-400">Active Session</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                            {sessionId?.slice(0, 8)}...
                        </div>
                    </div>
                    <button
                        onClick={resetSession}
                        className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-all duration-200 font-medium border border-slate-700 hover:border-slate-600"
                    >
                        New Session
                    </button>
                </div>
            </aside>

            {/* Chat area */}
            <section className="flex-1 flex flex-col h-full">
                {/* Header with connection status */}
                <header className="border-b border-slate-800/50 px-6 py-4 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Conversation</h2>
                        <div className="flex items-center gap-3">
                            {isConnecting && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                    <span className="text-xs text-slate-400 font-medium">Connecting</span>
                                </div>
                            )}
                            {isConnected && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <span className="text-xs text-slate-400 font-medium">Connected</span>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <span className="text-xs text-red-400 font-medium">Error: {error}</span>
                                </div>
                            )}
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
