"use client";
import { useCallback, useMemo, useState } from "react";
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
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Law = {
    id: string;
    titleEn: string;
    titleKh: string;
    descriptionEn?: string;
    descriptionKh?: string;
    category: string;
    date?: string;
    pdfEn?: string;
    pdfKh?: string;
    isPublished: boolean;
    createdAt: string;
};

export type LawCreateInput = {
    titleEn: string;
    titleKh: string;
    descriptionEn?: string;
    descriptionKh?: string;
    category: string;
    date?: string;
    isPublished?: boolean;
};

export type LawUpdateInput = LawCreateInput & {
    pdfEn?: string;
    pdfKh?: string;
};

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

const toLaw = (i: Record<string, unknown>): Law => ({
    id: String(i.id),
    titleEn: (i.titleEn as string) || "",
    titleKh: (i.titleKh as string) || "",
    descriptionEn: i.descriptionEn as string | undefined,
    descriptionKh: i.descriptionKh as string | undefined,
    category: (i.category as string) || "",
    date: i.date as string | undefined,
    pdfEn: i.pdfEn as string | undefined,
    pdfKh: i.pdfKh as string | undefined,
    isPublished: Boolean(i.isPublished),
    createdAt: (i.createdAt as string) || "",
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLaws() {
    const [all, setAll] = useState<Law[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState<Law | null>(null);

    // filter state
    const [query, setQuery] = useState<string>("");
    const [categoryFilter, setCategoryFilterState] = useState<string>("all");

    // pagination
    const [page, setPageState] = useState<number>(1);
    const [pageSize] = useState<number>(10);

    // derived: filtered list
    const filteredAll = useMemo<Law[]>(() => {
        let result = all;
        if (query.trim()) {
            const lower = query.toLowerCase();
            result = result.filter((l) =>
                `${l.titleEn} ${l.titleKh} ${l.category}`.toLowerCase().includes(lower)
            );
        }
        if (categoryFilter !== "all") {
            result = result.filter((l) => l.category === categoryFilter);
        }
        return result;
    }, [all, query, categoryFilter]);

    const laws = useMemo<Law[]>(() => {
        const start = (page - 1) * pageSize;
        return filteredAll.slice(start, start + pageSize);
    }, [filteredAll, page, pageSize]);

    const totalCount = filteredAll.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    // load all laws
    const loadLaws = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/law?page=1&pageSize=500`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body: { items: Record<string, unknown>[] } = await res.json();
            setAll((body.items || []).map(toLaw));
        } catch (err) {
            console.error("[useLaws] loadLaws failed:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // create a law (no PDFs yet — upload separately)
    const createLaw = useCallback(async (input: LawCreateInput): Promise<Law> => {
        setSaving(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `HTTP ${res.status}`);
            }
            const raw: Record<string, unknown> = await res.json();
            const law = toLaw(raw);
            setAll((prev) => [law, ...prev]);
            return law;
        } finally {
            setSaving(false);
        }
    }, []);

    // update a law
    const updateLaw = useCallback(async (id: string, input: LawUpdateInput): Promise<Law> => {
        setSaving(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law/${id}`, {
                method: "PUT",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `HTTP ${res.status}`);
            }
            const raw: Record<string, unknown> = await res.json();
            const updated = toLaw(raw);
            setAll((prev) => prev.map((l) => (l.id === id ? updated : l)));
            if (selected?.id === id) setSelected(updated);
            return updated;
        } finally {
            setSaving(false);
        }
    }, [selected]);

    // delete a law
    const removeLaw = useCallback(async (id: string): Promise<void> => {
        let snapshot: Law[] = [];
        setAll((prev) => { snapshot = prev; return prev.filter((l) => l.id !== id); });
        if (selected?.id === id) setSelected(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/law/${id}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
            console.warn("[useLaws] removeLaw failed — rolling back:", err);
            setAll(snapshot);
            throw err;
        }
    }, [selected]);

    // upload PDF for a law
    const uploadPdf = useCallback(async (id: string, lang: "en" | "kh", file: File): Promise<Law> => {
        setSaving(true);
        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch(`${API_BASE}/api/law/${id}/upload-pdf?lang=${lang}`, {
                method: "POST",
                headers,
                body: formData,
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || `HTTP ${res.status}`);
            }
            const raw: Record<string, unknown> = await res.json();
            const updated = toLaw(raw);
            setAll((prev) => prev.map((l) => (l.id === id ? updated : l)));
            if (selected?.id === id) setSelected(updated);
            return updated;
        } finally {
            setSaving(false);
        }
    }, [selected]);

    // delete PDF for a law
    const deletePdf = useCallback(async (id: string, lang: "en" | "kh"): Promise<Law> => {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/api/law/${id}/pdf?lang=${lang}`, {
            method: "DELETE",
            headers,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: Record<string, unknown> = await res.json();
        const updated = toLaw(raw);
        setAll((prev) => prev.map((l) => (l.id === id ? updated : l)));
        if (selected?.id === id) setSelected(updated);
        return updated;
    }, [selected]);

    // select
    const selectLaw = useCallback((id: string | null) => {
        if (!id) return setSelected(null);
        setSelected(all.find((l) => l.id === id) ?? null);
    }, [all]);

    // filter helpers
    const filterLaws = useCallback((q: string) => {
        setQuery(q);
        setPageState(1);
    }, []);

    const setCategoryFilter = useCallback((cat: string) => {
        setCategoryFilterState(cat);
        setPageState(1);
    }, []);

    const clearFilters = useCallback(() => {
        setQuery("");
        setCategoryFilterState("all");
        setPageState(1);
    }, []);

    const setPage = useCallback((p: number) => {
        setPageState(Math.max(1, Math.min(p, totalPages)));
    }, [totalPages]);

    return {
        laws,
        all,
        loading,
        saving,
        selected,
        loadLaws,
        createLaw,
        updateLaw,
        removeLaw,
        uploadPdf,
        deletePdf,
        selectLaw,
        query,
        filterLaws,
        categoryFilter,
        setCategoryFilter,
        clearFilters,
        page,
        totalPages,
        totalCount,
        setPage,
    } as const;
}
