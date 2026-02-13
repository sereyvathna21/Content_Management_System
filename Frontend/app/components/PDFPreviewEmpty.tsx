"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function PDFPreviewEmpty() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = useTranslations("LawsPage");

  return (
    <div
      className={`h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)] md:h-[calc(100vh-280px)] min-h-[250px] sm:min-h-[320px] md:min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 bg-gray-50/50 transition-all duration-300 ease-out transform ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="bg-white p-3 sm:p-4 rounded-full shadow-sm mb-3 sm:mb-4">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary">
        {t("preview.emptyTitle")}
      </h3>
      <p className="text-xs sm:text-sm text-primary mt-1 max-w-[200px] sm:max-w-xs leading-relaxed">
        {t("preview.emptySubtitle")}
      </p>
    </div>
  );
}
