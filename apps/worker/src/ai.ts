import type { Env } from "./types";

/**
 * Generate embeddings for one or more text inputs using Workers AI
 * @param env - Worker environment with AI binding
 * @param texts - Array of text strings to embed
 * @returns Array of embedding vectors (768 dimensions for bge-base-en-v1.5)
 */
export async function embedText(env: Env, texts: string[]): Promise<number[][]> {
    const response = await env.AI.run(env.EMBEDDING_MODEL as any, {
        text: texts
    });

    // Workers AI embeddings return { data: [[...]], shape: [n, 768] }
    // or { data: [{ values: [...] }] } depending on the model
    const data = (response as any).data;

    if (!data) {
        console.error("No data in embedding response:", response);
        throw new Error("Invalid embedding response from Workers AI");
    }

    // Handle array of arrays format
    if (Array.isArray(data) && Array.isArray(data[0])) {
        return data;
    }

    // Handle object format with values or embedding property
    if (Array.isArray(data) && typeof data[0] === 'object') {
        return data.map((d: any) => d.values || d.embedding || d);
    }

    throw new Error("Unexpected embedding response format");
}

/**
 * Chat with LLM using streaming response
 * @param env - Worker environment with AI binding
 * @param messages - Array of chat messages (system, user, assistant)
 * @param onToken - Callback function called for each token streamed
 */
export async function chatWithLlmStream(
    env: Env,
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    onToken: (token: string) => void
): Promise<void> {
    // Workers AI supports streaming for LLM responses
    const response = await env.AI.run(env.LLM_MODEL as any, {
        messages,
        stream: true
    });

    // Check if response is a ReadableStream
    if (response && typeof response === 'object' && 'getReader' in response) {
        const reader = (response as ReadableStream).getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages (format: "data: {...}\n\n")
                const lines = buffer.split('\n');
                buffer = lines.pop() || ""; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6); // Remove "data: " prefix

                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const token = parsed.response || parsed.token || parsed.content || "";
                            if (token) {
                                onToken(token);
                            }
                        } catch (e) {
                            // Ignore parse errors for malformed chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    } else {
        // Fallback to async iterator approach
        for await (const chunk of response as any) {
            const token = chunk.response ?? chunk.token ?? chunk.content ?? chunk.text ?? "";
            if (token) {
                onToken(token);
            }
        }
    }
}
