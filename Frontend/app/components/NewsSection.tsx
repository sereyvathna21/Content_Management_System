"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import NewsCard from "./NewsCard";
import ListSkeleton from "./ListSkeleton";
import { newsArticles } from "@/app/Landing-page/News/articles";

export default function NewsSection() {
  const t = useTranslations("NewsPage");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Get the first 3 articles from the articles data
  const newsItems = newsArticles.slice(0, 3);

  // demo loading: simulate fetch delay, then disable loading
  useEffect(() => {
    const tmr = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(tmr);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`max-w-7xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 bg-white ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="text-left mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4">
          {t("newsSection.title")}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
          {t("newsSection.subtitle")}
        </p>
      </div>

      {loading ? (
        <ListSkeleton count={newsItems.length} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {newsItems.map((item, idx) => (
            <div
              key={item.id}
              className={`transition-all duration-500 transform ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: isVisible ? `${idx * 150}ms` : "0ms" }}
            >
              <NewsCard
                id={item.id}
                title={item.title}
                excerpt={item.excerpt}
                date={item.date}
                category={item.category}
                image={item.image}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 sm:mt-8 flex justify-center">
        <Link
          href="/Landing-page/News"
          className="border border-primary text-primary px-5 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center"
        >
          {t("newsSection.viewAll")}
        </Link>
      </div>
    </section>
  );
}
