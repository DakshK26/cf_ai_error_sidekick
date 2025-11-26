import type { ChatMessageView } from "@/hooks/useChatSession";

interface ChatMessageBubbleProps {
    message: ChatMessageView;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 px-2`}>
            <div
                className={`max-w-2xl px-5 py-3.5 rounded-xl ${isUser
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-800/50 text-slate-100 border border-slate-700/50 backdrop-blur-sm"
                    }`}
            >
                <div className={`text-[10px] font-semibold mb-2 tracking-wide uppercase ${isUser ? "text-blue-100" : "text-slate-400"
                    }`}>
                    {isUser ? "You" : "Assistant"}
                </div>
                <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
            </div>
        </div>
    );
}
