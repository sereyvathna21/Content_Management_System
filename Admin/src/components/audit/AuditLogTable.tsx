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

export function AuditLogTable({ items, loading, onViewDetail }: Props) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="text-gray-500 text-sm">
        {t("AuditLogPage.loading") || "Loading..."}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {t("AuditLogPage.empty") || "No audit logs found."}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block max-w-full overflow-x-auto">
        <div className="min-w-0">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                {[
                  t("AuditLogPage.headers.time") || "Time",
                  t("AuditLogPage.headers.action") || "Action",
                  t("AuditLogPage.headers.entity") || "Entity",
                  "Full Name",
                  t("AuditLogPage.headers.status") || "Status",
                  t("AuditLogPage.headers.ip") || "IP",
                  t("AuditLogPage.headers.detail") || "Detail",
                ].map((label) => (
                  <TableCell
                    key={label}
                    isHeader
                    className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400"
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-3 sm:px-6 text-start text-gray-500 text-sm dark:text-gray-400">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {item.action}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <div className="space-y-1">
                      <div>{item.entityType}</div>
                      {item.entityId && (
                        <div className="text-xs text-gray-400">{item.entityId}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {item.actorFullName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-sm">
                    <Badge size="sm" variant="light" color={statusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {item.ipAddress || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                    <Tooltip label={t("AuditLogPage.view") || "View"}>
                      <button
                        onClick={() => onViewDetail(item.id)}
                        title={t("AuditLogPage.view") || "View"}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                className="text-left w-full"
                onClick={() => onViewDetail(item.id)}
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">
                    {item.action}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.entityType}
                    {item.entityId && ` • ${item.entityId}`}
                  </div>
                </div>
              </button>
              <Badge size="sm" variant="light" color={statusColor(item.status)}>
                {item.status}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-500">Time:</span>
                <span className="font-medium">{formatDateTime(item.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-500">User:</span>
                <span className="font-medium">{item.actorFullName}</span>
              </div>
              {item.ipAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-500">IP:</span>
                  <span className="font-mono text-xs">{item.ipAddress}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <Tooltip label={t("AuditLogPage.view") || "View Details"}>
                <button
                  onClick={() => onViewDetail(item.id)}
                  className="px-3 py-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition"
                >
                  {t("AuditLogPage.view") || "View"}
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}