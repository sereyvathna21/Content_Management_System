"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type ResourceControlBarProps = {
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  selectedCount?: number;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onExportSelected?: () => void;
  onClearSelected?: () => void;
  searchPlaceholderKey?: string;
  categoryPrefixKey?: string;
};

export default function ResourceControlBar({
  categories,
  selectedCategory,
  searchQuery,
  selectedCount = 0,
  onCategoryChange,
  onSearchChange,
  onExportSelected,
  onClearSelected,
  searchPlaceholderKey = "control.searchPlaceholder",
  categoryPrefixKey = "categoryLabels.",
}: ResourceControlBarProps) {
  const t = useTranslations("Common"); // Using a shared or passed translation
  // Or passing translations from parent would be better, but we will use the one passed or a fallback.
  // Actually, let's just accept translated category labels if possible, but for now we'll do best effort.
  // We'll use a generic translation block.
  const tc = useTranslations();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIndex = categories.indexOf(selectedCategory);

  const getTranslatedCategory = (cat: string) => {
    if (!categoryPrefixKey) return cat;
    const exactKey = `${categoryPrefixKey}${cat}`;
    const lowerKey = `${categoryPrefixKey}${cat.toLowerCase()}`;
    
    // next-intl's tc.has allows us to safely check if a key exists without throwing errors in console
    if (tc.has(exactKey)) return tc(exactKey);
    if (tc.has(lowerKey)) return tc(lowerKey);
    return cat;
  };

  return (
    <div className="sticky top-4 z-20 mb-6 py-2">
      <div>
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
          
          {/* Left section - Categories */}
          <div className="flex-1 w-full xl:w-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 xl:hidden">
              {tc("LawsPage.control.filterByCategory") || "Filter by Category"}
            </h3>

            {/* Dropdown for small/medium screens */}
            <div className="block xl:hidden" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 flex items-center justify-between shadow-sm hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="truncate pr-4">{getTranslatedCategory(selectedCategory) || "Select Category"}</span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-fade-in origin-top">
                    <div className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-200">
                      {categories.map((cat) => {
                        const isSelected = cat === selectedCategory;
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              onCategoryChange(cat);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                              isSelected
                                ? "bg-primary text-white font-semibold shadow-sm"
                                : "text-gray-700 hover:bg-gray-50 font-medium"
                            }`}
                          >
                            <span>{getTranslatedCategory(cat)}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs for large screens */}
            <div className="hidden xl:flex items-center gap-2 w-max max-w-full overflow-x-auto py-2 px-1">
              {categories.map((cat) => {
                const isActive = cat === selectedCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold
                      transition-all duration-300 ease-in-out select-none whitespace-nowrap
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                      ${isActive ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}
                    `}
                  >
                    <span>{getTranslatedCategory(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right section - Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto xl:flex-shrink-0">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-10 py-3 bg-gray-50 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 shadow-sm transition-all duration-200"
                placeholder={tc(searchPlaceholderKey) || "Search..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Export Button (Only if selectedCount > 0 and export functions are provided) */}
            {selectedCount > 0 && onExportSelected && onClearSelected && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onExportSelected}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{tc("LawsPage.control.export") || "Export"} ({selectedCount})</span>
                </button>

                <button
                  onClick={onClearSelected}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  {tc("LawsPage.control.clear") || "Clear"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
