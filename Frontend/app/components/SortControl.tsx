import React, { useEffect, useRef, useState } from "react";

interface SortControlProps {
  value: string;
  onChange: (value: string) => void;
}

const SortControl: React.FC<SortControlProps> = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center gap-3 bg-white border border-gray-100 rounded-xl shadow-sm px-3 py-2">
      <label
        htmlFor="sort"
        className="text-xs font-semibold uppercase text-gray-500 tracking-wider"
      >
        Sort by:
      </label>
      {/* Custom dropdown */}
      <div className="relative">
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
  const OPTIONS = [
    { value: "", label: "Default (Newest first)" },
    { value: "date_desc", label: "Date: Newest → Oldest" },
    { value: "date_asc", label: "Date: Oldest → Newest" },
    { value: "title_asc", label: "Title: A–Z" },
    { value: "title_desc", label: "Title: Z–A" },
    { value: "category_asc", label: "Category: A–Z" },
    { value: "category_desc", label: "Category: Z–A" },
  ];

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent | TouchEvent) {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // keyboard navigation when open
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((fi) => {
          const next = fi === null ? 0 : Math.min(OPTIONS.length - 1, fi + 1);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((fi) => {
          const next = fi === null ? OPTIONS.length - 1 : Math.max(0, fi - 1);
          return next;
        });
      } else if (e.key === "Enter") {
        if (focusedIndex !== null) {
          const opt = OPTIONS[focusedIndex];
          onChange(opt.value);
          setOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, focusedIndex, onChange]);

  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  return (
    <div className="relative inline-block text-left" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 bg-transparent text-sm font-medium text-primary px-2 py-1 focus:outline-none"
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
        <span className="text-sm">{current.label}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
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
          className="absolute z-50 mt-2 w-full max-w-xs sm:w-56 origin-top-right rounded-md bg-white border border-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          style={{ right: 0 }}
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
              className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
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
                  aria-hidden
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
