"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentHero, setCurrentHero] = useState(0);
  const [timer, setTimer] = useState(10);

  const heroImages = ["/hero1.svg", "/hero2.svg", "/hero3.svg", "/hero4.svg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
      setTimer(5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 5));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        .hero-container {
          width: 100%;
          height: auto;
        }
        
        .hero-container img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        @media (max-width: 640px) {
          .hero-container img {
            width: 100%;
            height: auto;
          }
        }
        
        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
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
      `}</style>

      <div className="pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <section className="w-full flex items-center justify-center relative hero-container">
          <img
            src={heroImages[currentHero]}
            alt={`Hero Section ${currentHero + 1}`}
            className="w-full h-auto"
          />
          {/* Carousel Dots */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-8 xl:bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 z-10">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHero(index);
                  setTimer(5);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentHero
                    ? "w-5 sm:w-6 md:w-7 lg:w-8 xl:w-10 h-2 sm:h-2.5 md:h-2.5 lg:h-3 xl:h-3.5 bg-primary shadow-lg progress-indicator"
                    : "w-2 sm:w-2.5 md:w-2.5 lg:w-3 xl:w-3.5 h-2 sm:h-2.5 md:h-2.5 lg:h-3 xl:h-3.5 bg-white/60 hover:bg-white/80"
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
