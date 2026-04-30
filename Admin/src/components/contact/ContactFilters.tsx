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
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={status === "all"}
            onClick={() => onStatusChange && onStatusChange("all")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              status === "all"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {t("status.all")}
          </button>

          <button
            type="button"
            aria-pressed={status === "unread"}
            onClick={() => onStatusChange && onStatusChange("unread")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              status === "unread"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {t("status.unread")}
          </button>

          <button
            type="button"
            aria-pressed={status === "read"}
            onClick={() => onStatusChange && onStatusChange("read")}
            className={`h-9 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              status === "read"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {t("status.read")}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <input
            aria-label={t("searchAria")}
            className={`w-full h-10 pl-10 pr-10 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-sm ${
              value ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
            }`}
            placeholder={t("searchPlaceholder")}
            value={value}
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {value && (
            <button 
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
  
    </div>
  );
}