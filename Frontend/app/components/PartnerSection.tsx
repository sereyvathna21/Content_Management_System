"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import styles from "@/app/styles/PartnerSection.module.css";

export default function PartnerSection() {
  const t = useTranslations("PartnersPage");
  interface Partner {
    src: string;
    name: string;
    href?: string;
  }

  const partners: Partner[] = useMemo(
    () => [
      { src: "/partners/logo 1.svg", name: "Partner 1" },
      { src: "/partners/logo 2.svg", name: "Partner 2" },
      { src: "/partners/logo 3.svg", name: "Partner 3" },
      { src: "/partners/logo 4.svg", name: "Partner 4" },
      { src: "/partners/logo 5.svg", name: "Partner 5" },
      { src: "/partners/logo 6.svg", name: "Partner 6" },
      { src: "/partners/logo 7.svg", name: "Partner 7" },
      { src: "/partners/logo 8.svg", name: "Partner 8" },
      { src: "/partners/logo 9.svg", name: "Partner 9" },
      { src: "/partners/logo 10.svg", name: "Partner 10" },
    ],
    [],
  );

  const [paused, setPaused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Duplicate partners for seamless infinite loop
  const marqueePartners = useMemo(
    () => [...partners, ...partners, ...partners],
    [partners],
  );

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .group:hover .logo-shine {
          animation: shine-sweep 550ms ease forwards;
        }

        @keyframes shine-sweep {
          0% { opacity: 0; transform: translateX(-100%); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateX(100%); }
        }
      `}</style>;
  return (
    <section className="partner-section relative flex items-center justify-center mt-10  overflow-hidden bg-white ">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 60%, rgba(99,102,241,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 80% 30%, rgba(236,72,153,0.06) 0%, transparent 70%)",
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
          onPointerLeave={() => {
            setPaused(false);
            setHoveredIdx(null);
          }}
          role="region"
          aria-label={t("ariaLabel")}
        >
          <div
            className="absolute inset-y-0 left-0 w-40 pointer-events-none z-20  "
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 right-0 w-40 pointer-events-none z-20  "
            aria-hidden="true"
          />

          <div
            className={`flex items-center gap-4 sm:gap-6 md:gap-8 will-change-transform ${styles.marquee} ${
              paused || prefersReducedMotion ? styles.paused : ""
            }`}
          >
            <ul className="flex items-center gap-4 sm:gap-6 md:gap-8 list-none m-0 p-0">
              {marqueePartners.map((p, i) => {
                const partnerIdx = i % partners.length;
                const isHovered = hoveredIdx === i;
                return (
                  <li key={`${p.src}-${i}`} className="flex-shrink-0">
                    {p.href ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={p.src}
                          alt={p.name}
                          draggable={false}
                          onPointerEnter={() => setHoveredIdx(i)}
                          onPointerLeave={() => setHoveredIdx(null)}
                          className={`w-24 sm:w-32 md:w-40 lg:w-48 xl:w-56 h-12 sm:h-16 md:h-20 lg:h-28 xl:h-32 object-contain select-none transition-transform duration-300 filter grayscale-[0.3] opacity-[0.85] hover:grayscale-0 hover:opacity-100 hover:scale-105 ${isHovered ? "z-30" : ""}`}
                          width={240}
                          height={80}
                        />
                      </a>
                    ) : (
                      <Image
                        src={p.src}
                        alt={p.name}
                        draggable={false}
                        onPointerEnter={() => setHoveredIdx(i)}
                        onPointerLeave={() => setHoveredIdx(null)}
                        className={`w-24 sm:w-32 md:w-40 lg:w-48 xl:w-56 h-12 sm:h-16 md:h-20 lg:h-28 xl:h-32 object-contain select-none transition-transform duration-300 filter grayscale-[0.3] opacity-[0.85] hover:grayscale-0 hover:opacity-100 hover:scale-105 ${isHovered ? "z-30" : ""}`}
                        width={240}
                        height={80}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
