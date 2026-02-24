"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Facebook } from "lucide-react";
import Image from "next/image";
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
      className={`mt-5 bg-gradient-to-br from-primary via-primary to-primary/90 text-white transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Logo & Description */}
          <div>
            <div className="transition-transform hover:scale-105 duration-300">
              <Image
                src="/favicon.svg"
                alt="NSPC logo"
                className="mb-4 sm:mb-6 h-16 sm:h-20 md:h-24"
                width={120}
                height={120}
              />
            </div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* About Us Links */}
          <div>
            <h4 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5">
              {t("nav.about")}
            </h4>
            <ul className="text-sm sm:text-base text-white/90 space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/Landing-page/About-us/National"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.aboutDropdown.national.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/About-us/Executive"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.aboutDropdown.executive.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/About-us/General"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.aboutDropdown.general.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5">
              {t("nav.resources")}
            </h4>
            <ul className="text-sm sm:text-base text-white/90 space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/Landing-page/Resources/Laws"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.resourcesDropdown.laws.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/Resources/Publication"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.resourcesDropdown.publication.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing-page/Resources/Social"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {t("nav.resourcesDropdown.social.title")}
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
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-5">
              {t("footer.contactTitle")}
            </h4>
            <div className="space-y-3 text-sm sm:text-base text-white/90">
              <p className="leading-relaxed">{t("footer.address")}</p>
              <a
                href="mailto:info@nspc.gov.kh"
                className="hover:text-white hover:underline transition-all duration-300 block"
              >
                <span className="font-semibold">{t("footer.emailLabel")}</span>{" "}
                info@nspc.gov.kh
              </a>
              <a
                href="tel:+85523000000"
                className="hover:text-white hover:underline transition-all duration-300 block"
              >
                <span className="font-semibold">{t("footer.phoneLabel")}</span>{" "}
                +855 23 000 000
              </a>
            </div>

            <div className="mt-5 sm:mt-6">
              <h5 className="font-semibold text-base sm:text-lg mb-3">
                Follow Us
              </h5>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/CAMNSPC/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="bg-blue-600 hover:bg-blue-700 rounded-full p-2.5 sm:p-3 hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <Link
                  href="/Landing-page/Contact"
                  className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 text-sm font-semibold hover:scale-105 transition-all duration-300"
                >
                  {t("nav.contact")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20 text-center text-sm sm:text-base text-white/80"
          suppressHydrationWarning={true}
        >
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
