"use client";

import React from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  if (typeof document === "undefined") return null;

  const dialog = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden
      />

      <div className="relative z-50 w-full max-w-lg bg-white rounded-md shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
