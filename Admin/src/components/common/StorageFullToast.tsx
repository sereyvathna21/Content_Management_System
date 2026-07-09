"use client";
import React, { useEffect, useState } from "react";

export default function StorageFullToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleStorageFull = () => {
      setShow(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShow(false), 8000);
    };

    window.addEventListener("session-storage-full", handleStorageFull);
    return () => {
      window.removeEventListener("session-storage-full", handleStorageFull);
      clearTimeout(timeout);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-xl max-w-sm">
        <div className="shrink-0 pt-0.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">Browser Storage Full</p>
          <p className="text-xs mt-1 text-red-600/90 leading-relaxed">
            Your form draft couldn't be saved because your browser's temporary storage limit was reached.
            <br className="mb-1" />
            Close some unused tabs or forms to free up space.
          </p>
        </div>
        <button onClick={() => setShow(false)} className="text-red-400 hover:text-red-700 ml-2 pt-0.5 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}
