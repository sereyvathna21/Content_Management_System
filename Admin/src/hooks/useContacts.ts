"use client";
import { useEffect, useState } from "react";
import { mockContacts } from "../lib/mockContacts";

export type Contact = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    read: boolean;
};

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [all, setAll] = useState<Contact[]>([]);
    const [query, setQuery] = useState<string>("");
    const [statusFilter, setStatusFilterState] = useState<"all" | "read" | "unread">("all");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Contact | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [filteredAll, setFilteredAll] = useState<Contact[]>([]);

    useEffect(() => {
        // nothing on mount by default; page will call loadContacts
    }, []);

    const loadContacts = async () => {
        setLoading(true);
        // simulate fetch
        await new Promise((r) => setTimeout(r, 200));
        setAll(mockContacts);
        setFilteredAll(mockContacts);
        // paginate
        const start = 0;
        const end = pageSize;
        setContacts(mockContacts.slice(start, end));
        setLoading(false);
    };

    const applyFilters = (q?: string, status?: "all" | "read" | "unread", pageOverride?: number) => {
        const qVal = q !== undefined ? q : query;
        const statusVal = status !== undefined ? status : statusFilter;

        let result = all.slice();
        if (qVal) {
            const lower = qVal.toLowerCase();
            result = result.filter((c) => `${c.name} ${c.email} ${c.subject}`.toLowerCase().includes(lower));
        }

        if (statusVal && statusVal !== "all") {
            result = result.filter((c) => (statusVal === "read" ? c.read : !c.read));
        }

        setFilteredAll(result);

        // reset to page 1 on filter change unless pageOverride provided
        const p = pageOverride ?? 1;
        setPage(p);

        const start = (p - 1) * pageSize;
        const end = start + pageSize;
        setContacts(result.slice(start, end));
    };

    const filterContacts = (q: string) => {
        setQuery(q);
        applyFilters(q, undefined, 1);
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilterState("all");
        applyFilters("", "all", 1);
    };

    const setStatusFilter = (status: "all" | "read" | "unread") => {
        setStatusFilterInternal(status);
        applyFilters(undefined, status, 1);
    };

    // helper to avoid name clash with state setter
    const setStatusFilterInternal = (s: "all" | "read" | "unread") => {
        setStatusFilterState(s);
    };

    const selectContact = (id: string | null) => {
        if (!id) return setSelected(null);
        const found = contacts.find((c) => c.id === id) ?? all.find((c) => c.id === id) ?? null;
        setSelected(found || null);
    };

    const toggleRead = (id: string) => {
        setAll((prev) => prev.map((p) => (p.id === id ? { ...p, read: !p.read } : p)));
        // update filteredAll then re-paginate
        setFilteredAll((prev) => prev.map((p) => (p.id === id ? { ...p, read: !p.read } : p)));
        applyFilters(undefined, undefined, page);
        if (selected && selected.id === id) setSelected({ ...selected, read: !selected.read });
    };

    const removeContact = (id: string) => {
        setAll((prev) => prev.filter((p) => p.id !== id));
        setFilteredAll((prev) => prev.filter((p) => p.id !== id));
        applyFilters(undefined, undefined, page);
        if (selected && selected.id === id) setSelected(null);
    };

    const exportCSV = (rows: Contact[]) => {
        if (!rows || rows.length === 0) return;
        const headers = ["id", "name", "email", "subject", "message", "createdAt", "read"];
        const csv = [headers.join(",")]
            .concat(
                rows.map((r) =>
                    [r.id, r.name, r.email, r.subject, r.message.replace(/\n/g, " "), r.createdAt, String(r.read)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
                )
            )
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalCount = filteredAll.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const setPageInternal = (p: number) => {
        const newPage = Math.max(1, Math.min(p, totalPages));
        setPage(newPage);
        const start = (newPage - 1) * pageSize;
        const end = start + pageSize;
        setContacts(filteredAll.slice(start, end));
    };

    const setPageSizeInternal = (size: number) => {
        setPageSize(size);
        // reset to page 1
        setPage(1);
        const start = 0;
        const end = size;
        setContacts(filteredAll.slice(start, end));
    };

    return {
        contacts,
        loading,
        selected,
        loadContacts,
        selectContact,
        toggleRead,
        removeContact,
        exportCSV,
        filterContacts,
        setStatusFilter,
        statusFilter,
        // pagination
        page,
        pageSize,
        totalPages,
        totalCount,
        setPage: setPageInternal,
        setPageSize: setPageSizeInternal,
        clearFilters,
    } as const;
}
