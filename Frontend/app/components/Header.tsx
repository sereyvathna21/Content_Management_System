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

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-md transition-all duration-500 border-b border-gray-100">
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
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((s) => !s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDropdownOpen((s) => !s);
                }
              }}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Select language"
              className="flex items-center rounded-full text-primary ring-1 ring-primary font-semibold text-fluid-sm hover:ring-2 hover:bg-primary/5 focus:ring-2 focus:outline-none focus:ring-primary/50 transition-all duration-300"
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
                className="absolute right-0 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 animate-slideDown overflow-hidden"
                role="menu"
                style={{
                  marginTop: "clamp(0.375rem, 1vw, 0.5rem)",
                  width: "clamp(8rem, 20vw, 9rem)",
                  animation: "slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <style jsx>{`
                  @keyframes slideDown {
                    from {
                      opacity: 0;
                      transform: translateY(-8px) scale(0.95);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0) scale(1);
                    }
                  }
                `}</style>
                <button
                  onClick={() => {
                    setLang("en");
                    setDropdownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLang("en");
                      setDropdownOpen(false);
                    }
                  }}
                  role="menuitem"
                  className={`w-full text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none flex items-center transition-all duration-200 ${
                    lang === "en" ? "bg-primary/5 text-primary font-bold" : ""
                  }`}
                  style={{
                    padding:
                      "clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 1rem)",
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLang("kh");
                      setDropdownOpen(false);
                    }
                  }}
                  role="menuitem"
                  className={`w-full text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none flex items-center transition-all duration-200 ${
                    lang === "kh" ? "bg-primary/5 text-primary font-bold" : ""
                  }`}
                  style={{
                    padding:
                      "clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 1rem)",
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
              className="bg-primary text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none border border-transparent inline-block"
              style={{
                padding:
                  "clamp(0.5rem, 1.5vw, 0.875rem) clamp(1rem, 2.5vw, 2rem)",
                fontSize: "clamp(0.875rem, 2vw, 1rem)",
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
