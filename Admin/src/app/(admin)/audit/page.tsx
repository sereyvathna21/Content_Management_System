"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import RequirePermission from "@/components/auth/RequirePermission";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { usePermission } from "@/hooks/usePermission";
import { getBackendUrl } from "@/lib/backend";
import { readApiError } from "@/lib/readApiError";

type AuditLogListItem = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  status: "Success" | "Failure" | string;
  actorUserId: number;
  actorEmail: string;
  ipAddress?: string | null;
  createdAt: string;
};

type AuditLogDetail = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  status: "Success" | "Failure" | string;
  actorUserId: number;
  actorEmail: string;
  actorRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  errorMessage?: string | null;
  requestId?: string | null;
  correlationId?: string | null;
  sessionId?: string | null;
};

type Filters = {
  from: string;
  to: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  status: string;
  q: string;
};

const initialFilters: Filters = {
  from: "",
  to: "",
  userId: "",
  action: "",
  entityType: "",
  entityId: "",
  status: "",
  q: "",
};

const pageSize = 20;

const toIsoDateStart = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toIsoDateEnd = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const statusColor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "success") return "success" as const;
  if (normalized === "failure") return "error" as const;
  return "info" as const;
};

export default function AuditLogPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const { can } = usePermission();
  const canExport = can("audit:export");
  const backendUrl = useMemo(() => getBackendUrl(), []);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [items, setItems] = useState<AuditLogListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const buildParams = useCallback(
    (includePaging: boolean) => {
      const params = new URLSearchParams();
      if (includePaging) {
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
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

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
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
      setItems(rows as AuditLogListItem[]);
      setTotalCount(Number(data.total ?? rows.length));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
      setLoadError("Failed to load audit logs. Please try again.");
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, buildParams, session?.accessToken, status]);

  useEffect(() => {
    const controller = new AbortController();
    loadLogs(controller.signal);
    return () => controller.abort();
  }, [loadLogs]);

  const loadDetail = useCallback(async (id: string) => {
    if (!session?.accessToken) return;
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await fetch(`${backendUrl}/api/admin/audit-logs/${id}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) {
        const message = await readApiError(res, "Failed to load audit log detail");
        setDetailError(message);
        setDetail(null);
        return;
      }
      const data = (await res.json()) as AuditLogDetail;
      setDetail(data);
    } catch (err) {
      console.error(err);
      setDetailError("Failed to load audit log detail.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [backendUrl, session?.accessToken]);

  useEffect(() => {
    if (!detailOpen || !detailId) return;
    loadDetail(detailId);
  }, [detailId, detailOpen, loadDetail]);

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
    setDetail(null);
    setDetailError("");
  };

  const handleFilterChange = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleExport = async () => {
    if (!session?.accessToken) return;
    const params = buildParams(false);
    params.set("format", "csv");

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
      link.download = `audit-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to export audit logs.");
    }
  };

  return (
    <RequirePermission permission="audit:read">
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl text-primary font-semibold mb-4">
            {t("AuditLogPage.title") || "Audit Log"}
          </h1>
        </div>

        <ComponentCard
          title={t("AuditLogPage.card.title") || "Audit Logs"}
          desc={t("AuditLogPage.card.desc") || "Search and review admin actions"}
          action={
            canExport ? (
              <Button size="sm" variant="outline" onClick={handleExport}>
                {t("AuditLogPage.export") || "Export CSV"}
              </Button>
            ) : null
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder={t("AuditLogPage.filters.q") || "Search"}
                value={filters.q}
                onChange={(e) => handleFilterChange({ q: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder={t("AuditLogPage.filters.action") || "Action"}
                value={filters.action}
                onChange={(e) => handleFilterChange({ action: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder={t("AuditLogPage.filters.entityType") || "Entity type"}
                value={filters.entityType}
                onChange={(e) => handleFilterChange({ entityType: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder={t("AuditLogPage.filters.entityId") || "Entity ID"}
                value={filters.entityId}
                onChange={(e) => handleFilterChange({ entityId: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder={t("AuditLogPage.filters.userId") || "User ID"}
                value={filters.userId}
                onChange={(e) => handleFilterChange({ userId: e.target.value })}
              />
              <select
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
              >
                <option value="">{t("AuditLogPage.filters.statusAll") || "All status"}</option>
                <option value="Success">{t("AuditLogPage.filters.statusSuccess") || "Success"}</option>
                <option value="Failure">{t("AuditLogPage.filters.statusFailure") || "Failure"}</option>
              </select>
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange({ from: e.target.value })}
              />
              <input
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange({ to: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" onClick={() => loadLogs()}>
                {t("AuditLogPage.refresh") || "Refresh"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                {t("AuditLogPage.clearFilters") || "Clear filters"}
              </Button>
            </div>

            {loadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {loadError}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.time") || "Time"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.action") || "Action"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.entity") || "Entity"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.actor") || "Actor"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.status") || "Status"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.ip") || "IP"}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {t("AuditLogPage.headers.detail") || "Detail"}
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {loading ? (
                        <TableRow>
                          <TableCell className="px-5 py-4 text-gray-500" {...{ colSpan: 7 }}>
                            {t("AuditLogPage.loading") || "Loading..."}
                          </TableCell>
                        </TableRow>
                      ) : items.length === 0 ? (
                        <TableRow>
                          <TableCell className="px-5 py-4 text-gray-500" {...{ colSpan: 7 }}>
                            {t("AuditLogPage.empty") || "No audit logs found."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="px-5 py-4 text-gray-700 text-theme-sm">
                              {formatDateTime(item.createdAt)}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-700 text-theme-sm">
                              {item.action}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-700 text-theme-sm">
                              <div className="space-y-1">
                                <div>{item.entityType}</div>
                                {item.entityId && (
                                  <div className="text-xs text-gray-400">{item.entityId}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-700 text-theme-sm">
                              <div className="space-y-1">
                                <div>{item.actorEmail}</div>
                                <div className="text-xs text-gray-400">#{item.actorUserId}</div>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-theme-sm">
                              <Badge size="sm" variant="light" color={statusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-700 text-theme-sm">
                              {item.ipAddress || "-"}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(item.id)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                              >
                                {t("AuditLogPage.view") || "View"}
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {t("AuditLogPage.total") || "Total"}: {totalCount}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={detailOpen} onClose={handleCloseDetail} showCloseButton>
        <div className="p-6 space-y-4">
          <div className="text-lg font-semibold text-primary">
            {t("AuditLogPage.detailTitle") || "Audit Log Detail"}
          </div>

          {detailLoading && (
            <div className="text-sm text-gray-500">{t("AuditLogPage.loading") || "Loading..."}</div>
          )}

          {detailError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {detailError}
            </div>
          )}

          {detail && !detailLoading && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-400">Action</div>
                  <div className="font-medium text-gray-800">{detail.action}</div>
                </div>
                <div>
                  <div className="text-gray-400">Status</div>
                  <Badge size="sm" variant="light" color={statusColor(detail.status)}>
                    {detail.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-gray-400">Entity</div>
                  <div className="font-medium text-gray-800">
                    {detail.entityType}{detail.entityId ? ` • ${detail.entityId}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Actor</div>
                  <div className="font-medium text-gray-800">
                    {detail.actorEmail} {detail.actorRole ? `(${detail.actorRole})` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Time</div>
                  <div className="font-medium text-gray-800">{formatDateTime(detail.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-400">IP</div>
                  <div className="font-medium text-gray-800">{detail.ipAddress || "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-400">Summary</div>
                <div className="font-medium text-gray-800">{detail.summary}</div>
              </div>

              {detail.errorMessage && (
                <div>
                  <div className="text-gray-400">Error Message</div>
                  <div className="font-medium text-red-600">{detail.errorMessage}</div>
                </div>
              )}

              <div>
                <div className="text-gray-400">Metadata</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
{JSON.stringify(detail.metadata ?? {}, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-400">Request ID</div>
                  <div className="font-medium text-gray-800">{detail.requestId || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-400">Correlation ID</div>
                  <div className="font-medium text-gray-800">{detail.correlationId || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-400">Session ID</div>
                  <div className="font-medium text-gray-800">{detail.sessionId || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-400">User Agent</div>
                  <div className="font-medium text-gray-800 wrap-break-words">{detail.userAgent || "-"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </RequirePermission>
  );
}
