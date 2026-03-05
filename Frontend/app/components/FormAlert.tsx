"use client";
import React, { useEffect } from "react";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";

type AlertType = "success" | "error" | "warning";

export default function FormAlert({
  type = "success",
  message,
  onClose,
  autoCloseMs = 6000,
}: {
  type?: AlertType;
  message: string;
  onClose?: () => void;
  autoCloseMs?: number | null;
}) {
  useEffect(() => {
    if (!autoCloseMs || !onClose) return;
    const t = setTimeout(() => onClose(), autoCloseMs);
    return () => clearTimeout(t);
  }, [autoCloseMs, onClose]);

  const base = "p-4 rounded-lg flex items-start gap-3";
  const variants: Record<AlertType, string> = {
    success: "bg-green-50 text-green-800 border border-green-200",
    error: "bg-red-50 text-red-800 border border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  };

  const icon =
    type === "success" ? (
      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
    ) : type === "warning" ? (
      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
    ) : (
      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
    );

  return (
    <div
      className={`${base} ${variants[type]} animate-slide-down`}
      role="alert"
    >
      {icon}
      <div className="flex-1 text-sm sm:text-base">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close alert"
          className="text-current opacity-80 hover:opacity-100 ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
