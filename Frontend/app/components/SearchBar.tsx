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
    <div className="w-full sm:w-80 md:w-[320px] relative inline-flex items-center gap-2 sm:gap-3 bg-white border border-primary rounded-xl shadow-sm px-2.5 py-2 sm:px-3 sm:py-3">
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
        className="text-fluid-sm text-xs sm:text-sm text-gray-500 w-full max-w-[180px] sm:max-w-[220px] md:max-w-[280px] focus:outline-none focus:ring-0"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
