import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CF AI Error Sidekick",
    description: "Edge-hosted AI assistant for log and error analysis",
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
