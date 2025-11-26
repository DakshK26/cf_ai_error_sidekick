/**
 * Create a Server-Sent Events (SSE) response stream
 */
export function createSSEStream(
    onStart: (controller: ReadableStreamDefaultController) => void
): Response {
    const stream = new ReadableStream({
        start(controller) {
            onStart(controller);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}

/**
 * Format data as an SSE event
 */
export function sseEvent(data: string): string {
    return `data: ${data}\n\n`;
}

/**
 * Format a comment for SSE stream
 */
export function sseComment(comment: string): string {
    return `: ${comment}\n\n`;
}
