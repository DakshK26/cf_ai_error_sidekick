import type { VectorizeIndex, D1Database, Ai } from "@cloudflare/workers-types";

export interface Env {
    // Workers AI
    AI: Ai;

    // KV namespace
    KV_STORE: KVNamespace;

    // D1 database
    DB: D1Database;

    // Vectorize index
    VECTOR_DB: VectorizeIndex;

    // Environment variables
    EMBEDDING_MODEL: string;
    LLM_MODEL: string;
    VECTORIZE_INDEX: string;
}
