"use client";
import React from "react";
import ShareControls from "@/app/components/ShareControls";
import { useTranslations, useLocale } from "next-intl";

type Video = {
  id: string;
  title: string;
  date: string;
  embedUrl: string;
  category: string;
  description?: string;
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "events":
      return "bg-blue-600";
    case "programs":
      return "bg-green-600";
    case "impact":
      return "bg-yellow-500 text-black";
    case "partnerships":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
};

export default function VideoPlayerCard({ video }: { video: Video }) {
  const t = useTranslations("NewsPage");
  const locale = useLocale();
  const dateLocale = locale === "kh" ? "km-KH" : locale || "en-US";

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={video.embedUrl}
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ border: "none" }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-fluid-sm text-sm sm:text-base text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(video.date).toLocaleDateString(dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span
              className={`inline-flex text-white items-center px-4 py-1.5 rounded-full text-fluid-xs text-xs sm:text-sm font-bold tracking-wide ${getCategoryColor(
                video.category,
              )} shadow-sm`}
            >
              {t(`categories.${video.category.toLowerCase()}`)}
            </span>
          </div>
          <span className="mb-3">
            <ShareControls />
          </span>
        </div>
      </div>
    </div>
  );
}
