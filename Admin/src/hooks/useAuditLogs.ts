"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getBackendUrl } from "@/lib/backend";
import { readApiError } from "@/lib/readApiError";
import { AuditLogListItem, Filters } from "../types/auditLog";
import { toIsoDateStart, toIsoDateEnd, formatDateTime } from "../lib/auditLogUtils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PAGE_SIZE = 20;

export function useAuditLogs(filters: Filters, page: number) {
  const { data: session, status } = useSession();
  const backendUrl = useMemo(() => getBackendUrl(), []);

  const [items, setItems] = useState<AuditLogListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const buildParams = useCallback(
    (includePaging: boolean) => {
      const params = new URLSearchParams();
      if (includePaging) {
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
      }
      const fromIso = toIsoDateStart(filters.from);
      const toIso = toIsoDateEnd(filters.to);
      if (fromIso) params.set("from", fromIso);
      if (toIso) params.set("to", toIso);
      if (filters.userId.trim()) params.set("userId", filters.userId.trim());
      if (filters.action.trim()) params.set("action", filters.action.trim());
      if (filters.entityType.trim()) params.set("entityType", filters.entityType.trim());
      if (filters.entityId.trim()) params.set("entityId", filters.entityId.trim());
      if (filters.status.trim()) params.set("status", filters.status.trim());
      if (filters.q.trim()) params.set("q", filters.q.trim());
      return params;
    },
    [filters, page]
  );

  const loadLogs = useCallback(
    async (signal?: AbortSignal) => {
      if (status === "loading" || !session?.accessToken) return;
      setLoading(true);
      setLoadError("");
      try {
        const params = buildParams(true);
        const res = await fetch(`${backendUrl}/api/admin/audit-logs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
          signal,
        });

        if (!res.ok) {
          const message = await readApiError(res, "Failed to load audit logs");
          setLoadError(message);
          setItems([]);
          setTotalCount(0);
          return;
        }

        const data = await res.json();
        if (signal?.aborted) return;

        const rows = Array.isArray(data.items) ? data.items : [];
        const mapped: AuditLogListItem[] = rows.map((item: any) => ({
          id: item.id,
          action: item.action,
          entityType: item.entityType,
          entityId: item.entityId,
          summary: item.summary,
          status: item.status,
          actorFullName: item.actorFullName || item.actorEmail || "",
          ipAddress: item.ipAddress,
          createdAt: item.createdAt,
        }));
        setItems(mapped);
        
        setTotalCount(Number(data.totalCount ?? data.total ?? rows.length));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
        setLoadError("Failed to load audit logs. Please try again.");
        setItems([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, buildParams, session?.accessToken, status]
  );

  const exportCsv = useCallback(async () => {
    if (!session?.accessToken) return;
    
    const params = buildParams(false);
    params.set("format", "csv");
    
    params.set("page", "1");
    params.set("pageSize", "1000"); 

    // ENFORCE 1-DAY LIMIT: Default to today's parameters window if empty
    if (!params.has("from")) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      params.set("from", todayStart.toISOString());
      params.set("to", todayEnd.toISOString());
    }

    try {
      const res = await fetch(`${backendUrl}/api/admin/audit-logs/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) {
        const message = await readApiError(res, "Failed to export audit logs");
        setLoadError(message);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-1day-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to export audit logs.");
    }
  }, [backendUrl, buildParams, session?.accessToken]);

  const exportPdf = useCallback(async () => {
    if (!session?.accessToken) return;
    
    setLoading(true);
    setLoadError("");
    try {
      const params = buildParams(false); 
      
      params.set("page", "1");
      params.set("pageSize", "1000");

      // ENFORCE 1-DAY LIMIT: Mirror the exact same 1-day boundaries here
      if (!params.has("from")) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        params.set("from", todayStart.toISOString());
        params.set("to", todayEnd.toISOString());
      }
      
      const res = await fetch(`${backendUrl}/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!res.ok) {
        const message = await readApiError(res, "Failed to fetch data for PDF export");
        setLoadError(message);
        return;
      }

      const data = await res.json();
      const allRows = Array.isArray(data.items) ? data.items : [];

      if (allRows.length === 0) {
        setLoadError("No data available for the selected day.");
        return;
      }

      const doc = new jsPDF("p", "pt", "a4");
      
      doc.setFontSize(18);
      doc.text("Audit Logs Report (Single Day)", 40, 40);
      doc.setFontSize(10);
      
      const exportDay = params.get("from") 
        ? new Date(params.get("from")!).toLocaleDateString() 
        : new Date().toLocaleDateString();
      doc.text(`Log Date: ${exportDay} | Generated on: ${new Date().toLocaleString()}`, 40, 55);

      const tableRows = allRows.map((item: any) => [
        formatDateTime(item.createdAt),
        item.action,
        item.entityType,
        item.actorFullName || item.actorEmail || "",
        item.status,
        item.ipAddress || "-",
      ]);

      autoTable(doc, {
        head: [["Time", "Action", "Entity", "Full Name", "Status", "IP Address"]],
        body: tableRows,
        startY: 70,
        theme: "striped",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }, 
      });

      doc.save(`audit-logs-1day-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to export PDF report.");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, buildParams, session?.accessToken]);

  useEffect(() => {
    const controller = new AbortController();
    loadLogs(controller.signal);
    return () => controller.abort();
  }, [loadLogs]);

  return { items, totalCount, loading, loadError, loadLogs, exportCsv, exportPdf, PAGE_SIZE };
}