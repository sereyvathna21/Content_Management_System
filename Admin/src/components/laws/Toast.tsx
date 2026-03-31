"use client";
import React from "react";

export default function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error"; onDismiss: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const base = "fixed bottom-6 right-6 z-50 p-3 rounded-md text-sm font-medium shadow";
  const cls = type === "success"
    ? `${base} bg-green-50 text-green-700 border border-green-100`
    : `${base} bg-red-50 text-red-700 border border-red-100`;

  return (
    <div role="status" aria-live="polite" className={cls}>
      {message}
    </div>
  );
}
