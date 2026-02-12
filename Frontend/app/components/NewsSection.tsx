"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsSection() {
  const t = useTranslations("NewsPage");
  const [isVisible, setIsVisible] = useState(false);
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

  const newsItems = [
    {
      title: "NSPC launches new outreach program",
      date: "Jan 15, 2026",
      excerpt:
        "A new initiative to expand social protection services across provinces.",
      image: "/hero3.svg",
    },
    {
      title: "Publication: Social Protection Report 2025",
      date: "Dec 22, 2025",
      excerpt:
        "Comprehensive findings and recommendations from the 2025 study.",
      image: "/hero2.svg",
    },
    {
      title: "Public Consultation Schedule Announced",
      date: "Nov 30, 2025",
      excerpt:
        "Join us for regional consultations to gather feedback on the draft policy.",
      image: "/hero1.svg",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`max-w-7xl mx-auto py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4">
          {t("newsSection.title")}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
          {t("newsSection.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {newsItems.map((item, idx) => (
          <article
            key={idx}
            className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: isVisible ? `${idx * 150}ms` : "0ms" }}
          >
            {/* Image Section */}
            <div className="relative h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <time className="text-xs sm:text-sm font-semibold text-white bg-primary/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                  {item.date}
                </time>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-5 md:p-6">
              <h3 className="font-bold text-base sm:text-lg md:text-xl mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                {item.excerpt}
              </p>
              <div className="flex justify-end">
                <Link
                  href="/Landing-page/news"
                  className="text-primary font-semibold hover:gap-3 flex items-center gap-2 text-sm sm:text-base transition-all duration-300 group-hover:translate-x-1"
                >
                  {t("newsSection.readMore")}
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 flex justify-center">
        <Link
          href="/Landing-page/News"
          className="bg-primary text-white px-5 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
        >
          {t("newsSection.viewAll")}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
