import type { ChatMessageView } from "@/hooks/useChatSession";

interface ChatMessageBubbleProps {
    message: ChatMessageView;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${isUser
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-100 border border-slate-700"
                    }`}
            >
                <div className="text-xs font-semibold mb-1 opacity-70">
                    {isUser ? "You" : "AI Assistant"}
                </div>
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
            </div>
        </div>
    );
}
