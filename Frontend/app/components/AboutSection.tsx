"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations("AboutPage");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={sectionRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <h1 className="text-2xl text-primary sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center font-bold mt-4 sm:mt-6 md:mt-10 lg:mt-14 xl:mt-20 mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-2">
        {t("title")}
      </h1>
      <div className="flex flex-col lg:flex-row items-start gap-3 sm:gap-8 md:gap-10 lg:gap-12 py-4 sm:py-8 md:py-12 lg:py-16">
        <div className="flex-shrink-0 transition-transform duration-700 hover:scale-105 w-auto self-center lg:self-start">
          <Image
            src="/minister.svg"
            alt="Minister photo"
            className="rounded-2xl shadow-2xl w-72 sm:w-80 md:min-w-88 lg:w-auto max-w-full mx-auto lg:mx-0"
            width={360}
            height={420}
          />
        </div>

        <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
            {t("ministerTitle")}
          </h2>

          <p
            className="text-lg sm:text-base md:text-lg text-gray-700 leading-relaxed text-justify-full"
            style={{
              
              lineHeight: 2,
              textIndent: "1.5rem",
              whiteSpace: "pre-line",
            }}
          >
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
