"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

type ExportConfirmModalProps = {
  open: boolean;
  items: { id: string; title: string }[];
  onConfirm: () => void;
  onCancel: () => void;
};
export default function ExportConfirmModal({
  open,
  items,
  onConfirm,
  onCancel,
}: ExportConfirmModalProps) {
  const t = useTranslations("LawsPage");
  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden
      />

      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("ExportConfirmModal.confirmExport")}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {t("ExportConfirmModal.exportMessage", { count: items.length })}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {t("ExportConfirmModal.pdfCount", { count: items.length })}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            >
              {t("ExportConfirmModal.actions.cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow"
            >
              {t("ExportConfirmModal.actions.confirmDownload")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }

  return modal;
}
