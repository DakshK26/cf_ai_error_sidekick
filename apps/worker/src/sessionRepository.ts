import type { Env } from "./types";
import type { ChatMessage } from "@cf_ai/shared";

export interface Session {
    id: string;
    createdAt: string;
    lastActiveAt: string;
    metadata?: any;
}

export class SessionRepository {
    private db: D1Database;

    constructor(env: Env) {
        this.db = env.DB;
    }

    async ensureSession(sessionId?: string): Promise<Session> {
        if (!sessionId) {
            const newId = crypto.randomUUID();
            const now = new Date().toISOString();
            await this.db
                .prepare(
                    `INSERT INTO sessions (id, created_at, last_active_at, metadata)
           VALUES (?, ?, ?, ?)`
                )
                .bind(newId, now, now, null)
                .run();

            return { id: newId, createdAt: now, lastActiveAt: now };
        }

        // try to fetch existing session
        const row = await this.db
            .prepare(
                `SELECT id, created_at, last_active_at, metadata
         FROM sessions
         WHERE id = ?`
            )
            .bind(sessionId)
            .first<{
                id: string;
                created_at: string;
                last_active_at: string;
                metadata: string | null;
            }>();

        const now = new Date().toISOString();

        if (!row) {
            // create new session with provided id
            await this.db
                .prepare(
                    `INSERT INTO sessions (id, created_at, last_active_at, metadata)
           VALUES (?, ?, ?, ?)`
                )
                .bind(sessionId, now, now, null)
                .run();

            return {
                id: sessionId,
                createdAt: now,
                lastActiveAt: now,
            };
        }

        // update last_active_at
        await this.db
            .prepare(`UPDATE sessions SET last_active_at = ? WHERE id = ?`)
            .bind(now, row.id)
            .run();

        return {
            id: row.id,
            createdAt: row.created_at,
            lastActiveAt: now,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        };
    }

    async saveMessage(sessionId: string, msg: ChatMessage): Promise<void> {
        const now = msg.timestamp ?? new Date().toISOString();
        const id = crypto.randomUUID();

        await this.db
            .prepare(
                `INSERT INTO messages (id, session_id, role, content, created_at)
         VALUES (?, ?, ?, ?, ?)`
            )
            .bind(id, sessionId, msg.role, msg.content, now)
            .run();
    }

    async getRecentMessages(
        sessionId: string,
        limit = 20
    ): Promise<ChatMessage[]> {
        const result = await this.db
            .prepare(
                `SELECT role, content, created_at
         FROM messages
         WHERE session_id = ?
         ORDER BY created_at DESC
         LIMIT ?`
            )
            .bind(sessionId, limit)
            .all<{
                role: "user" | "assistant" | "system";
                content: string;
                created_at: string;
            }>();

        const rows = result.results ?? [];

        // return in chronological order
        return rows
            .reverse()
            .map((r) => ({
                role: r.role,
                content: r.content,
                timestamp: r.created_at,
            }));
    }
}
