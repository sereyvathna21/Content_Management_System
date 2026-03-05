"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function TopNav() {
  const t = useTranslations("LoginPage.signIn");
  const tc = useTranslations("Common");
  const currentLocale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const changeLocale = (newLocale: "en" | "kh") => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    setShowLanguageDropdown(false);
    window.location.reload();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-end  gap-4">
          {/* Back to Home Button */}
          <Link
            href="/Landing-page/Home"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg  backdrop-blur-sm  md:text-primary lg:text-primary sm:text-black text-black transition-all duration-200 text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{t("backToHome")}</span>
          </Link>

          {/* Language Switch Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              aria-label={tc("nav.selectLanguage")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 md:text-primary lg:text-primary sm:text-black text-black hover:bg-white/20 transition-all duration-200 text-sm font-medium"
            >
              <span>{currentLocale === "en" ? "🇬🇧" : "🇰🇭"}</span>
              <span className="hidden sm:inline">
                {currentLocale === "en" ? tc("nav.eng") : tc("nav.kh")}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${showLanguageDropdown ? "rotate-180" : ""}`}
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

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[140px] z-50">
                <button
                  onClick={() => changeLocale("en")}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                    currentLocale === "en"
                      ? "bg-gray-50 text-primary font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>{tc("nav.eng")}</span>
                </button>
                <button
                  onClick={() => changeLocale("kh")}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                    currentLocale === "kh"
                      ? "bg-gray-50 text-primary font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <span>🇰🇭</span>
                  <span>{tc("nav.kh")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
