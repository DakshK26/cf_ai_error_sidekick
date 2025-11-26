// Cloudflare Workers environment bindings
export interface Env {
    // Variables
    EMBEDDING_MODEL: string;
    LLM_MODEL: string;
    VECTORIZE_INDEX: string;

    // KV namespace
    KV_STORE: KVNamespace;

    // D1 database
    DB: D1Database;

    // Vectorize index
    VECTOR_DB: VectorizeIndex;

    // Workers AI
    AI: Ai;

    // Workflows (will be added in Phase 7)
    // DOC_INGEST_WORKFLOW: Workflow;

    // Durable Objects (will be added in Phase 3.5)
    // ERROR_AGENT: DurableObjectNamespace;
}
