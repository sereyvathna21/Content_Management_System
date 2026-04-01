"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";
import { getSignalRConnection } from "../lib/signalr";

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
    // Try to read access token from NextAuth session (stored in cookie)
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

export type Contact = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
    replied: boolean;
    repliedAt: string | null;
};

type StatusFilter = "all" | "read" | "unread";

// ---------------------------------------------------------------------------
// Raw mapper — keeps API shape separate from UI type
// ---------------------------------------------------------------------------

const toContact = (i: Record<string, unknown>): Contact => ({
    id: String(i.id),
    name: i.name as string,
    email: i.email as string,
    subject: i.subject as string,
    message: i.message as string,
    createdAt: i.createdAt as string,
    read: Boolean(i.read),
    replied: Boolean(i.replied),
    repliedAt: (i.repliedAt as string) ?? null,
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useContacts() {
    // ── raw source of truth ──────────────────────────────────────────────
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Contact | null>(null);

    // ── filter state ─────────────────────────────────────────────────────
    const [query, setQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // ── pagination state ─────────────────────────────────────────────────
    const [page, setPageState] = useState<number>(1);
    const [pageSize, setPageSizeState] = useState<number>(10);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    // ── keep page in bounds when filters shrink the result set ────────────
    useEffect(() => {
        if (page > totalPages) {
            setPageState(totalPages);
        }
    }, [page, totalPages]);

    // ── keep selected contact in sync when `all` changes ─────────────────
    useEffect(() => {
        if (!selected) return;
        const fresh = contacts.find((c) => c.id === selected.id);
        if (fresh && fresh !== selected) setSelected(fresh);
        if (!fresh) setSelected(null);
    }, [contacts, selected]);

    // ── SignalR: real-time events ─────────────────────────────────────────
    // Handlers are stored in refs so they are never stale and don't need to
    // be re-registered on every render.
    const createdHandlerRef = useRef<((c: Record<string, unknown>) => void) | null>(null);
    const deletedHandlerRef = useRef<((payload: Record<string, unknown>) => void) | null>(null);
    const readHandlerRef = useRef<((payload: Record<string, unknown>) => void) | null>(null);
    const repliedHandlerRef = useRef<((payload: Record<string, unknown>) => void) | null>(null);
    const loadContactsRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const hubUrl = `${API_BASE.replace(/\/$/, "")}/hubs/contact`;
        let conn: Awaited<ReturnType<typeof getSignalRConnection>> | null = null;
        let mounted = true;

        const onCreated = (c: Record<string, unknown>) => {
            const item = toContact(c);
            console.info("[useContacts] ContactCreated:", item);
            if (loadContactsRef.current) loadContactsRef.current();
        };

        const onDeleted = (payload: Record<string, unknown>) => {
            const id = String(payload.id ?? payload);
            console.info("[useContacts] ContactDeleted:", id);
            if (loadContactsRef.current) loadContactsRef.current();
        };

        const onReadToggled = (payload: Record<string, unknown>) => {
            const id = String(payload.id);
            const read = Boolean(payload.read);
            console.info("[useContacts] ContactReadToggled:", id, read);
            setContacts((prev) =>
                prev.map((c) => (c.id === id ? { ...c, read } : c))
            );
        };

        const onReplied = (payload: Record<string, unknown>) => {
            const id = String(payload.id);
            const replied = Boolean(payload.replied);
            const repliedAt = (payload.repliedAt as string) ?? null;
            const read = payload.read == null ? undefined : Boolean(payload.read);
            console.info("[useContacts] ContactReplied:", id, replied);
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, replied, repliedAt, read: read ?? c.read }
                        : c
                )
            );
        };

        createdHandlerRef.current = onCreated;
        deletedHandlerRef.current = onDeleted;
        readHandlerRef.current = onReadToggled;
        repliedHandlerRef.current = onReplied;

        (async () => {
            try {
                conn = await getSignalRConnection(hubUrl);
                if (!mounted || !conn) return;
                console.debug("[useContacts] SignalR connected:", hubUrl);
                conn.on("ContactCreated", onCreated);
                conn.on("ContactDeleted", onDeleted);
                conn.on("ContactReadToggled", onReadToggled);
                conn.on("ContactReplied", onReplied);
            } catch (err) {
                console.warn("[useContacts] SignalR connection failed:", err);
            }
        })();

        return () => {
            mounted = false;
            if (conn) {
                try {
                    if (createdHandlerRef.current) conn.off("ContactCreated", createdHandlerRef.current);
                    if (deletedHandlerRef.current) conn.off("ContactDeleted", deletedHandlerRef.current);
                    if (readHandlerRef.current) conn.off("ContactReadToggled", readHandlerRef.current);
                    if (repliedHandlerRef.current) conn.off("ContactReplied", repliedHandlerRef.current);
                } catch {
                    // ignore if already disconnected
                }
            }
        };
    }, []); // intentionally empty — runs once on mount

    // ── API: load contacts (paged) ───────────────────────────────────────
    const loadContacts = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
            });
            if (query.trim()) params.set("q", query.trim());
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`${API_BASE}/api/contact?${params.toString()}`, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body: { items: Record<string, unknown>[]; total?: number } = await res.json();
            if (signal?.aborted) return;
            const items = body.items || [];
            setContacts(items.map(toContact));
            setTotalCount(Number(body.total ?? items.length));
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            console.error("[useContacts] loadContacts failed:", err);
            // Surface the error to the caller — no mock fallback
            throw err;
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, query, statusFilter]);

    useEffect(() => {
        const controller = new AbortController();
        loadContacts(controller.signal);
        return () => controller.abort();
    }, [loadContacts]);

    useEffect(() => {
        loadContactsRef.current = () => loadContacts();
    }, [loadContacts]);

    // ── API: toggle read ──────────────────────────────────────────────────
    // Optimistic update first; if the API call fails we roll back.
    // SignalR will also broadcast ContactReadToggled to all other clients.
    const toggleRead = useCallback((id: string) => {
        // Optimistic: flip immediately
        setContacts((prev) =>
            prev.map((c) => (c.id === id ? { ...c, read: !c.read } : c))
        );

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/contact/${id}/toggle-read`, {
                    method: "PUT",
                    headers: await getAuthHeaders(),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: { read: boolean } = await res.json();
                // Reconcile with server truth (handles race conditions)
                setContacts((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, read: json.read } : c))
                );
            } catch (err) {
                console.warn("[useContacts] toggleRead failed — rolling back:", err);
                // Roll back the optimistic flip
                setContacts((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, read: !c.read } : c))
                );
            }
        })();
    }, []);

    // ── API: delete contact ───────────────────────────────────────────────
    // Optimistic: remove from local state immediately; roll back on failure.
    // SignalR will also broadcast ContactDeleted to all other clients.
    const removeContact = useCallback((id: string) => {
        // Snapshot for potential rollback
        let snapshot: Contact[] = [];
        setContacts((prev) => {
            snapshot = prev;
            return prev.filter((c) => c.id !== id);
        });
        setTotalCount((prev) => Math.max(0, prev - 1));

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/contact/${id}`, {
                    method: "DELETE",
                    headers: await getAuthHeaders(),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (loadContactsRef.current) loadContactsRef.current();
            } catch (err) {
                console.warn("[useContacts] removeContact failed — rolling back:", err);
                // Restore snapshot so the item reappears
                setContacts(snapshot);
                if (loadContactsRef.current) loadContactsRef.current();
            }
        })();
    }, []);

    // ── API: reply to contact ────────────────────────────────────────────
    const replyContact = useCallback(async (id: string, subject: string, message: string) => {
        const res = await fetch(`${API_BASE}/api/contact/${id}/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(await getAuthHeaders()),
            },
            body: JSON.stringify({ subject, message }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { replied: boolean; repliedAt: string | null; read?: boolean } = await res.json();
        setContacts((prev) =>
            prev.map((c) =>
                c.id === id
                    ? {
                        ...c,
                        replied: Boolean(json.replied),
                        repliedAt: json.repliedAt ?? null,
                        read: json.read ?? c.read,
                    }
                    : c
            )
        );
    }, []);

    // ── select ────────────────────────────────────────────────────────────
    const selectContact = useCallback(
        (id: string | null) => {
            if (!id) return setSelected(null);
            setSelected(
                contacts.find((c) => c.id === id) ?? null
            );
        },
        [contacts]
    );

    // ── filter helpers ────────────────────────────────────────────────────
    const filterContacts = useCallback((q: string) => {
        setQuery(q);
        setPageState(1); // reset to first page on new search
    }, []);

    const setStatusFilterAndReset = useCallback((status: StatusFilter) => {
        setStatusFilter(status);
        setPageState(1);
    }, []);

    const clearFilters = useCallback(() => {
        setQuery("");
        setStatusFilter("all");
        setPageState(1);
    }, []);

    // ── pagination ────────────────────────────────────────────────────────
    const setPage = useCallback(
        (p: number) => {
            setPageState(Math.max(1, Math.min(p, totalPages)));
        },
        [totalPages]
    );

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setPageState(1);
    }, []);

    // ── CSV export ────────────────────────────────────────────────────────
    const exportCSV = useCallback((rows: Contact[]) => {
        if (!rows.length) return;
        const headers: (keyof Contact)[] = [
            "id", "name", "email", "subject", "message", "createdAt", "read", "replied", "repliedAt",
        ];
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        const csv = [
            headers.join(","),
            ...rows.map((r) =>
                headers
                    .map((h) => escape(String(r[h]).replace(/\n/g, " ")))
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    // ── public API ────────────────────────────────────────────────────────
    return {
        // data
        contacts,       // current page slice, always fresh
        loading,
        selected,

        // actions
        loadContacts,
        selectContact,
        toggleRead,
        removeContact,
        replyContact,
        exportCSV,

        // filters
        query,
        filterContacts,
        statusFilter,
        setStatusFilter: setStatusFilterAndReset,
        clearFilters,

        // pagination
        page,
        pageSize,
        totalPages,
        totalCount,
        setPage,
        setPageSize,
    } as const;
}