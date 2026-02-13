"use client";

import React from "react";
import { useTranslations } from "next-intl";

type LawControlBarProps = {
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  selectedCount: number;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onExportList: () => void;
  onExportSelected: () => void;
  onClearSelected?: () => void;
};

export default function LawControlBar({
  categories,
  selectedCategory,
  searchQuery,
  selectedCount,
  onCategoryChange,
  onSearchChange,
  onExportSelected,
  onClearSelected,
}: LawControlBarProps) {
  const t = useTranslations("LawsPage.control");
  const tRoot = useTranslations("LawsPage");
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4 z-20 backdrop-blur-sm bg-white/95">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          {/* Left section - Categories */}
          <div className="flex-1 w-full lg:w-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 lg:hidden">
              {t("filterByCategory")}
            </h3>

            {/* Dropdown for small/medium screens */}
            <div className="block lg:hidden">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 appearance-none cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {tRoot(`categoryLabels.${cat}`) || cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chips for large screens */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {categories.map((cat) => {
                const active = cat === selectedCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-2 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 transform ${
                      active
                        ? "bg-primary text-white border-primary shadow-lg scale-105"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105"
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2`}
                    />
                    {tRoot(`categoryLabels.${cat}`) || cat}
                    {active && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right section - Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto lg:flex-shrink-0">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Export Button */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={onExportSelected}
                  className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-primary text-white border-primary shadow-lg transition-all duration-200 transform`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="relative z-10">
                    {t("export")} ({selectedCount})
                  </span>
                </button>

                <button
                  onClick={() => onClearSelected?.()}
                  className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold border bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md transition-all duration-200`}
                >
                  {t("clear")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
