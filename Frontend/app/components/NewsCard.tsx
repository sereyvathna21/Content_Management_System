"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

// Map category to color
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

function ClientFormattedDate({
  date,
  dateLocale,
  className,
}: {
  date: string;
  dateLocale: string;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState<string>(() => {
    // initial deterministic fallback (ISO date) to avoid large server/client surprises
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return new Date(date).toISOString().slice(0, 10);
    }
  });

  useEffect(() => {
    // compute the locale-aware string on the client and update
    try {
      const formatted = new Date(date).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      setDisplayed(formatted);
    } catch {
      setDisplayed(new Date(date).toISOString().slice(0, 10));
    }
  }, [date, dateLocale]);

  return (
    <time suppressHydrationWarning className={className}>
      {displayed}
    </time>
  );
}

export default function NewsCard({
  id,
  title,
  excerpt,
  date,
  category,
  image,
}: NewsCardProps) {
  const locale = useLocale();
  const t = useTranslations("NewsPage");
  const dateLocale = locale === "kh" ? "km-KH" : locale || "en-US";
  const titleKey = `content.articles.${id}.title`;
  const excerptKey = `content.articles.${id}.excerpt`;
  let displayedTitle = t(titleKey);
  if (displayedTitle === titleKey) displayedTitle = title;
  let displayedExcerpt = t(excerptKey);
  if (displayedExcerpt === excerptKey) displayedExcerpt = excerpt;

  // handle remote image failures by falling back to a local placeholder
  const [imgSrc, setImgSrc] = useState<string>(image);

  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  return (
    <Link href={`/Landing-page/News/${id}`}>
      <article className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImgSrc("/images/placeholder.svg")}
          />

          <div className="absolute top-2 left-2">
            <ClientFormattedDate
              date={date}
              dateLocale={dateLocale}
              className="text-xs sm:text-sm font-semibold text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md"
            />
          </div>

          <div
            className={`absolute top-2 right-2 rounded-md font-semibold text-white text-xs sm:text-sm px-2 py-1 ${getCategoryColor(category)}`}
          >
            {t(`categories.${category.toLowerCase()}`)}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 flex flex-col">
          <h3
            title={title}
            className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate whitespace-nowrap group-hover:text-primary transition-colors"
          >
            {displayedTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 flex-1">
            {displayedExcerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
