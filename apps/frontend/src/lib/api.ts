const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "http://localhost:8787";

export function apiUrl(path: string) {
    if (!path.startsWith("/")) path = `/${path}`;
    return `${API_BASE}${path}`;
}
