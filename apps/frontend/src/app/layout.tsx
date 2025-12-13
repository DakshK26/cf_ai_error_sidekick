import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Error Sidekick",
    description: "AI debugging assistant for Cloudflare Workers. Paste an error, get an explanation.",
    authors: [{ name: "Daksh Khanna", url: "https://github.com/DakshK26" }],
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#18181b',
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
