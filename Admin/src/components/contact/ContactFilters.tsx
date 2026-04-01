"use client";
import React from "react";
import { useTranslations } from "next-intl";

type Props = {
  value: string;
  onSearch: (q: string) => void;
  status?: "all" | "read" | "unread";
  onStatusChange?: (s: "all" | "read" | "unread") => void;
};


export default function ContactFilters({ value, onSearch, status = "all", onStatusChange }: Props) {
  const t = useTranslations("ContactPage");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={status === "all"}
            onClick={() => onStatusChange && onStatusChange("all")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "all"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("status.all")}
          </button>

          <button
            type="button"
            aria-pressed={status === "unread"}
            onClick={() => onStatusChange && onStatusChange("unread")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "unread"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("status.unread")}
          </button>

          <button
            type="button"
            aria-pressed={status === "read"}
            onClick={() => onStatusChange && onStatusChange("read")}
            className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
              status === "read"
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("status.read")}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <input
          aria-label={t("searchAria")}
          className={`w-full sm:w-64 h-9 px-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 text-sm ${
            value ? "border-gray-300" : "border-gray-200"
          }`}
          placeholder={t("searchPlaceholder")}
          value={value}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
  
    </div>
  );
}