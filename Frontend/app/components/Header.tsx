"use client";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [lang, setLang] = useState<"en" | "kh">("en");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8">
        <div className="transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.svg"
            className="h-12 sm:h-16 md:h-20 w-auto"
            alt="logo"
          />
        </div>

        <div
          className="flex items-center gap-2 sm:gap-3 md:gap-4"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((s) => !s)}
              aria-expanded={dropdownOpen}
              className="flex items-center rounded-full gap-1 sm:gap-2 text-primary border border-primary font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:py-2.5 md:px-5 text-fluid-sm"
            >
              <span className="text-base sm:text-lg">
                {lang === "en" ? "🇬🇧" : "🇰🇭"}
              </span>
              <span className="hidden sm:inline">
                {lang === "en" ? "ENG" : "KH"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${dropdownOpen ? "-rotate-180" : "rotate-0"}`}
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
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    setLang("en");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                    lang === "en" ? " text-primary font-bold" : ""
                  }`}
                >
                  <span className="text-lg">🇬🇧</span>
                  ENG
                </button>
                <button
                  onClick={() => {
                    setLang("kh");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                    lang === "kh" ? " text-primary font-bold" : ""
                  }`}
                >
                  <span className="text-lg">🇰🇭</span>
                  KH
                </button>
              </div>
            )}
          </div>

          <div>
            <button className="bg-primary text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-6 md:py-3 md:px-8 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-primary/90 text-fluid-sm">
              Log in
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
