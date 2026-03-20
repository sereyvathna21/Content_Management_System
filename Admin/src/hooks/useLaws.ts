"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { getSession } from "next-auth/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getDefaultApiBase = (): string => {
    if (typeof window === "undefined") {
        return (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:5001";
    }
    const env = (process.env.NEXT_PUBLIC_API_URL as string) || "";
    if (env) return env;
    return window.location.protocol === "https:"
        ? "https://localhost:7177"
        : "http://localhost:5001";
};

const API_BASE = getDefaultApiBase();

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (typeof window === "undefined") return {};
    try {
        const session = await getSession();
        const token = (session as any)?.accessToken ?? null;
        return token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" };
    } catch {
        return { "Content-Type": "application/json" };
    }
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Law = {
    id: string;
    title: string;
    description?: string;
    category: string;
    date?: string;
    pdfUrl: string;
    pdfUrlKh?: string;
    createdAt: string;
    updatedAt?: string;
};

export type CreateLawPayload = {
    title: string;
    description?: string;
    category: string;
    date?: string;
    pdfUrl: string;
    pdfUrlKh?: string;
};

export type UpdateLawPayload = CreateLawPayload;

// ---------------------------------------------------------------------------
// Raw mapper
// ---------------------------------------------------------------------------

const toLaw = (i: Record<string, unknown>): Law => ({
    id: String(i.id),
    title: String(i.title ?? ""),
    description: i.description ? String(i.description) : undefined,
    category: String(i.category ?? ""),
    date: i.date ? String(i.date) : undefined,
    pdfUrl: String(i.pdfUrl ?? ""),
    pdfUrlKh: i.pdfUrlKh ? String(i.pdfUrlKh) : undefined,
    createdAt: String(i.createdAt ?? ""),
    updatedAt: i.updatedAt ? String(i.updatedAt) : undefined,
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLaws() {
    const [all, setAll] = useState<Law[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [query, setQueryState] = useState("");
    const [categoryFilter, setCategoryFilterState] = useState("All");
    const [page, setPageState] = useState(1);
    const pageSize = 10;

    // ── derived filtered list ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        let result = all;
        if (categoryFilter !== "All") {
            result = result.filter((l) => l.category === categoryFilter);
        }
        if (query.trim()) {
            const lower = query.toLowerCase();
            result = result.filter(
                (l) =>
                    l.title.toLowerCase().includes(lower) ||
                    l.category.toLowerCase().includes(lower) ||
                    (l.description ?? "").toLowerCase().includes(lower)
            );
        }
        return result;
    }, [all, query, categoryFilter]);

    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const laws = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    // ── categories derived from data ──────────────────────────────────────
    const categories = useMemo(() => {
        const cats = Array.from(new Set(all.map((l) => l.category)));
        return ["All", ...cats];
    }, [all]);

    // ── API: load all laws ────────────────────────────────────────────────
    const loadLaws = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/law`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Record<string, unknown>[] = await res.json();
            setAll((data || []).map(toLaw));
        } catch (err) {
            console.error("[useLaws] loadLaws failed:", err);
            setError("Failed to load laws.");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── API: create ───────────────────────────────────────────────────────
    const createLaw = useCallback(async (payload: CreateLawPayload): Promise<Law | null> => {
        setSaving(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    category: payload.category,
                    date: payload.date || null,
                    pdfUrl: payload.pdfUrl,
                    pdfUrlKh: payload.pdfUrlKh || null,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Record<string, unknown> = await res.json();
            const created = toLaw(data);
            setAll((prev) => [created, ...prev]);
            return created;
        } catch (err) {
            console.error("[useLaws] createLaw failed:", err);
            setError("Failed to create law.");
            return null;
        } finally {
            setSaving(false);
        }
    }, []);

    // ── API: update ───────────────────────────────────────────────────────
    const updateLaw = useCallback(async (id: string, payload: UpdateLawPayload): Promise<boolean> => {
        setSaving(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    category: payload.category,
                    date: payload.date || null,
                    pdfUrl: payload.pdfUrl,
                    pdfUrlKh: payload.pdfUrlKh || null,
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setAll((prev) =>
                prev.map((l) =>
                    l.id === id
                        ? {
                              ...l,
                              ...payload,
                              updatedAt: new Date().toISOString(),
                          }
                        : l
                )
            );
            return true;
        } catch (err) {
            console.error("[useLaws] updateLaw failed:", err);
            setError("Failed to update law.");
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    // ── API: delete ───────────────────────────────────────────────────────
    const deleteLaw = useCallback(async (id: string): Promise<boolean> => {
        let snapshot: Law[] = [];
        setAll((prev) => {
            snapshot = prev;
            return prev.filter((l) => l.id !== id);
        });
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law/${id}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
        } catch (err) {
            console.error("[useLaws] deleteLaw failed — rolling back:", err);
            setAll(snapshot);
            setError("Failed to delete law.");
            return false;
        }
    }, []);

    // ── filter helpers ────────────────────────────────────────────────────
    const setQuery = useCallback((q: string) => {
        setQueryState(q);
        setPageState(1);
    }, []);

    const setCategoryFilter = useCallback((cat: string) => {
        setCategoryFilterState(cat);
        setPageState(1);
    }, []);

    const setPage = useCallback(
        (p: number) => {
            setPageState(Math.max(1, Math.min(p, totalPages)));
        },
        [totalPages]
    );

    return {
        laws,
        all,
        loading,
        saving,
        error,
        categories,
        query,
        categoryFilter,
        page,
        totalPages,
        totalCount,
        loadLaws,
        createLaw,
        updateLaw,
        deleteLaw,
        setQuery,
        setCategoryFilter,
        setPage,
    } as const;
}
