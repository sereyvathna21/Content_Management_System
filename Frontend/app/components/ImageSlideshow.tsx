"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSlideshowProps {
  images: string[];
  alt: string;
}

export default function ImageSlideshow({ images, alt }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  // If there's only one image, just render it without arrows
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={images[0]}
            alt={`${alt} background`}
            fill
            className="object-cover blur-2xl opacity-60 scale-110"
            unoptimized
          />
        </div>
        {/* Main Foreground Image */}
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-contain z-10"
          unoptimized
        />
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full aspect-video group overflow-hidden bg-gray-900">
      {/* Images */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Blurred Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src={img}
              alt={`${alt} background ${idx + 1}`}
              fill
              className="object-cover blur-2xl opacity-60 scale-110"
              priority={idx === 0}
              unoptimized
            />
          </div>
          {/* Main Foreground Image */}
          <Image
            src={img}
            alt={`${alt} ${idx + 1}`}
            fill
            className="object-contain z-10 shadow-2xl"
            priority={idx === 0}
            unoptimized
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-4 h-2 sm:w-6 sm:h-2.5 bg-white"
                : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
