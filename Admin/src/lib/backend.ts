export function getBackendUrl(): string {
    // If running on the server (Node), prefer the internal container URL so
    // server-side code in the admin container can reach the backend service
    // by its docker-compose service name. In the browser, use the public
    // NEXT_PUBLIC_API_URL so requests go to the host-mapped port.
    const isServer = typeof window === "undefined";
    if (isServer) {
        const raw = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://backend:5001";
        return raw.replace(/\/$/, "");
    }

    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    return raw.replace(/\/$/, "");
}

export function resolveBackendUrl(pathOrUrl: string): string {
    const value = String(pathOrUrl ?? "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${getBackendUrl()}${value.startsWith("/") ? "" : "/"}${value}`;
}
