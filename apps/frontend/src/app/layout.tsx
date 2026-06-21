import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Incident Sidekick",
    description: "AI debugging assistant for Cloudflare Workers. Paste an error, get an explanation.",
    authors: [{ name: "Daksh Khanna", url: "https://github.com/DakshK26" }],
    icons: {
        icon: '/icon.svg',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0a0a0b',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-dark-900 text-white">{children}</body>
        </html>
    );
}
