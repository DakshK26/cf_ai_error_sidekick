export function TypingIndicator() {
    return (
        <div className="mb-6 flex items-start gap-3">
            {/* AI indicator */}
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            
            {/* Typing dots */}
            <div className="flex items-center gap-1.5 py-2">
                <div 
                    className="w-2 h-2 rounded-full bg-accent animate-bounce" 
                    style={{ animationDelay: '0ms', animationDuration: '600ms' }} 
                />
                <div 
                    className="w-2 h-2 rounded-full bg-accent/70 animate-bounce" 
                    style={{ animationDelay: '150ms', animationDuration: '600ms' }} 
                />
                <div 
                    className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" 
                    style={{ animationDelay: '300ms', animationDuration: '600ms' }} 
                />
            </div>
        </div>
    );
}
