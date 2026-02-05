import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="w-full sm:w-80 md:w-[320px] inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-xl shadow-sm px-2.5 py-2 sm:px-3 sm:py-3">
      <svg
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 19a8 8 0 100-16 8 8 0 000 16z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <input
        id="search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="text-fluid-sm text-xs sm:text-sm text-gray-500 w-full max-w-[180px] sm:max-w-[220px] md:max-w-[280px]"
      />
    </div>
  );
}
