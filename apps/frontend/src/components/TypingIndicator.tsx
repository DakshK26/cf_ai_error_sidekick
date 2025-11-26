export function TypingIndicator() {
    return (
        <div className="flex justify-start mb-4 px-2">
            <div className="max-w-2xl px-5 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-[10px] font-semibold mb-2 tracking-wide uppercase text-slate-400">
                    Assistant
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
