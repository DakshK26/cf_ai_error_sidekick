import type { Env } from "../types/env";

/**
 * Verify that all required Cloudflare bindings are present.
 * Logs warnings for any missing bindings during development.
 */
export function verifyBindings(env: Env): void {
    if (!env.VECTOR_DB) {
        console.log("⚠️ VECTOR_DB binding missing");
    }
    if (!env.DB) {
        console.log("⚠️ D1 binding missing");
    }
    if (!env.KV_STORE) {
        console.log("⚠️ KV store binding missing");
    }
    if (!env.AI) {
        console.log("⚠️ Workers AI binding missing");
    }
    // Workflow binding will be added in Phase 7
    // if (!env.DOC_INGEST_WORKFLOW) {
    //     console.log("⚠️ Workflow binding missing");
    // }

    // Log success if all Phase 1 bindings are present
    const allPresent = env.VECTOR_DB && env.DB && env.KV_STORE && env.AI;
    if (allPresent) {
        console.log("✅ All Phase 1 bindings verified");
    }
}
