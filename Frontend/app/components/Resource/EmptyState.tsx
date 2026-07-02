import React from "react";
import { useTranslations } from "next-intl";

type EmptyStateProps = {
  title?: string;
  message?: string;
  onClear?: () => void;
  clearLabel?: string;
};

export default function EmptyState({
  title,
  message,
  onClear,
  clearLabel,
}: EmptyStateProps) {
  const t = useTranslations("Common");

  return (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || "No documents found matching your criteria."}
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">
        {message || "We couldn't find any documents matching your search criteria. Try adjusting your filters or search term."}
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white font-semibold shadow hover:bg-primary/90 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
        >
          {clearLabel || "Clear Filters"}
        </button>
      )}
    </div>
  );
}
