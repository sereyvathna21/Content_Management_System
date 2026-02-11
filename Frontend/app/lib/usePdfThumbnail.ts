"use client";

import { useEffect, useState } from "react";

type PdfSource = string | File | undefined | null;

export default function usePdfThumbnail(source?: PdfSource, scale = 1.5) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setThumb(null);
      return;
    }

    let cancelled = false;
    let loadingTask: any = null;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url,
        ).href;

        let arrayBuffer: ArrayBuffer;

        if (typeof source === "string") {
          const res = await fetch(source);
          if (!res.ok) throw new Error("Failed to fetch PDF");
          arrayBuffer = await res.arrayBuffer();
        } else if (source instanceof File) {
          arrayBuffer = await source.arrayBuffer();
        } else {
          throw new Error("Unsupported PDF source");
        }

        loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D context not available");

        await page.render({ canvasContext: ctx, viewport }).promise;
        // use PNG for lossless thumbnail quality
        const dataUrl = canvas.toDataURL("image/png");
        if (!cancelled) setThumb(dataUrl);
      } catch (e) {
        console.error("usePdfThumbnail error", e);
        if (!cancelled) setThumb(null);
      }
    })();

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [source, scale]);

  return thumb;
}
