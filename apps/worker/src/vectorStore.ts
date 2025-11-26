import type { Env } from "./types";
import { embedText } from "./ai";
import type { RetrievedContextChunk } from "@cf_ai/shared";

/**
 * Upsert documents into Vectorize for semantic search
 * @param env - Worker environment with VECTOR_DB binding
 * @param docs - Array of documents with id, text, and optional metadata
 */
export async function upsertDocuments(
    env: Env,
    docs: { id: string; text: string; metadata?: Record<string, string> }[]
) {
    // Generate embeddings for all document texts
    const embeddings = await embedText(env, docs.map(d => d.text));

    // Build points array for Vectorize
    const points = docs.map((doc, idx) => ({
        id: doc.id,
        values: embeddings[idx],
        metadata: {
            text: doc.text,
            ...(doc.metadata || {})
        }
    }));

    // Upsert to Vectorize
    await env.VECTOR_DB.upsert(points);
}

/**
 * Query Vectorize for similar documents using semantic search
 * @param env - Worker environment with VECTOR_DB binding
 * @param query - Query text to search for
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Array of retrieved context chunks with scores
 */
export async function querySimilar(
    env: Env,
    query: string,
    limit = 5
): Promise<RetrievedContextChunk[]> {
    // Generate embedding for the query
    const [embedding] = await embedText(env, [query]);

    // Query Vectorize for similar vectors
    const results = await env.VECTOR_DB.query(embedding, {
        topK: limit,
        returnMetadata: true
    });

    const matches = (results.matches ?? []) as any[];

    // Map results to RetrievedContextChunk format
    return matches.map(m => ({
        id: m.id,
        text: m.metadata?.text ?? "",
        source: m.metadata?.source,
        score: m.score
    }));
}
