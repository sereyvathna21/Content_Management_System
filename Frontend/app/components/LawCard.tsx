import React from "react";

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

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "act":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "regulation":
      return "text-green-600 bg-green-50 border-green-200";
    case "policy":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "notification":
      return "text-purple-600 bg-purple-50 border-purple-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
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
  return (
    <div
      onClick={onSelect}
      className={`relative group border rounded-lg sm:rounded-xl p-2 sm:p-3 cursor-pointer transform transition-all duration-200 ease-out
        ${isSelected ? "bg-blue-50 border-primary ring-1 ring-primary shadow-sm scale-105" : "bg-white border-gray-200 hover:border-primary/50 hover:shadow-sm hover:-translate-y-1"}
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
            isSelected ? "bg-white" : "bg-gray-100 group-hover:bg-blue-50"
          } transition-colors`}
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
          <div className="pr-6 sm:pr-8">
            <h3
              className={`text-sm sm:text-base md:text-lg font-semibold leading-snug line-clamp-2 ${
                isSelected ? "text-primary" : "text-gray-900"
              }`}
            >
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border ${getCategoryColor(
                category,
              )}`}
            >
              {category}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 truncate">
              {uploadDate
                ? new Date(uploadDate).toLocaleDateString()
                : "No Date"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
