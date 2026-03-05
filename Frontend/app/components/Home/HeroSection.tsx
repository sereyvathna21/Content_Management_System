"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentHero, setCurrentHero] = useState(0);

  const heroImages = ["/hero1.svg", "/hero2.svg", "/hero3.svg", "/hero4.svg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .progress-indicator {
          position: relative;
          overflow: hidden;
        }

        .progress-indicator::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9));
          animation: progressFill 5s linear;
        }

        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hero-img-enter {
          animation: heroFadeIn 0.8s ease-out forwards;
        }
      `}</style>

      <div className="pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <section className="relative w-full overflow-hidden h-[220px] sm:h-[300px] md:h-[380px] lg:h-[460px] xl:h-[540px]">
          {/* Background image */}
          <img
            key={currentHero}
            src={heroImages[currentHero]}
            alt={`Hero Section ${currentHero + 1}`}
            className="hero-img-enter absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Dark overlay */}
          <div className="absolute " />

          {/* Carousel Dots */}
          <div className="absolute bottom-10 sm:bottom-5 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2.5 md:gap-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHero(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentHero
                    ? "w-6 sm:w-7 md:w-8 lg:w-10 h-2 sm:h-2.5 md:h-3 bg-primary shadow-lg progress-indicator"
                    : "w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
