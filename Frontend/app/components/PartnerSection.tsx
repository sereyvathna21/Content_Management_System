"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "@/app/styles/PartnerSection.module.css";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Partner {
  src: string;
  name: string;
  href?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const PARTNERS: Partner[] = [
  { src: "/partners/logo 1.svg", name: "Acme Corp" },
  { src: "/partners/logo 2.svg", name: "Globex" },
  { src: "/partners/logo 3.svg", name: "Initech" },
  { src: "/partners/logo 4.svg", name: "Umbrella" },
  { src: "/partners/logo 5.svg", name: "Hooli" },
  { src: "/partners/logo 6.svg", name: "Pied Piper" },
  { src: "/partners/logo 7.svg", name: "Soylent Corp" },
  { src: "/partners/logo 8.svg", name: "Massive Dynamic" },
  { src: "/partners/logo 9.svg", name: "Weyland-Yutani" },
  { src: "/partners/logo 10.svg", name: "Cyberdyne Systems" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function PartnerSection() {
  const t = useTranslations("PartnersPage");

  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Two copies are sufficient for a seamless -50% translateX loop
  const marqueePartners = useMemo(() => [...PARTNERS, ...PARTNERS], []);

  // Detect reduced-motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handlePauseToggle = useCallback(() => setPaused((p) => !p), []);

  const logoClass =
    "w-24 sm:w-32 md:w-40 lg:w-48 xl:w-56 h-12 sm:h-16 md:h-20 lg:h-28 xl:h-32 " +
    "object-contain select-none transition-all duration-300 " +
    "filter grayscale-[0.3] opacity-[0.85] " +
    "hover:grayscale-0 hover:opacity-100 hover:scale-105";

  return (
    <section
      className="partner-section relative flex items-center justify-center mt-10 overflow-hidden bg-white"
      aria-label={t("ariaLabel")}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 60%, rgba(99,102,241,0.08) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 30% at 80% 30%, rgba(236,72,153,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[1400px] mx-auto">
        {/* Heading */}
        <div className="relative z-10 text-center mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-primary/70 mb-2">
            {t("trustedBy")}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight text-primary">
            {t("title")}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="block w-20 h-px bg-primary/50" />
            <span className="w-1.5 h-1.5 bg-primary rotate-45 rounded-sm shadow-md" />
            <span className="block w-20 h-px bg-primary/50" />
          </div>
        </div>

        {/* Marquee track */}
        <div
          className="relative overflow-hidden z-10 py-4"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          role="region"
          aria-label={t("marqueeAriaLabel", { defaultMessage: "Partner logos carousel" })}
        >
          {/* Left fade mask */}
          <div
            className="absolute inset-y-0 left-0 w-40 pointer-events-none z-20"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          {/* Right fade mask */}
          <div
            className="absolute inset-y-0 right-0 w-40 pointer-events-none z-20"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          <ul
            aria-label={t("partnerListLabel", { defaultMessage: "Our partners" })}
            className={`flex items-center gap-4 sm:gap-6 md:gap-8 list-none m-0 p-0 will-change-transform ${styles.marquee} ${
              paused || prefersReducedMotion ? styles.paused : ""
            }`}
          >
            {marqueePartners.map((partner, i) => (
              <li key={`${partner.src}-${i}`} className="flex-shrink-0">
                {partner.href ? (
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={partner.name}
                  >
                    <Image
                      src={partner.src}
                      alt={partner.name}
                      draggable={false}
                      className={logoClass}
                      width={240}
                      height={80}
                      // Avoid lazy-loading logos that are immediately visible
                      priority={i < 5}
                    />
                  </a>
                ) : (
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    draggable={false}
                    className={logoClass}
                    width={240}
                    height={80}
                    priority={i < 5}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}