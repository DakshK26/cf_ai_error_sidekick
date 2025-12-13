"use client";

interface LandingPageProps {
    onTryDemo: () => void;
}

export function LandingPage({ onTryDemo }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#030712] text-slate-100">
            {/* Hero Section */}
            <section className="min-h-[90vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-6xl">
                <div className="opacity-0 animate-fade-in-up">
                    <p className="text-sm font-medium text-blue-400 mb-4 tracking-wide">
                        A project by Daksh Khanna
                    </p>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight opacity-0 animate-fade-in-up animation-delay-100">
                    I built an AI sidekick that explains
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        Cloudflare errors
                    </span>{" "}
                    in real time.
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed opacity-0 animate-fade-in-up animation-delay-200">
                    Edge-deployed. Rust-powered. Actually useful.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-6 opacity-0 animate-fade-in-up animation-delay-300">
                    <button
                        onClick={onTryDemo}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Try the demo
                    </button>
                    <a
                        href="#how-it-works"
                        className="text-slate-400 hover:text-slate-200 font-medium flex items-center gap-2"
                    >
                        See how it works
                        <span className="text-lg">↓</span>
                    </a>
                </div>

                {/* Tech stack strip - quiet confidence */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 opacity-0 animate-fade-in animation-delay-400">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Built with</p>
                    <div className="flex flex-wrap gap-3">
                        {["Next.js", "Cloudflare Workers", "Rust/WASM", "LangChain", "Vectorize", "Workers AI"].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800/40 border border-slate-700/50 rounded-md font-mono"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem Statement - Short and honest */}
            <section className="px-6 sm:px-12 lg:px-24 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-slate-100">
                            The problem
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed mb-4">
                            Cloudflare error logs don't explain what went wrong.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            You get a stack trace, maybe a timestamp, and a cryptic message. Then you're on your own—digging through docs, searching GitHub issues, guessing.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-slate-100">
                            The solution
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed mb-4">
                            Paste the error. Get context. Understand what broke.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            This tool reads your error, fetches relevant documentation, and explains what happened in plain English. All running at the edge—no cold starts, no waiting.
                        </p>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="how-it-works" className="px-6 sm:px-12 lg:px-24 py-24 bg-slate-900/30">
                <div className="max-w-6xl">
                    <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-slate-100">
                        How it works
                    </h2>
                    <p className="text-slate-400 mb-12 max-w-2xl">
                        A RAG pipeline that actually runs where your code runs.
                    </p>

                    {/* Architecture flow - minimal, clean */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {[
                            { step: "01", title: "Error hits Worker", desc: "User pastes log or error message" },
                            { step: "02", title: "Parsed via WASM", desc: "Rust extracts structured data fast" },
                            { step: "03", title: "Context retrieved", desc: "Vector search finds relevant docs" },
                            { step: "04", title: "Response streamed", desc: "LLM explains what went wrong" },
                        ].map((item) => (
                            <div key={item.step} className="p-5 bg-slate-800/30 border border-slate-700/40 rounded-lg">
                                <span className="text-xs font-mono text-blue-400">{item.step}</span>
                                <h3 className="text-lg font-semibold text-slate-200 mt-2 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Key decisions */}
                    <div className="border-t border-slate-800/50 pt-12">
                        <h3 className="text-lg font-semibold text-slate-200 mb-6">
                            Technical decisions that mattered
                        </h3>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span><strong className="text-slate-300">Rust/WASM for parsing</strong> — JavaScript regex can't reliably parse multi-line stack traces. Rust compiles to WASM, runs in Workers, handles edge cases.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span><strong className="text-slate-300">Vectorize for retrieval</strong> — Cloudflare's vector database means embeddings stay close to compute. No external API calls for context lookup.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span><strong className="text-slate-300">SSE for streaming</strong> — Nobody wants to wait for a full response. Server-Sent Events let answers appear word by word.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span><strong className="text-slate-300">D1 for sessions</strong> — Conversation history persists in Cloudflare's SQLite, so context builds across messages.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Why This Is Hard - Human touch */}
            <section className="px-6 sm:px-12 lg:px-24 py-24 max-w-6xl">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-slate-100">
                    Why this was interesting
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl">
                    Not everything was straightforward. These were the real challenges.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 border border-slate-800/50 rounded-lg bg-slate-900/20">
                        <h3 className="font-semibold text-slate-200 mb-3">
                            Workers have constraints
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            No Node.js. Limited CPU time. Memory caps. You can't just npm install your way out. Every library choice had to account for the edge runtime.
                        </p>
                    </div>
                    <div className="p-6 border border-slate-800/50 rounded-lg bg-slate-900/20">
                        <h3 className="font-semibold text-slate-200 mb-3">
                            Streaming reliably is tricky
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            SSE sounds simple until connections drop, partial messages arrive, or the client reconnects mid-response. Error handling had to be bulletproof.
                        </p>
                    </div>
                    <div className="p-6 border border-slate-800/50 rounded-lg bg-slate-900/20">
                        <h3 className="font-semibold text-slate-200 mb-3">
                            WASM in Workers is underdocumented
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Getting Rust to compile, bind correctly, and run without blowing memory limits took iteration. The tooling exists, but the examples are sparse.
                        </p>
                    </div>
                    <div className="p-6 border border-slate-800/50 rounded-lg bg-slate-900/20">
                        <h3 className="font-semibold text-slate-200 mb-3">
                            RAG quality depends on retrieval
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Bad embeddings = irrelevant context = useless answers. Chunking strategy, embedding model choice, and similarity thresholds all required tuning.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA + Footer */}
            <section className="px-6 sm:px-12 lg:px-24 py-24 border-t border-slate-800/50">
                <div className="max-w-6xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-100 mb-2">
                            See it in action
                        </h2>
                        <p className="text-slate-500">
                            Paste an error. Watch it work.
                        </p>
                    </div>
                    <button
                        onClick={onTryDemo}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Try the demo →
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-24 pt-8 border-t border-slate-800/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/DakshK26/cf_ai_error_sidekick"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            View source on GitHub
                        </a>
                        <span className="text-slate-700">·</span>
                        <a
                            href="https://github.com/DakshK26"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Built by Daksh Khanna
                        </a>
                    </div>
                    <p className="text-xs text-slate-600">
                        2024
                    </p>
                </div>
            </section>
        </div>
    );
}
