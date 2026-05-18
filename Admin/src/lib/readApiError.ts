export async function readApiError(res: Response, fallbackMessage: string): Promise<string> {
    const base = `${fallbackMessage} (HTTP ${res.status})`;

    try {
        const data = await res.json();

        if (typeof data === "string") {
            return data || base;
        }

        if (data && typeof data === "object") {
            const obj = data as {
                message?: unknown;
                error?: unknown;
                detail?: unknown;
                errors?: Record<string, unknown>;
            };

            const direct = obj.message ?? obj.error ?? obj.detail;
            if (typeof direct === "string" && direct.trim()) return direct;

            if (obj.errors && typeof obj.errors === "object") {
                const values = Object.values(obj.errors).flatMap((value) => (Array.isArray(value) ? value : [value]));
                const joined = values.filter(Boolean).map(String).join(", ");
                if (joined) return joined;
            }
        }

        return base;
    } catch {
        return base;
    }
}
