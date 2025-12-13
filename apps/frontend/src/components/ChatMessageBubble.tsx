"use client";

import { useState } from "react";
import type { ChatMessageView } from "@/hooks/useChatSession";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageBubbleProps {
    message: ChatMessageView;
}

// Custom code block component with syntax highlighting and copy button
function CodeBlock({ language, children }: { language: string; children: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group/code my-4">
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                {language && (
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {language}
                    </span>
                )}
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-zinc-700/50 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover/code:opacity-100 transition-all"
                    title="Copy code"
                >
                    {copied ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language || "text"}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    paddingTop: "2rem",
                    borderRadius: "0.5rem",
                    fontSize: "13px",
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                }}
                codeTagProps={{
                    style: {
                        fontFamily: "'IBM Plex Mono', monospace",
                    }
                }}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <div className="mb-6 flex justify-end">
                <div className="bg-zinc-800 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                    <div className="whitespace-pre-wrap break-words text-zinc-100 text-[15px] leading-relaxed">
                        {message.content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 group">
            <div className="text-zinc-100 relative">
                <div className="prose prose-invert prose-zinc max-w-none text-[15px] leading-relaxed prose-p:text-zinc-300 prose-p:my-3 prose-headings:text-zinc-100 prose-headings:font-medium prose-h3:text-base prose-strong:text-zinc-100 prose-strong:font-medium prose-li:text-zinc-300 prose-code:text-violet-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown
                        components={{
                            code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");
                                const codeString = String(children).replace(/\n$/, "");
                                
                                // Check if this is a code block (has language) or inline code
                                if (match) {
                                    return (
                                        <CodeBlock language={match[1]}>
                                            {codeString}
                                        </CodeBlock>
                                    );
                                }
                                
                                // Inline code
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            pre({ children }) {
                                // Just return children - the code component handles the wrapper
                                return <>{children}</>;
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                <button
                    onClick={handleCopy}
                    className="absolute -top-1 right-0 p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy all"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}