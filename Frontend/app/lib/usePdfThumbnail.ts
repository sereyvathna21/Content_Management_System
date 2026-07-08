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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadingTask: any = null;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
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

        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf: any = await loadingTask.promise;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page: any = await pdf.getPage(1);
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
      } catch (e: any) {
        if (
          cancelled ||
          e?.name === "RenderingCancelledException" ||
          (e instanceof Error && e.message.includes("Worker was destroyed"))
        ) {
          // Ignore cancellation errors expected during rapid navigation/search
          return;
        }
        console.error("usePdfThumbnail error", e);
        if (!cancelled) setThumb(null);
      }
    })();

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch {
        // ignore
      }
    };
  }, [source, scale]);

  return thumb;
}
