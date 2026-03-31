"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export const LanguageToggleButton: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "kh" : "en";
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(newLocale)}; path=/; max-age=${oneYear}`;
    // Refresh server components so the new locale cookie is used
    router.refresh();
  };

  return (
    <button
      onClick={toggleLocale}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label={locale === "en" ? "Switch to Khmer" : "Switch to English"}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {locale === "en" ? "🇺🇸" : "🇰🇭"}
      </span>
      <span className="sr-only">{locale === "en" ? "English" : "Khmer"}</span>
    </button>
  );
};
