"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Tooltip from "@/components/ui/Tooltip";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { AuditLogListItem } from "../../types/auditLog";
import { formatDateTime, statusColor } from "../../lib/auditLogUtils";

type Props = {
  items: AuditLogListItem[];
  loading: boolean;
  onViewDetail: (id: string) => void;
};

// ─── Skeleton loading card (mobile) ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3 dark:border-gray-800 dark:bg-gray-950 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// ─── Skeleton loading row (desktop) ─────────────────────────────────────────
function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <TableCell key={i} className="px-5 py-3">
          <div className={`h-4 bg-gray-100 dark:bg-gray-800 rounded ${i === 0 ? "w-28" : i === 4 ? "w-16" : "w-full"}`} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── Empty state illustration ────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or date range.</p>
    </div>
  );
}

export function AuditLogTable({ items, loading, onViewDetail }: Props) {
  const t = useTranslations();

  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                {[
                  t("AuditLogPage.headers.time") || "Time",
                  t("AuditLogPage.headers.action") || "Action",
                  t("AuditLogPage.headers.entity") || "Entity",
                  t("AuditLogPage.headers.actor") || "Actor",
                  t("AuditLogPage.headers.status") || "Status",
                  t("AuditLogPage.headers.ip") || "IP",
                  t("AuditLogPage.headers.detail") || "Detail",
                ].map((label) => (
                  <TableCell
                    key={label}
                    isHeader
                    className="px-5 py-3 font-medium text-primary text-start text-sm dark:text-gray-400"
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </TableBody>
          </Table>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return <EmptyState label={t("AuditLogPage.empty") || "No audit logs found."} />;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            <TableRow>
              {[
                t("AuditLogPage.headers.time") || "Time",
                t("AuditLogPage.headers.action") || "Action",
                t("AuditLogPage.headers.entity") || "Entity",
                t("AuditLogPage.headers.actor") || "Actor",
                t("AuditLogPage.headers.status") || "Status",
                t("AuditLogPage.headers.ip") || "IP",
                t("AuditLogPage.headers.detail") || "Detail",
              ].map((label) => (
                <TableCell
                  key={label}
                  isHeader
                  className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400 whitespace-nowrap"
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 cursor-pointer transition-colors group"
                onClick={() => onViewDetail(item.id)}
              >
                <TableCell className="px-5 py-3 text-gray-500 text-sm dark:text-gray-400 whitespace-nowrap">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700 text-sm dark:text-gray-300 font-medium whitespace-nowrap">
                  {item.action}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-700 dark:text-gray-300">{item.entityType}</div>
                    {item.entityId && (
                      <div className="text-xs text-gray-400 font-mono">{item.entityId}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400 whitespace-nowrap">
                  {item.actorFullName}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge size="sm" variant="light" color={statusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-400 text-sm font-mono">
                  {item.ipAddress || "—"}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Tooltip label={t("AuditLogPage.view") || "View"}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetail(item.id); }}
                      title={t("AuditLogPage.view") || "View"}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      </svg>
                    </button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewDetail(item.id)}
            className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 dark:border-gray-800 dark:bg-gray-950 hover:border-primary/30 hover:shadow-md active:scale-[0.99] transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {item.action}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.entityType}
                  {item.entityId && <span className="font-mono ml-1 text-gray-400">• {item.entityId}</span>}
                </div>
              </div>
              <Badge size="sm" variant="light" color={statusColor(item.status)}>
                {item.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-0.5">
              <div>
                <span className="text-gray-400 block mb-0.5">Time</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(item.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">User</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">{item.actorFullName}</span>
              </div>
              {item.ipAddress && (
                <div className="col-span-2">
                  <span className="text-gray-400 block mb-0.5">IP</span>
                  <span className="font-mono text-xs text-gray-500">{item.ipAddress}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-1">
              <span className="text-xs text-sky-500 dark:text-sky-400 font-medium flex items-center gap-1">
                View Details
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}