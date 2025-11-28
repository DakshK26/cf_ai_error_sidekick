import type { Env } from "./types";
import { querySimilar } from "./vectorStore";
import { chatWithLlmStream } from "./ai";

// Use dynamic import for LangChain to handle potential compatibility issues
type LangChainDocument = {
    pageContent: string;
    metadata: Record<string, unknown>;
};

/**
 * Custom retriever that wraps Cloudflare Vectorize
 * Returns documents in a LangChain-compatible format
 */
async function vectorizeRetriever(
    env: Env,
    query: string,
    k = 4
): Promise<LangChainDocument[]> {
    try {
        const chunks = await querySimilar(env, query, k);

        return chunks.map((c) => ({
            pageContent: c.text,
            metadata: {
                id: c.id,
                source: c.source ?? "unknown",
                score: c.score,
            },
        }));
    } catch (error) {
        // If Vectorize/embedding fails, return empty array (graceful degradation)
        console.warn("[LangChain RAG] Vectorize retrieval failed, continuing without context:", error);
        return [];
    }
}

/**
 * Format retrieved documents into a context string for the prompt
 */
function formatDocsAsContext(docs: LangChainDocument[]): string {
    if (docs.length === 0) {
        return "No relevant context found in knowledge base.";
    }

    return docs
        .map(
            (d, i) =>
                `#${i + 1} (source: ${d.metadata?.source ?? "unknown"}, score: ${typeof d.metadata?.score === 'number' ? d.metadata.score.toFixed(3) : "N/A"})\n${d.pageContent}`
        )
        .join("\n\n");
}

/**
 * LangChain-style prompt template for log analysis
 * This mimics LangChain's PromptTemplate.format() behavior
 */
function formatLogAnalysisPrompt(context: string, log: string): string {
    return [
        "You are an expert debugging assistant helping developers understand logs and errors.",
        "",
        "Given the following log or error trace, explain what is going on and propose next steps.",
        "Be clear, concise, and actionable in your response.",
        "",
        "=== Context from Knowledge Base ===",
        context,
        "",
        "=== Log/Error to Analyze ===",
        log,
        "",
        "=== Your Analysis ===",
        "Provide:",
        "1. What the error/log means",
        "2. Likely root cause",
        "3. Suggested next steps to debug or fix",
    ].join("\n");
}

/**
 * Main LangChain-style RAG function for log/error analysis
 *
 * This implements a RAG pipeline pattern similar to LangChain:
 * 1. Retriever: Cloudflare Vectorize returns LangChain-compatible Documents
 * 2. Prompt Template: Formats context + query into structured prompt
 * 3. LLM: Workers AI generates the response
 *
 * @param env - Cloudflare Worker environment bindings
 * @param logText - The log or error text to analyze
 * @returns AI-generated explanation and next steps
 */
export async function runLangChainRagOnLog(
    env: Env,
    logText: string
): Promise<string> {
    console.log("[LangChain RAG] Step 1: Retrieving from Vectorize...");

    // Step 1: Retrieve relevant documents from Vectorize (LangChain Retriever pattern)
    const docs = await vectorizeRetriever(env, logText, 4);
    console.log("[LangChain RAG] Retrieved", docs.length, "documents");

    const context = formatDocsAsContext(docs);

    // Step 2: Format the prompt (LangChain PromptTemplate pattern)
    console.log("[LangChain RAG] Step 2: Formatting prompt...");
    const formattedPrompt = formatLogAnalysisPrompt(context, logText);

    // Step 3: Call the LLM (LangChain LLM pattern)
    console.log("[LangChain RAG] Step 3: Calling LLM...");
    let output = "";
    await chatWithLlmStream(
        env,
        [
            {
                role: "system",
                content:
                    "You are an AI assistant that explains logs, traces, and errors to help developers debug issues.",
            },
            { role: "user", content: formattedPrompt },
        ],
        (token) => {
            output += token;
        }
    );

    console.log("[LangChain RAG] LLM response complete, length:", output.length);
    return output;
}

/**
 * Streaming version of LangChain RAG for log analysis
 * Allows token-by-token streaming while using the LangChain RAG pattern
 *
 * @param env - Cloudflare Worker environment bindings
 * @param logText - The log or error text to analyze
 * @param onToken - Callback for each streamed token
 * @returns Complete response after streaming
 */
export async function runLangChainRagOnLogStreaming(
    env: Env,
    logText: string,
    onToken: (token: string) => void
): Promise<string> {
    // Step 1: Retrieve relevant documents from Vectorize (LangChain Retriever pattern)
    const docs = await vectorizeRetriever(env, logText, 4);
    const context = formatDocsAsContext(docs);

    // Step 2: Format the prompt (LangChain PromptTemplate pattern)
    const formattedPrompt = formatLogAnalysisPrompt(context, logText);

    // Step 3: Stream LLM response
    let output = "";
    await chatWithLlmStream(
        env,
        [
            {
                role: "system",
                content:
                    "You are an AI assistant that explains logs, traces, and errors to help developers debug issues.",
            },
            { role: "user", content: formattedPrompt },
        ],
        (token) => {
            output += token;
            onToken(token);
        }
    );

    return output;
}

/**
 * Detect if a message looks like a log or error trace
 * Used to decide whether to route through LangChain RAG path
 */
export function looksLikeLog(content: string): boolean {
    // Check for common log patterns
    const logIndicators = [
        /\bERROR\b/i,
        /\bWARN(ING)?\b/i,
        /\bException\b/i,
        /\bStackTrace\b/i,
        /\bFailed\b/i,
        /\bat\s+[\w.]+\(.*:\d+\)/i, // Stack trace pattern: at Module.func(file.ts:123)
        /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/, // ISO timestamp
        /^\[\d{4}/, // [2025-... style timestamps
        /\b(FATAL|CRITICAL|DEBUG|INFO|TRACE)\b/i,
    ];

    const hasLogIndicator = logIndicators.some((pattern) =>
        pattern.test(content)
    );
    const isMultiLine = content.split("\n").length > 3;

    return hasLogIndicator || isMultiLine;
}
