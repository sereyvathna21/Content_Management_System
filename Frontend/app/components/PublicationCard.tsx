"use client";

import React, { useEffect, useState } from "react";
import usePdfThumbnail from "@/app/lib/usePdfThumbnail";

type Pub = {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  pdf?: string | File;
};

export default function PublicationCard({
  pub,
  onOpen,
}: {
  pub: Pub;
  onOpen?: (p: Pub) => void;
}) {
  const thumb = usePdfThumbnail(pub.pdf, 2);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pub.pdf && typeof pub.pdf !== "string" && pub.pdf instanceof File) {
      const url = URL.createObjectURL(pub.pdf);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
    return;
  }, [pub.pdf]);

  const openHref =
    typeof pub.pdf === "string" ? pub.pdf : objectUrl || undefined;

  // responsive character-based truncation (adjusts with resize)
  const [truncatedTitle, setTruncatedTitle] = useState<string>(() =>
    typeof pub.title === "string" ? pub.title : "",
  );
  const [truncatedDescription, setTruncatedDescription] = useState<string>(
    () => (typeof pub.description === "string" ? pub.description : ""),
  );

  useEffect(() => {
    // compute truncation lengths with mobile-first breakpoints
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
        maxTitle = 50;
        maxDesc = 100;
      } else if (w < 1280) {
        maxTitle = 60;
        maxDesc = 120;
      } else {
        maxTitle = 70;
        maxDesc = 140;
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

    // initial compute (guard window for SSR)
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

  return (
    <div className="bg-white/80 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition p-4 sm:p-5 flex flex-col h-full backdrop-blur-sm">
      <div
        className="relative rounded-lg overflow-hidden mb-4 bg-gray-100"
        style={{ height: "clamp(12rem, 26vw, 18rem)" }}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={pub.title}
            className="object-cover object-top w-full h-full transition-transform duration-400 ease-out hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-sm text-gray-400">
            No preview
          </div>
        )}

        <div className="absolute top-3 left-3 bg-white/40 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold text-gray-800 border border-white/30">
          {pub.category}
        </div>
      </div>

      <h3
        className="text-primary text-base sm:text-lg md:text-xl font-semibold truncate mb-2"
        title={pub.title}
      >
        {truncatedTitle}
      </h3>

      <p
        className="text-sm md:text-base text-gray-600 mb-4"
        title={pub.description}
      >
        {truncatedDescription || ""}
      </p>

      <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-xs text-gray-500">{pub.date}</div>
        </div>

        <div className="w-full sm:w-auto flex justify-end">
          {onOpen ? (
            <button
              onClick={() => onOpen(pub)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary text-white text-sm sm:text-base font-semibold shadow hover:shadow-md transform transition hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Open
            </button>
          ) : openHref ? (
            <a
              href={openHref}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary text-white text-sm sm:text-base font-semibold shadow"
            >
              Open
            </a>
          ) : (
            <button className="w-full text-sm text-gray-400" disabled>
              Open
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
