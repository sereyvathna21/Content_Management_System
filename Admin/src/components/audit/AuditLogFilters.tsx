"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { getSession } from "next-auth/react";
import Button from "@/components/ui/button/Button";
import { Filters } from "../../types/auditLog";
import DatePicker from "@/components/form/date-picker";
import { getBackendUrl } from "@/lib/backend";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

type User = {
  id: number;
  fullName: string;
  email: string;
};

type DropdownOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type Props = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  onRefresh: () => void;
  canExport?: boolean;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
};

// ─── Reusable custom select ─────────────────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="dropdown-toggle h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none flex items-center justify-between gap-2 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
      >
        <span className={selected && selected.value !== "" ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}>
          {selected && selected.value !== "" ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        className="w-full left-0 right-0"
      >
        <ul className="max-h-56 overflow-y-auto py-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex flex-col gap-0.5 ${
                  value === opt.value
                    ? "text-primary font-medium bg-primary/5"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {opt.sublabel}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}

// ─── Count active filters ────────────────────────────────────────────────────
function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.action) count++;
  if (filters.entityType) count++;
  if (filters.userId) count++;
  if (filters.status) count++;
  if (filters.from) count++;
  if (filters.to) count++;
  return count;
}

// ─── Main filter component ───────────────────────────────────────────────────
export function AuditLogFilters({ filters, onChange, onReset, onRefresh, canExport, onExportCsv, onExportPdf }: Props) {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    const loadUsers = async () => {
      const session = await getSession();
      const token = (session as { accessToken?: string } | null)?.accessToken;
      if (!token) return;

      try {
        const res = await axios.get<User[]>(`${getBackendUrl()}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : (res.data as any).items ?? [];
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    loadUsers();
  }, []);

  const actionOptions: DropdownOption[] = [
    { value: "",       label: t("AuditLogPage.filters.actionAll") || "All actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
  ];

  const statusOptions: DropdownOption[] = [
    { value: "",        label: t("AuditLogPage.filters.statusAll") || "All status" },
    { value: "Success", label: t("AuditLogPage.filters.statusSuccess") || "Success" },
    { value: "Failure", label: t("AuditLogPage.filters.statusFailure") || "Failure" },
  ];

  const userOptions: DropdownOption[] = [
    { value: "", label: t("AuditLogPage.filters.userId") || "All users" },
    ...users.map((u) => ({
      value: String(u.id),
      label: u.fullName,
      sublabel: u.email,
    }))
  ];

  const filterGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      {/* Action dropdown */}
      <CustomSelect
        value={filters.action}
        onChange={(val) => onChange({ action: val })}
        options={actionOptions}
        placeholder={t("AuditLogPage.filters.action") || "All actions"}
      />

      {/* Entity type */}
      <input
        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
        placeholder={t("AuditLogPage.filters.entityType") || "Entity type"}
        value={filters.entityType}
        onChange={(e) => onChange({ entityType: e.target.value })}
      />

      {/* User dropdown */}
      <CustomSelect
        value={filters.userId}
        onChange={(val) => onChange({ userId: val })}
        options={userOptions}
        placeholder={t("AuditLogPage.filters.userId") || "All users"}
      />

      {/* Status dropdown */}
      <CustomSelect
        value={filters.status}
        onChange={(val) => onChange({ status: val })}
        options={statusOptions}
        placeholder={t("AuditLogPage.filters.statusAll") || "All status"}
      />

      <DatePicker
        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
        placeholder={t("AuditLogPage.filters.from") || "From date"}
        value={filters.from}
        onChange={(date) => onChange({ from: date })}
      />
      <DatePicker
        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer"
        placeholder={t("AuditLogPage.filters.to") || "To date"}
        value={filters.to}
        onChange={(date) => onChange({ to: date })}
      />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Top bar: mobile toggle + actions row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile collapsible toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen((p) => !p)}
          className="sm:hidden inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          {t("AuditLogPage.filters.action") || "Filters"}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary rounded-full">
              {activeCount}
            </span>
          )}
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Active filter count badge — mobile only */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="sm:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear {activeCount}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export dropdown */}
        {canExport && onExportCsv && onExportPdf && (
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 font-medium border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">{t("AuditLogPage.exportOptions") || "Export"}</span>
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 dark:border-gray-800 dark:bg-gray-950">
                <button
                  onClick={() => { onExportCsv(); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t("AuditLogPage.exportCsv") || "Export CSV"}
                </button>
                <button
                  onClick={() => { onExportPdf(); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t("AuditLogPage.exportPdf") || "Export PDF"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors dark:bg-gray-900 dark:border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Desktop: always-visible filter grid */}
      <div className="hidden sm:block">{filterGrid}</div>

      {/* Mobile: collapsible filter grid */}
      {filtersOpen && (
        <div className="sm:hidden space-y-3 pt-1 pb-2 border-t border-gray-100 dark:border-gray-800">
          {filterGrid}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { onReset(); setFiltersOpen(false); }}
              className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300"
            >
              {t("AuditLogPage.clearFilters") || "Clear filters"}
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex-1 h-9 px-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Desktop: clear filters row */}
      {activeCount > 0 && (
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-400">{activeCount} filter{activeCount > 1 ? "s" : ""} active</span>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-primary hover:underline font-medium"
          >
            {t("AuditLogPage.clearFilters") || "Clear all"}
          </button>
        </div>
      )}
    </div>
  );
}