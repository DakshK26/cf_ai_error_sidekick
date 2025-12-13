export function TypingIndicator() {
    return (
        <div className="flex justify-start mb-4 px-2">
            <div className="max-w-2xl px-5 py-3.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
                <div className="text-[10px] font-medium mb-2 tracking-wide uppercase text-slate-500">
                    Sidekick
                </div>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
