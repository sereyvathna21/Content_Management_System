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
          height: clamp(200px, 30vw + 80px, 500px);
        }
        
        .hero-container img {
          object-fit: cover;
          object-position: center;
        }
        
        @media (max-width: 640px) {
          .hero-container {
            height: clamp(180px, 50vw, 280px);
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

      <div style={{ paddingTop: "clamp(8.5rem, 10vw + 6rem, 11rem)" }}>
        <section className="w-full flex items-center justify-center overflow-hidden relative hero-container">
          <div className="w-full h-full absolute inset-0">
            <img
              src={heroImages[currentHero]}
              alt={`Hero Section ${currentHero + 1}`}
              className="w-full h-full"
            />
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-[5%] left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentHero(index);
                  setTimer(5);
                }}
                className={`rounded-full transition-all duration-300 ${
                  index === currentHero
                    ? "w-6 sm:w-8 h-2.5 sm:h-3 bg-primary shadow-lg progress-indicator"
                    : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/60 hover:bg-white/80"
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
