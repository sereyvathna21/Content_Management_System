"use client";

import React, { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useSelection } from "./SelectionContext";
import ConfirmDialog from "./ConfirmDialog";

type ExportItem = {
  key: string;
  title?: string | null;
  pdf?: string | File | Blob | null;
};

const MAX_FILENAME_LENGTH = 100;

function formatFilename(title?: string | null, fallback = "document") {
  const base = (title || fallback).toString();
  const sanitized = base
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_.]/gi, "")
    .trim()
    .replace(/\s+/g, "-");
  if (sanitized.length === 0) return `${fallback}.pdf`;
  const truncated = sanitized.slice(0, MAX_FILENAME_LENGTH);
  return `${truncated}.pdf`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseFilenameFromContentDisposition(header: string | null) {
  if (!header) return null;
  const filenameStarMatch = header.match(/filename\*=(?:UTF-8'')?([^;\n]+)/i);
  if (filenameStarMatch)
    return decodeURIComponent(filenameStarMatch[1].trim().replace(/"/g, ""));
  const filenameMatch = header.match(/filename="?([^";]+)"?/i);
  if (filenameMatch) return filenameMatch[1].trim();
  return null;
}

export default function ExportBar() {
  const { selected, clear, list } = useSelection();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Common");

  const performExport = async () => {
    setLoading(true);
    setError(null);
    const items = list() as ExportItem[];
    if (!items || items.length === 0) {
      setLoading(false);
      return;
    }

    const failed: string[] = [];
    try {
      for (const item of items) {
        try {
          if (typeof item.pdf === "string") {
            const res = await fetch(item.pdf);
            if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
            const blob = await res.blob();
            const headerName = parseFilenameFromContentDisposition(
              res.headers.get("content-disposition"),
            );
            const filename = headerName
              ? headerName
              : formatFilename(item.title);
            downloadBlob(blob, filename);
          } else if (item.pdf instanceof File || item.pdf instanceof Blob) {
            const fileLike = item.pdf as File | Blob;
            const filename =
              item.pdf instanceof File
                ? item.pdf.name || formatFilename(item.title)
                : formatFilename(item.title);
            downloadBlob(fileLike, filename);
          } else {
            throw new Error("No valid PDF source");
          }
        } catch (e) {
          // keep track and continue with others
          console.error(`Download failed for ${item.key}`, e);
          failed.push(item.title || item.key);
        }
      }
    } finally {
      setLoading(false);
      clear();
      if (failed.length > 0) {
        setError(`Failed to download: ${failed.join(", ")}`);
      }
    }
  };

  const performExportCb = useCallback(performExport, [list, clear]);

  const itemsCount = list().length;
  if (itemsCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100001] bg-white border rounded-lg shadow-md p-3 flex items-center gap-3">
        <div className="text-sm text-gray-700">
          {t("ExportBar.selected", { count: itemsCount })}
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
          className="px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          aria-label="Export selected PDFs"
        >
          {t("ExportBar.export")}
        </button>
        <button
          onClick={() => clear()}
          disabled={loading}
          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
          aria-label="Clear selected items"
        >
          {t("ExportBar.clear")}
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("ExportBar.title", { count: itemsCount })}
        message={t("ExportBar.confirmMessage", { count: itemsCount })}
        confirmLabel={
          loading ? t("ExportBar.exporting") : t("ExportBar.confirmLabel")
        }
        cancelLabel={t("ExportBar.cancel")}
        onConfirm={() => {
          setConfirmOpen(false);
          performExportCb();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
