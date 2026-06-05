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

const inputClass =
  "h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full";

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

// ─── Main filter component ───────────────────────────────────────────────────
export function AuditLogFilters({ filters, onChange, onReset, onRefresh, canExport, onExportCsv, onExportPdf }: Props) {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <div className="space-y-3 sm:space-y-4">
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
          className={inputClass}
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

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <Button size="sm" variant="primary" onClick={onReset} className="w-full sm:w-auto">
          {t("AuditLogPage.clearFilters") || "Clear filters"}
        </Button>
        {canExport && onExportCsv && onExportPdf && (
          <div className="relative w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-2 font-medium border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 justify-center"
            >
              {t("AuditLogPage.exportOptions") || "Export As..."}
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 dark:border-gray-800 dark:bg-gray-950">
                <button
                  onClick={() => {
                    onExportCsv();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 dark:active:bg-gray-800"
                >
                  <span>{t("AuditLogPage.exportCsv") || "Export CSV"}</span>
                </button>
                <button
                  onClick={() => {
                    onExportPdf();
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 dark:active:bg-gray-800"
                >
                  <span>{t("AuditLogPage.exportPdf") || "Export PDF"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}