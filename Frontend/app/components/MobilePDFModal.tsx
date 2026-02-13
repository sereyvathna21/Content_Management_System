"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type MobilePDFModalProps = {
  title: string;
  url: string;
  onClose: () => void;
};

export default function MobilePDFModal({
  title,
  url,
  onClose,
}: MobilePDFModalProps) {
  const [mounted, setMounted] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const t = useTranslations("LawsPage");

  useEffect(() => {
    let revoked = false;
    let objUrl: string | null = null;
    async function fetchPdf() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        objUrl = URL.createObjectURL(blob);
        if (!revoked) setBlobUrl(objUrl);
      } catch (e: any) {
        console.error("Failed to fetch PDF as blob:", e);
        setError("Could not load PDF preview — you can open it in a new tab.");
        setBlobUrl(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPdf();

    return () => {
      revoked = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [url]);

  return (
    <div
      className={`sm:hidden fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out transform ${
        mounted ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm pt-4 sm:pt-3">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          aria-label={t("preview.close")}
        >
          <svg
            className="w-6 h-6"
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
        </button>
        <span className="font-semibold truncate flex-1 mx-2 text-fluid-base">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <a href={url} download className="text-primary p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
          <button
            onClick={() => {
              const target = blobUrl || url;
              try {
                window.open(target, "_blank", "noreferrer");
              } catch (e) {
                // fallback to setting location
                window.location.href = target;
              }
            }}
            className="text-primary p-2"
            aria-label={t("preview.openInNewTab")}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l6-6m0 0v4m0-4h-4M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h6"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-auto">
        {loading && (
          <div className="p-4 text-center text-sm text-gray-500">
            {t("preview.loading")}
          </div>
        )}
        {error && (
          <div className="p-4 text-center text-sm text-red-500">
            {t("preview.loadError")}
          </div>
        )}
        <iframe src={blobUrl || url} className="w-full h-full min-h-[320px]" />
      </div>
    </div>
  );
}
