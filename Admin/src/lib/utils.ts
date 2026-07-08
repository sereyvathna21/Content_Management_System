import { SectionMedia } from "../types/social.types";

export const IMAGE_POSITIONS = [
    { value: 0, label: "Top" },
    { value: 1, label: "Bottom" },
    { value: 2, label: "Left" },
    { value: 3, label: "Right" },
    { value: 4, label: "Full" },
];

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_LABEL = "5 MB";

export function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function normalizeText(value: string) {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

export function resolveMediaUrl(backendUrl: string, url?: string) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${backendUrl}${url}`;
    return `${backendUrl}/${url}`;
}

export function getNextSortOrder(media: SectionMedia[]) {
    if (!media.length) return 0;
    return Math.max(...media.map((item) => item.sortOrder)) + 1;
}

export function getPositionLabel(value: number) {
    return IMAGE_POSITIONS.find((p) => p.value === value)?.label ?? "Full";
}

/** Convert a position value (number or string enum name) to its numeric value */
export function parsePosition(value: string | number | undefined | null): number {
    if (value === undefined || value === null) return 4; // default Full
    if (typeof value === "number") return value;
    const map: Record<string, number> = {
        "top": 0, "bottom": 1, "left": 2, "right": 3, "full": 4,
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
    };
    return map[String(value).toLowerCase()] ?? 4;
}

/** Convert a language value (number or string enum name) to its string key */
export function parseLanguage(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return "KH";
    const v = String(value).toUpperCase();
    if (v === "EN" || v === "1") return "EN";
    return "KH";
}
