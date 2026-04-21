"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentDropZone({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const t = useTranslations("PublicationForm");
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const handleFile = (f: File | null) => {
    setSizeError(false);
    if (f && f.size > MAX_PDF_SIZE) {
      setSizeError(true);
      return;
    }
    onChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") handleFile(f);
  };

  const zoneBase =
    "relative border-2 border-dashed rounded-xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2";
  const zoneClass = file
    ? `${zoneBase} bg-green-50/50 border-green-300 hover:bg-green-50`
    : dragging
      ? `${zoneBase} bg-primary/5 border-primary`
      : `${zoneBase} bg-gray-50 border-gray-300 hover:border-primary/50 hover:bg-gray-50/80 group`;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={zoneClass}
      aria-label={t("attachmentDropzoneAria")}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          cursor: "pointer",
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      />

      {file ? (
        <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm border border-green-100 z-20 relative">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate max-w-40">{file.name}</div>
              <div className="text-[11px] text-gray-500">{formatBytes(file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(null);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none z-30 relative"
            aria-label={t("attachmentRemove")}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-primary">
              {t("attachmentUpload")} <span className="text-gray-400 font-normal">{t("attachmentOrDrag")}</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{t("attachmentMaxSize")}</p>
          </div>
        </>
      )}

      {sizeError && <p className="text-[11px] text-red-500 mt-1.5 z-20 relative">{t("attachmentSizeError")}</p>}
    </div>
  );
}
