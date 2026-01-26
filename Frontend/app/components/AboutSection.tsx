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
      className={`max-w-7xl mx-auto px-6 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <h1 className="text-5xl md:text-6xl text-center font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight mt-20 mb-6">
        What is National Social Protection Council?
      </h1>
      <div className="flex flex-col md:flex-row items-start gap-12 py-20">
        <div className="flex-shrink-0 transition-transform duration-700 hover:scale-105">
          <img
            src="/minister.svg"
            alt="Minister photo"
            className="rounded-2xl shadow-2xl"
          />
        </div>

        <div className="flex flex-col space-y-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-primary">
            A word from our Minister's
          </h2>

          <p className="text-lg text-justify text-gray-700 leading-relaxed">
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
          <button className="border-2 text-primary border-primary px-6 py-3 rounded-full font-semibold text-base w-36 hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
            See more
          </button>
        </div>
      </div>
    </div>
  );
}
