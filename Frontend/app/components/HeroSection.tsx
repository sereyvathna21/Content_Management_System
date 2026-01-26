"use client";

import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentHero, setCurrentHero] = useState(0);
  const [timer, setTimer] = useState(5);

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
            transform: scale(1.05);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        .hero-animate {
          animation: fadeInOut 5s ease-in-out;
        }
      `}</style>

      <div className="pt-44">
        <section className="w-full flex items-center justify-center overflow-hidden relative">
          <div className="hero-animate w-full h-full">
            <img
              src={heroImages[currentHero]}
              alt={`Hero Section ${currentHero + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 flex gap-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHero(index);
                  setTimer(5);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentHero
                    ? "w-8 h-3 bg-primary shadow-lg"
                    : "w-3 h-3 bg-white/60 hover:bg-white/80"
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
