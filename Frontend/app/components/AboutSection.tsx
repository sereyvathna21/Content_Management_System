"use client";

import { useEffect, useRef, useState } from "react";

export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight mt-4 sm:mt-6 md:mt-10 lg:mt-14 xl:mt-20 mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-2">
        What is National Social Protection Council?
      </h1>
      <div className="flex flex-col lg:flex-row items-start gap-3 sm:gap-8 md:gap-10 lg:gap-12 py-4 sm:py-8 md:py-12 lg:py-16">
        <div className="flex-shrink-0 transition-transform duration-700 hover:scale-105 w-auto self-center lg:self-start">
          <img
            src="/minister.svg"
            alt="Minister photo"
            className="rounded-2xl shadow-2xl w-72 sm:w-80 md:min-w-88 lg:w-auto max-w-full mx-auto lg:mx-0"
          />
        </div>

        <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
            A word from our Minister's
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-justify text-gray-700 leading-relaxed">
            The National Social Protection Council (NSPC) is a governmental body
            responsible for formulating and implementing social protection
            policies and programs in Cambodia. Established to address the needs
            of vulnerable populations, the NSPC aims to enhance social welfare,
            reduce poverty, and promote inclusive development across the
            country. The council collaborates with various stakeholders,
            including government agencies, non-governmental organizations, and
            international partners, to design and execute initiatives that
            provide social safety nets, improve access to essential services,
            and support economic empowerment for disadvantaged groups. Through
            its efforts, the NSPC plays a crucial role in fostering social
            cohesion and ensuring that all citizens have the opportunity to lead
            dignified and productive lives.
          </p>
          <button className="border-2 text-primary border-primary px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full font-semibold text-sm sm:text-base w-28 sm:w-32 md:w-36 hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
            See more
          </button>
        </div>
      </div>
    </div>
  );
}
