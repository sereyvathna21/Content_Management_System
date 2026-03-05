"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function VisionSection() {
  const t = useTranslations("VisionPage");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div className="max-w-xl mx-auto mt-2  ">
        <div className="h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full shadow-sm" />
      </div>
      <section
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-all duration-700  ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-primary mb-4">
              {t("title")}
            </h2>

            <p className="text-gray-700 mb-4 leading-relaxed text-xl">
              {t("paragraph")}
            </p>

            <ul className="space-y-3 text-xl">
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                <span className="text-gray-700">{t("bullets.1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                <span className="text-gray-700">{t("bullets.2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                <span className="text-gray-700">{t("bullets.3")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
