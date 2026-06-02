"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import RequirePermission from "@/components/auth/RequirePermission";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
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

  // Custom layout UI state variables to manage our interactive popup menu
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Click-Outside handler logic: Closes the custom button overlay if you click anywhere else on your screen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="space-y-6 p-6">
        <h1 className="text-3xl text-primary font-semibold mb-4">
          {t("title") || "Audit Log"}
        </h1>

        <ComponentCard
          title={t("card.title") || "Audit Logs"}
          desc={t("card.desc") || "Search and review admin actions"}
          action={
            canExport ? (
              <div className="relative inline-block text-left" ref={dropdownRef}>
                {/* Main Action Trigger Component Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-medium border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  {t("exportOptions") || "Export As..."}
                </Button>

                {/* Floating Custom Popover Window Modal Element */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 dark:border-gray-800 dark:bg-gray-950">
                    <button
                      onClick={() => {
                        exportCsv();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 dark:active:bg-gray-800"
                    >
                      <span>{t("exportCsv") || "Export CSV"}</span>
                    </button>
                    <button
                      onClick={() => {
                        exportPdf();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 dark:active:bg-gray-800"
                    >
                      <span>{t("exportPdf") || "Export PDF"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null
          }
        >
          <div className="space-y-4">
            <AuditLogFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onRefresh={() => loadLogs()}
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

            <div className="flex items-center justify-between">
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