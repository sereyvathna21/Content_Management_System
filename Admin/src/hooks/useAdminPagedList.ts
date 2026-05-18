"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBackendUrl } from "@/lib/backend";

type LoadError = {
    message: string;
    httpStatus?: number;
};

type DefaultPagedResponse<TItem> = {
    items?: TItem[];
    total?: number;
};

type Options<TItem> = {
    endpoint: string;
    accessToken?: string;
    authStatus?: string;
    pageSize?: number;
    initialQuery?: string;
    initialStatusFilter?: string;
    loadErrorText: string;
    parseResponse?: (data: unknown) => { items: TItem[]; totalCount: number };
};

export function useAdminPagedList<TItem>(options: Options<TItem>) {
    const {
        endpoint,
        accessToken,
        authStatus,
        pageSize = 10,
        initialQuery = "",
        initialStatusFilter = "all",
        loadErrorText,
        parseResponse,
    } = options;

    const [items, setItems] = useState<TItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<LoadError | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const [query, setQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [page, setPage] = useState(1);
    const [reloadToken, setReloadToken] = useState(0);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

    const load = useCallback(
        async (signal?: AbortSignal) => {
            if (authStatus === "loading" || !accessToken) return;

            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    pageSize: String(pageSize),
                });

                if (query.trim()) params.set("q", query.trim());
                if (statusFilter !== "all") params.set("status", statusFilter);

                const res = await fetch(`${getBackendUrl()}${endpoint}?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal,
                });

                if (!res.ok) {
                    setError({ message: `${loadErrorText} (HTTP ${res.status})`, httpStatus: res.status });
                    setItems([]);
                    setTotalCount(0);
                    return;
                }

                const data = (await res.json()) as DefaultPagedResponse<TItem>;
                if (signal?.aborted) return;

                if (parseResponse) {
                    const parsed = parseResponse(data);
                    setItems(parsed.items);
                    setTotalCount(parsed.totalCount);
                    return;
                }

                const list = Array.isArray(data?.items) ? data.items : [];
                setItems(list);
                setTotalCount(Number((data as any)?.total ?? list.length ?? 0));
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                console.error(err);
                setError({ message: loadErrorText });
                setItems([]);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        },
        [accessToken, authStatus, endpoint, loadErrorText, page, pageSize, parseResponse, query, statusFilter],
    );

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load, reloadToken]);

    useEffect(() => {
        setPage(1);
    }, [query, statusFilter]);

    const reload = useCallback(() => {
        setReloadToken((x) => x + 1);
    }, []);

    return {
        items,
        setItems,
        loading,
        error,
        totalCount,
        totalPages,
        page,
        pageSize,
        setPage,
        query,
        setQuery,
        statusFilter,
        setStatusFilter,
        reload,
    };
}
