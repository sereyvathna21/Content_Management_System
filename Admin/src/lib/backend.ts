export function getBackendUrl(): string {
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    return raw.replace(/\/$/, "");
}

export function resolveBackendUrl(pathOrUrl: string): string {
    const value = String(pathOrUrl ?? "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${getBackendUrl()}${value.startsWith("/") ? "" : "/"}${value}`;
}
