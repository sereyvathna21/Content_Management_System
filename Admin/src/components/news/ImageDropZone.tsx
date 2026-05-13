"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageDropZone({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const t = useTranslations();
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setSizeError(false);
    if (f && f.size > MAX_IMAGE_SIZE) {
      setSizeError(true);
      return;
    }
    onChange(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  };

  const zoneBase = "relative border-2 border-dashed rounded-xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden";
  const zoneClass = file
    ? `${zoneBase} bg-green-50/50 border-green-300 hover:bg-green-50`
    : dragging
    ? `${zoneBase} bg-primary/5 border-primary`
    : `${zoneBase} bg-gray-50 border-gray-300 hover:border-primary/50 hover:bg-gray-50/80 group`;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={zoneClass}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 10 }}
      />
      {file ? (
        <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg shadow-sm border border-green-100 z-20 relative">
          <div className="flex items-center gap-2">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
            ) : (
              <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
            <div className="text-left min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">{file.name}</div>
              <div className="text-[11px] text-gray-500">{formatBytes(file.size)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFile(null); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none z-30 relative"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
        </div>
      ) : (
        <>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Upload Image <span className="text-gray-400 font-normal">or drag and drop</span></p>
            <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP up to 10MB</p>
          </div>
        </>
      )}
      {sizeError && (
        <p className="text-[11px] text-red-500 mt-1.5 z-20 relative">File size must be less than 10MB.</p>
      )}
    </div>
  );
}
