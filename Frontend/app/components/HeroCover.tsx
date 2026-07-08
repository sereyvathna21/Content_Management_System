"use client";

import React from "react";

type Props = {
  image?: string;
  title: string;
  subtitle?: string;
  heightClass?: string;
};

export default function HeroCover({
  image = "/hero1.svg",
  title,
  subtitle,
  heightClass = "h-[220px] sm:h-[300px] md:h-[380px] lg:h-[460px] xl:h-[540px]",
}: Props) {
  return (
    <div className={`relative w-full ${heightClass} animate-fade-in overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
        src={image}
        alt="cover"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out"
      />
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
      />
      <div
        className="relative z-10 h-full flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h1 className="font-extrabold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight animate-slide-up-fade [animation-delay:0.3s] opacity-0">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/90 max-w-2xl mx-auto mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg animate-slide-up-fade [animation-delay:0.6s] opacity-0">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
