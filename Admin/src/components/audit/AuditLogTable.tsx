"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { AuditLogListItem } from "../../types/auditLog";
import { formatDateTime, statusColor } from "../../lib/auditLogUtils";

type Props = {
  items: AuditLogListItem[];
  loading: boolean;
  onViewDetail: (id: string) => void;
};

export function AuditLogTable({ items, loading, onViewDetail }: Props) {
  const t = useTranslations();

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
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
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {label}
                  </TableCell>
                ))}
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
                  <TableCell className="px-5 py-4 text-gray-500">
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
                      {item.actorFullName}
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
                        onClick={() => onViewDetail(item.id)}
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
  );
}