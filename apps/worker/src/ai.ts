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

    // Workers AI embeddings return { data: [{ embedding: [...] }, ...] }
    const data = (response as any).data ?? [];
    return data.map((d: any) => d.embedding as number[]);
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
    const stream = await env.AI.run(env.LLM_MODEL as any, {
        messages,
        stream: true
    });

    // Iterate through the stream and call onToken for each chunk
    for await (const chunk of stream as any) {
        const token = chunk.response ?? chunk.token ?? "";
        if (token) {
            onToken(token);
        }
    }
}
