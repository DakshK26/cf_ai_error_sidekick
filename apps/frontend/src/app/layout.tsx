import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Error Sidekick — Edge-Deployed AI for Cloudflare Debugging",
    description: "A RAG-powered debugging assistant that explains Cloudflare errors in real time. Built with Rust/WASM, Workers AI, and Vectorize. By Daksh Khanna.",
    keywords: ["Cloudflare Workers", "RAG", "AI", "Rust", "WASM", "Edge Computing", "Debugging"],
    authors: [{ name: "Daksh Khanna", url: "https://github.com/DakshK26" }],
    openGraph: {
        title: "Error Sidekick — Edge-Deployed AI for Cloudflare Debugging",
        description: "A RAG-powered debugging assistant built with Rust/WASM, Workers AI, and Vectorize.",
        type: "website",
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#030712',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
