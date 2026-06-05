"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import RequirePermission from "@/components/auth/RequirePermission";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import { usePermission } from "@/hooks/usePermission";
import { Filters, initialFilters } from "../../../types/auditLog";
import { useAuditLogs } from "../../../hooks/useAuditLogs";
import { useAuditLogDetail } from "../../../hooks/useAuditLogDetail";
import { AuditLogFilters } from "../../../components/audit/AuditLogFilters";
import { AuditLogTable } from "../../../components/audit/AuditLogTable";
import { AuditLogDetailModal } from "../../../components/audit/AuditLogDetailModal";

export default function AuditLogPage() {
  const t = useTranslations("AuditLogPage");
  const { can } = usePermission();
  const canExport = can("audit:export");

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);

  const { items, totalCount, loading, loadError, loadLogs, exportCsv, exportPdf, PAGE_SIZE } =
    useAuditLogs(filters, page);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { detail, detailLoading, detailError, reset: resetDetail } = useAuditLogDetail(
    detailId,
    detailOpen
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleFilterChange = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleOpenDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
    resetDetail();
  };

  return (
    <RequirePermission permission="audit:read">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl text-primary font-semibold">
          {t("title") || "Audit Log"}
        </h1>

        <ComponentCard
          title={t("card.title") || "Audit Logs"}
          desc={t("card.desc") || "Search and review admin actions"}
          action={null}
        >
          <div className="space-y-4">
            <AuditLogFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onRefresh={() => loadLogs()}
              canExport={canExport}
              onExportCsv={exportCsv}
              onExportPdf={exportPdf}
            />

            {loadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {loadError}
              </div>
            )}

            <AuditLogTable
              items={items}
              loading={loading}
              onViewDetail={handleOpenDetail}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-500">
                {t("total") || "Total"}: {totalCount}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </ComponentCard>
      </div>

      <AuditLogDetailModal
        open={detailOpen}
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
      />
    </RequirePermission>
  );
}