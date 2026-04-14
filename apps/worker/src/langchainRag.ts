import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseRetriever, type BaseRetrieverInput } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";

import type { Env } from "./types";
import { querySimilar } from "./vectorStore";
import { chatWithLlmStream } from "./ai";

/**
 * Custom retriever wrapping Cloudflare Vectorize.
 * Extends LangChain's BaseRetriever so it plugs into any chain or runnable.
 */
class VectorizeRetriever extends BaseRetriever {
    lc_namespace = ["cf_ai_error_sidekick", "retrievers"];

    private env: Env;
    private k: number;

    constructor(env: Env, k = 4, fields?: BaseRetrieverInput) {
        super(fields ?? {});
        this.env = env;
        this.k = k;
    }

    async _getRelevantDocuments(query: string): Promise<Document[]> {
        try {
            const chunks = await querySimilar(this.env, query, this.k);
            return chunks.map(
                (c) =>
                    new Document({
                        pageContent: c.text,
                        metadata: {
                            id: c.id,
                            source: c.source ?? "unknown",
                            score: c.score,
                        },
                    })
            );
        } catch (error) {
            console.warn(
                "[LangChain RAG] Vectorize retrieval failed, continuing without context:",
                error
            );
            return [];
        }
    }
}

function formatDocs(docs: Document[]): string {
    if (docs.length === 0) {
        return "No relevant context found in knowledge base.";
    }
    return docs
        .map(
            (d, i) =>
                `#${i + 1} (source: ${d.metadata?.source ?? "unknown"}, score: ${typeof d.metadata?.score === "number" ? d.metadata.score.toFixed(3) : "N/A"})\n${d.pageContent}`
        )
        .join("\n\n");
}

const LOG_ANALYSIS_PROMPT = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are an expert debugging assistant that explains logs, traces, and errors to help developers debug issues.",
    ],
    [
        "human",
        `Given the following log or error trace, explain what is going on and propose next steps.
Be clear, concise, and actionable in your response.

=== Context from Knowledge Base ===
{context}

=== Log/Error to Analyze ===
{log}

=== Your Analysis ===
Provide:
1. What the error/log means
2. Likely root cause
3. Suggested next steps to debug or fix`,
    ],
]);

/**
 * Build retrieval chain: query → VectorizeRetriever → formatDocs → context string
 */
function buildRetrievalChain(env: Env) {
    const retriever = new VectorizeRetriever(env);

    return RunnableSequence.from([retriever, formatDocs]);
}

/**
 * Convert LangChain BaseMessages to the {role, content} format Workers AI expects.
 */
function toWorkerMessages(
    msgs: Awaited<ReturnType<typeof LOG_ANALYSIS_PROMPT.formatMessages>>
) {
    return msgs.map((m) => ({
        role: (m._getType() === "system" ? "system" : "user") as
            | "system"
            | "user"
            | "assistant",
        content:
            typeof m.content === "string"
                ? m.content
                : JSON.stringify(m.content),
    }));
}

/**
 * Main LangChain RAG pipeline for log/error analysis.
 *
 * Chain: VectorizeRetriever → formatDocs → ChatPromptTemplate → Workers AI LLM
 */
export async function runLangChainRagOnLog(
    env: Env,
    logText: string
): Promise<string> {
    console.log("[LangChain RAG] Running retrieval chain...");
    const context = await buildRetrievalChain(env).invoke(logText);

    console.log("[LangChain RAG] Formatting prompt via ChatPromptTemplate...");
    const messages = await LOG_ANALYSIS_PROMPT.formatMessages({
        context,
        log: logText,
    });

    console.log("[LangChain RAG] Streaming LLM response...");
    let output = "";
    await chatWithLlmStream(env, toWorkerMessages(messages), (token) => {
        output += token;
    });

    console.log("[LangChain RAG] Complete, length:", output.length);
    return output;
}

/**
 * Streaming variant — retrieval + prompt formatting use LangChain;
 * tokens stream back via onToken callback.
 */
export async function runLangChainRagOnLogStreaming(
    env: Env,
    logText: string,
    onToken: (token: string) => void
): Promise<string> {
    const context = await buildRetrievalChain(env).invoke(logText);

    const messages = await LOG_ANALYSIS_PROMPT.formatMessages({
        context,
        log: logText,
    });

    let output = "";
    await chatWithLlmStream(env, toWorkerMessages(messages), (token) => {
        output += token;
        onToken(token);
    });

    return output;
}

/** Detect if a message looks like a log or error trace. */
export function looksLikeLog(content: string): boolean {
    const logIndicators = [
        /\bERROR\b/i,
        /\bWARN(ING)?\b/i,
        /\bException\b/i,
        /\bStackTrace\b/i,
        /\bFailed\b/i,
        /\bat\s+[\w.]+\(.*:\d+\)/i,
        /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/,
        /^\[\d{4}/,
        /\b(FATAL|CRITICAL|DEBUG|INFO|TRACE)\b/i,
    ];

    return (
        logIndicators.some((pattern) => pattern.test(content)) ||
        content.split("\n").length > 3
    );
}
