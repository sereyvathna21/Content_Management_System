"use client";
import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface SortControlProps {
  value: string;
  onChange: (value: string) => void;
}

const SortControl: React.FC<SortControlProps> = ({ value, onChange }) => {
  const t = useTranslations("NewsPage");

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-100 rounded-xl shadow-sm px-2 sm:px-3 py-1 sm:py-2">
      <label
        htmlFor="sort"
        className="text-fluid-xs text-xs sm:text-sm font-semibold uppercase text-gray-500 tracking-wider"
      >
        {t("toolbar.sortLabel")}
      </label>
      {/* Custom dropdown */}
      <div>
        <Dropdown value={value} onChange={onChange} />
      </div>
    </div>
  );
};

export default SortControl;

function Dropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Provide explicit direction variants so user can choose asc/desc
  const t = useTranslations("NewsPage");

  const OPTIONS = [
    { value: "", label: t("toolbar.sortOptions.default") },
    { value: "date_desc", label: t("toolbar.sortOptions.date_desc") },
    { value: "date_asc", label: t("toolbar.sortOptions.date_asc") },
  ];

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 bg-transparent text-fluid-sm text-sm sm:text-base font-medium text-primary px-2 sm:px-3 py-1 focus:outline-none whitespace-nowrap min-w-[180px] sm:min-w-[200px] justify-between"
        onKeyDown={(e) => {
          // open with ArrowDown
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setFocusedIndex(0);
          }
        }}
      >
        <span className="sr-only">Open sort menu</span>
        <span className="text-fluid-sm text-sm sm:text-base">
          {current.label}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          tabIndex={-1}
          role="listbox"
          aria-label="Sort options"
          aria-activedescendant={
            focusedIndex !== null
              ? `sort-opt-${String(OPTIONS[focusedIndex].value)}`
              : undefined
          }
          className="absolute right-0 z-50 mt-2 min-w-[220px] sm:min-w-[320px] origin-top-right rounded-md bg-white border border-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {OPTIONS.map((opt, idx) => (
            <li
              id={`sort-opt-${String(opt.value)}`}
              key={opt.value || "default"}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`px-3 py-2 text-fluid-sm text-sm sm:text-base cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                opt.value === value
                  ? "bg-gray-50 font-semibold"
                  : "text-gray-700"
              } ${focusedIndex === idx ? "bg-gray-50" : ""}`}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <svg
                  className="w-4 h-4 text-primary"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
