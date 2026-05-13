"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface MultiImageDropZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export default function MultiImageDropZone({ files, onChange, maxFiles = 10 }: MultiImageDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    setSizeError(false);
    if (!newFiles) return;

    const validFiles: File[] = [];
    let hasSizeError = false;

    Array.from(newFiles).forEach(f => {
      if (f.size > MAX_IMAGE_SIZE) {
        hasSizeError = true;
      } else {
        validFiles.push(f);
      }
    });

    if (hasSizeError) setSizeError(true);

    if (validFiles.length > 0) {
      const combined = [...files, ...validFiles].slice(0, maxFiles);
      onChange(combined);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChange(updated);
  };

  const zoneBase = "relative border-2 border-dashed rounded-xl p-3 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden";
  const zoneClass = dragging
    ? `${zoneBase} bg-primary/5 border-primary`
    : `${zoneBase} bg-gray-50 border-gray-300 hover:border-primary/50 hover:bg-gray-50/80 group`;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={zoneClass}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", zIndex: 10 }}
        />
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-primary">Upload Images <span className="text-gray-400 font-normal">or drag and drop</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP up to 10MB (Max {maxFiles})</p>
        </div>
      </div>
      
      {sizeError && (
        <p className="text-[11px] text-red-500 mt-1.5">Some files were skipped because they exceed 10MB.</p>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt="Preview" className="w-full h-20 object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(idx); }}
                  className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
