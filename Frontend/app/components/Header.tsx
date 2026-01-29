"use client";
import Link from "next/link";
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
      <div
        className="max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-6 md:px-8"
        style={{ padding: "clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)" }}
      >
        <div className="transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.svg"
            className="w-auto"
            style={{ height: "clamp(3rem, 8vw, 5rem)" }}
            alt="logo"
          />
        </div>

        <div
          className="flex items-center"
          style={{ gap: "clamp(0.5rem, 2vw, 1rem)" }}
          ref={dropdownRef}
        >
          <div className="relative ">
            <button
              onClick={() => setDropdownOpen((s) => !s)}
              aria-expanded={dropdownOpen}
              className="flex items-center rounded-full text-primary ring-1 ring-primary font-semibold text-fluid-sm"
              style={{
                gap: "clamp(0.25rem, 1vw, 0.5rem)",
                padding:
                  "clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 1rem)",
              }}
            >
              <span style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}>
                {lang === "en" ? "🇬🇧" : "🇰🇭"}
              </span>
              <span className="hidden md:inline">
                {lang === "en" ? "ENG" : "KH"}
              </span>
              <svg
                className={`transition-transform ${dropdownOpen ? "-rotate-180" : "rotate-0"}`}
                style={{
                  width: "clamp(0.875rem, 2vw, 1rem)",
                  height: "clamp(0.875rem, 2vw, 1rem)",
                }}
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
              <div
                className="absolute right-0 bg-white rounded-md shadow-lg z-50"
                style={{
                  marginTop: "clamp(0.375rem, 1vw, 0.5rem)",
                  width: "clamp(8rem, 20vw, 9rem)",
                }}
              >
                <button
                  onClick={() => {
                    setLang("en");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left hover:bg-gray-50 flex items-center ${
                    lang === "en" ? " text-primary font-bold" : ""
                  }`}
                  style={{
                    padding:
                      "clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)",
                    gap: "clamp(0.375rem, 1vw, 0.5rem)",
                  }}
                >
                  <span style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
                    🇬🇧
                  </span>
                  ENG
                </button>
                <button
                  onClick={() => {
                    setLang("kh");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left hover:bg-gray-50 flex items-center ${
                    lang === "kh" ? " text-primary font-bold" : ""
                  }`}
                  style={{
                    padding:
                      "clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)",
                    gap: "clamp(0.375rem, 1vw, 0.5rem)",
                  }}
                >
                  <span style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}>
                    🇰🇭
                  </span>
                  KH
                </button>
              </div>
            )}
          </div>

          <div>
            <Link
              href="/Landing_page/Login"
              className="bg-primary text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 hover:bg-primary/90 text-fluid-sm border border-transparent inline-block"
              style={{
                padding: "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 2rem)",
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
