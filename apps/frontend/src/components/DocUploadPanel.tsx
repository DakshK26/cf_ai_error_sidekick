"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";

export function DocUploadPanel() {
    const [docText, setDocText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [docsUpserted, setDocsUpserted] = useState(0);

    const handleUpload = async () => {
        if (!docText.trim()) {
            setUploadStatus({
                type: "error",
                message: "Please enter some text to upload",
            });
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);

        try {
            const response = await fetch(apiUrl("/api/docs/upload"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docs: [{ text: docText, source: "user-panel" }],
                }),
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadStatus({
                type: "success",
                message: `Successfully upserted ${result.upserted?.length || 0} document(s)`,
            });
            setDocsUpserted((prev) => prev + (result.upserted?.length || 0));
            setDocText("");
        } catch (error) {
            setUploadStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Upload failed",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                    Add context
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Paste docs or error patterns to improve answers
                </p>
            </div>      <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste documentation or error patterns..."
                className="w-full bg-slate-800/40 text-slate-100 border border-slate-700/40 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all placeholder:text-slate-600 touch-manipulation"
                rows={4}
            />      <button
                onClick={handleUpload}
                disabled={isUploading || !docText.trim()}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
                {isUploading ? "Uploading..." : "Add to index"}
            </button>            {uploadStatus && (
                <div
                    className={`text-xs px-3 py-2 rounded ${uploadStatus.type === "success"
                        ? "bg-green-900/50 text-green-300 border border-green-700"
                        : "bg-red-900/50 text-red-300 border border-red-700"
                        }`}
                >
                    {uploadStatus.message}
                </div>
            )}

            <div className="text-xs text-slate-500 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                    <span>Docs upserted:</span>
                    <span className="font-semibold text-slate-400">{docsUpserted}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Vector index:</span>
                    <span className="font-mono text-slate-400">error-index</span>
                </div>
            </div>
        </div>
    );
}
