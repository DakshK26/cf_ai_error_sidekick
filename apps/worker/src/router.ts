import type { Env } from "./types";

type Handler = (request: Request, env: Env) => Promise<Response>;

export class Router {
    private routes: { method: string; pattern: RegExp; handler: Handler }[] = [];

    on(method: string, path: string | RegExp, handler: Handler) {
        const pattern = typeof path === "string" ? new RegExp(`^${path}$`) : path;
        this.routes.push({ method: method.toUpperCase(), pattern, handler });
    }

    async route(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();

        for (const { method: m, pattern, handler } of this.routes) {
            if (m === method && pattern.test(url.pathname)) {
                return handler(request, env);
            }
        }

        return new Response("Not found", { status: 404 });
    }
}
