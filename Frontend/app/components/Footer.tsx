"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Facebook } from "lucide-react";
import { useTranslations } from "next-intl";
export default function Footer() {
  const t = useTranslations("Common");
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`mt-5 bg-gradient-to-br from-primary via-primary to-primary/90 text-white  transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 md:gap-14 lg:gap-16">
          <div>
            <div className="transition-transform hover:scale-105 duration-300">
              <img
                src="/favicon.svg"
                alt="NSPC logo"
                className="mb-6 sm:mb-8 h-16 sm:h-20 md:h-24 lg:h-32 xl:h-40"
              />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-5 md:mb-6">
              {t("footer.quickLinks")}
            </h4>
            <ul className="text-base sm:text-lg md:text-xl text-white/90 space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/Landing-page/about/national"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/resources"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.resources")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/News"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/Contact"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-5 md:mb-6">
              {t("footer.contactTitle")}
            </h4>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2">
              {t("footer.address")}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-2">
              {t("footer.emailLabel")} info@nspc.gov.kh
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-5 md:mb-6">
              {t("footer.phoneLabel")} +855 23 000 000
            </p>

            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="https://www.facebook.com/CAMNSPC/"
                aria-label="Facebook"
                className="text-2xl sm:text-3xl md:text-4xl hover:scale-125 transition-transform duration-300"
              >
                <Facebook />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-14 md:mt-16 pt-8 sm:pt-9 md:pt-10 border-t border-white/20 text-center text-sm sm:text-base md:text-lg text-white/90">
          {t("footer.rights", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
