"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function Header() {
  const currentLocale = useLocale();
  const t = useTranslations("Common");
  const [lang, setLang] = useState<"en" | "kh">(currentLocale as "en" | "kh");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Update lang state when locale changes
  useEffect(() => {
    setLang(currentLocale as "en" | "kh");
  }, [currentLocale]);

  const changeLocale = (newLocale: "en" | "kh") => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setLang(newLocale);
    setDropdownOpen(false);
    // Reload page to apply new locale
    window.location.reload();
  };

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-lg shadow-md transition-all duration-500 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-4">
        <div className="transition-transform hover:scale-105 duration-300">
          <Image
            src="/logo.svg"
            className="w-auto h-12 sm:h-14 md:h-16 lg:h-20"
            alt="logo"
            width={160}
            height={64}
          />
        </div>

        <div
          className="flex items-center gap-2 sm:gap-3 md:gap-4"
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
              aria-label={t("nav.selectLanguage")}
              className="flex items-center gap-1 sm:gap-2 rounded-full text-primary ring-1 ring-primary font-semibold text-sm hover:ring-2 hover:bg-primary/5 focus:ring-2 focus:outline-none focus:ring-primary/50 transition-all duration-300 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5"
            >
              <span className="text-base sm:text-lg md:text-xl">
                {lang === "en" ? "🇬🇧" : "🇰🇭"}
              </span>
              <span className="hidden md:inline">
                {lang === "en" ? t("nav.eng") : t("nav.kh")}
              </span>
              <svg
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${dropdownOpen ? "-rotate-180" : "rotate-0"}`}
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
                className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden w-32 sm:w-36"
                role="menu"
                style={{
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
                    changeLocale("en");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      changeLocale("en");
                    }
                  }}
                  role="menuitem"
                  className={`w-full text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none flex items-center gap-2 transition-all duration-200 px-3 py-2 sm:px-4 sm:py-2.5 ${
                    lang === "en" ? "bg-primary/5 text-primary font-bold" : ""
                  }`}
                >
                  <span className="text-base sm:text-lg">🇬🇧</span>
                  {t("nav.eng")}
                </button>
                <button
                  onClick={() => {
                    changeLocale("kh");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      changeLocale("kh");
                    }
                  }}
                  role="menuitem"
                  className={`w-full text-left hover:bg-primary/10 focus:bg-primary/10 focus:outline-none flex items-center gap-2 transition-all duration-200 px-3 py-2 sm:px-4 sm:py-2.5 ${
                    lang === "kh" ? "bg-primary/5 text-primary font-bold" : ""
                  }`}
                >
                  <span className="text-base sm:text-lg">🇰🇭</span>
                  {t("nav.kh")}
                </button>
              </div>
            )}
          </div>

          <div>
            <Link
              href="/Landing-page/Login"
              className="bg-primary text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:outline-none border border-transparent inline-block px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base"
            >
              {t("nav.login")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
