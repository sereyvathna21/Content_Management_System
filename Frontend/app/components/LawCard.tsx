"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { getCategoryBadgeClasses } from "@/app/lib/categoryColors";

type LawCardProps = {
  id: string;
  title: string;
  category: string;
  uploadDate?: string;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
};



export default function LawCard({
  title,
  category,
  uploadDate,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
}: LawCardProps) {
  const tCard = useTranslations("LawsPage.card");
  const tRoot = useTranslations("LawsPage");
  return (
    <div
      onClick={onSelect}
      className={`relative group border rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer
        ${isSelected ? "bg-blue-50 shadow-sm" : "bg-white border-gray-200 hover:border-primary/60"}
      `}
    >
      {/* Checkbox */}
      <div
        className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleCheck}
          className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
        />
      </div>

      <div className="flex gap-2 sm:gap-3 items-center">
        {/* Icon */}
        <div
          className={`p-1.5 sm:p-2 md:p-2.5 rounded-md sm:rounded-lg shrink-0 ${
            isSelected ? "bg-white" : "bg-gray-100"
          }`}
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="max-h-20 sm:max-h-28 md:max-h-32 overflow-hidden sm:overflow-auto pr-4 sm:pr-6 custom-scrollbar">
            <h3
              title={title}
              className={`text-sm sm:text-base md:text-lg font-semibold leading-snug ${
                isSelected ? "text-primary" : "text-gray-900"
              } truncate whitespace-nowrap`}
            >
              {title}
            </h3>

            <div className="mt-1 sm:mt-1.5 flex sm:flex-row flex-col sm:items-center items-start gap-1 sm:gap-3">
              <span
                className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border ${getCategoryBadgeClasses(
                  category,
                )}`}
              >
                {tRoot(`categoryLabels.${category}`) || category}
              </span>

              <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 sm:mt-0 truncate">
                {uploadDate
                  ? new Date(uploadDate).toLocaleDateString()
                  : tCard("noDate")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
