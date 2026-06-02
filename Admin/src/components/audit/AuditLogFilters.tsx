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
        <span className={selected ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-white/30"}>
          {selected ? selected.label : placeholder}
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
export function AuditLogFilters({ filters, onChange, onReset, onRefresh }: Props) {
  const t = useTranslations();
  const [users, setUsers] = useState<User[]>([]);

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
    { value: "read",   label: "Read" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
  ];

  const statusOptions: DropdownOption[] = [
    { value: "Success", label: t("AuditLogPage.filters.statusSuccess") || "Success" },
    { value: "Failure", label: t("AuditLogPage.filters.statusFailure") || "Failure" },
  ];

  const userOptions: DropdownOption[] = users.map((u) => ({
    value: String(u.id),
    label: u.fullName,
    sublabel: u.email,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

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

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="primary" onClick={onRefresh}>
          {t("AuditLogPage.refresh") || "Refresh"}
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          {t("AuditLogPage.clearFilters") || "Clear filters"}
        </Button>
      </div>
    </div>
  );
}