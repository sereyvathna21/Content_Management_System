"use client";

import React from "react";
import { useTranslations } from "next-intl";

type CategoryOption = {
  value: string;
  label: string;
};

type Props = {
  query: string;
  onSearch: (q: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: CategoryOption[];
  action?: React.ReactNode;
};

export default function PublicationFilters({
  query,
  onSearch,
  category,
  onCategoryChange,
  categories,
  action,
}: Props) {
  const t = useTranslations("PublicationsPage");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div role="group" aria-label={t("filters.aria")} className="flex flex-wrap items-center gap-2">
          {categories.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={category === opt.value}
              onClick={() => onCategoryChange(opt.value)}
              className={`h-9 px-3 rounded-full text-sm font-medium transition flex items-center justify-center ${
                category === opt.value
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <input
          aria-label={t("searchAria")}
          className={`w-full sm:w-64 h-9 px-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 text-sm ${
            query ? "border-gray-300" : "border-gray-200"
          }`}
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        {action}
      </div>
    </div>
  );
}
