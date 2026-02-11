"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Pub = {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  pdf?: string | File | undefined;
};

export default function PDFDrawer({
  open,
  pub,
  onClose,
}: {
  open: boolean;
  pub?: Pub | null;
  onClose: () => void;
}) {
  if (!open || !pub) return null;

  const pdfUrl = typeof pub.pdf === "string" ? pub.pdf : undefined;

  // responsive character truncation for title & description
  const [truncatedTitle, setTruncatedTitle] = useState<string>(
    typeof pub.title === "string" ? pub.title : "",
  );
  const [truncatedDescription, setTruncatedDescription] = useState<string>(
    typeof pub.description === "string" ? pub.description : "",
  );

  useEffect(() => {
    // responsive truncation logic (mobile-first)
    const compute = (w: number) => {
      let maxTitle = 60;
      let maxDesc = 120;
      if (w < 640) {
        maxTitle = 30;
        maxDesc = 60;
      } else if (w < 768) {
        maxTitle = 40;
        maxDesc = 80;
      } else if (w < 1024) {
        maxTitle = 55;
        maxDesc = 110;
      } else if (w < 1280) {
        maxTitle = 70;
        maxDesc = 140;
      } else {
        maxTitle = 80;
        maxDesc = 160;
      }

      const tTitle =
        typeof pub.title === "string" && pub.title.length > maxTitle
          ? pub.title.slice(0, maxTitle).trimEnd() + "..."
          : pub.title || "";

      const tDesc =
        typeof pub.description === "string" && pub.description.length > maxDesc
          ? pub.description.slice(0, maxDesc).trimEnd() + "..."
          : pub.description || "";

      setTruncatedTitle(tTitle);
      setTruncatedDescription(tDesc);
    };

    const initialWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    compute(initialWidth);
    const onResize = () => compute(window.innerWidth);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    return;
  }, [pub.title, pub.description]);

  const handleDownload = async () => {
    try {
      if (typeof pub.pdf === "string") {
        const res = await fetch(pub.pdf);
        if (!res.ok) throw new Error("Failed to fetch PDF");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(pub.title || "document")
          .replace(/[^a-z0-9\s\-_.]/gi, "")
          .trim()
          .replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (pub.pdf instanceof File) {
        const url = URL.createObjectURL(pub.pdf);
        const a = document.createElement("a");
        a.href = url;
        a.download = pub.pdf.name || "document.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to download PDF.");
    }
  };

  const drawer = (
    <div className="fixed inset-0 z-[99999] flex">
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in opacity-0"
        style={{ animationDelay: "0s" }}
        onClick={onClose}
      />

      <aside
        className="ml-auto w-full sm:w-[820px] max-w-full h-full bg-white shadow-xl overflow-hidden flex flex-col relative z-50 animate-slide-in-right opacity-0"
        style={{ animationDelay: "0s" }}
      >
        <header className="p-4 sm:p-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                className="text-primary text-lg sm:text-xl md:text-2xl font-semibold title-clamp"
                title={pub.title}
              >
                {truncatedTitle}
              </h3>
              {pub.description && (
                <div
                  className="text-sm md:text-base text-gray-600 mt-1 desc-clamp"
                  title={pub.description}
                >
                  {truncatedDescription}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {pub.category} · {pub.date}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 h-full">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full block"
              title={pub.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              PDF preview not available.
            </div>
          )}
        </div>

        <footer className="p-4 border-t bg-white flex items-center justify-end gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold"
          >
            Download
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-200"
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(drawer, document.body);
}
