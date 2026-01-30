"use client";
import { useEffect, useRef, useState } from "react";

export default function ObjectivesSection() {
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

  const objectives = [
    {
      title: "STARTUP NURTURING",
      description:
        "Nurturing and growing digital startups into successful and sustainable business through startup accelerator programs.",
      color: {
        icon: "fill-blue-500",
        border: "border-blue-500",
        title: "text-blue-500",
        bg: "bg-white",
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 fill-blue-500"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="16" cy="8" r="1.5" />
          <path d="M12 14c-1.5 0-2.8.6-3.7 1.5.9.9 2.2 1.5 3.7 1.5s2.8-.6 3.7-1.5c-.9-.9-2.2-1.5-3.7-1.5z" />
        </svg>
      ),
    },
    {
      title: "COMMUNITY",
      description:
        "Enhancing positive interaction among stakeholders through various community programs such as meetups, talkshow, documentaries, capacity building activities and networking events.",
      color: {
        icon: "fill-purple-500",
        border: "border-purple-500",
        title: "text-purple-500",
        bg: "bg-white",
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 fill-purple-500"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      title: "DIGITAL PLATFORM",
      description:
        "Developing digital platforms, solutions, and services that startups can plug into and build upon as well as find resources and investors.",
      color: {
        icon: "stroke-cyan-500 fill-cyan-500",
        border: "border-cyan-500",
        title: "text-cyan-500",
        bg: "bg-white",
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14"
        >
          <rect
            x="4"
            y="6"
            width="16"
            height="12"
            rx="1"
            fill="none"
            className="stroke-cyan-500"
            strokeWidth="2"
          />
          <path
            d="M8 6V4c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v2"
            fill="none"
            className="stroke-cyan-500"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="2" className="fill-cyan-500" />
          <path
            d="M12 14v4m-3-2h6"
            className="stroke-cyan-500"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      title: "RESEARCH",
      description:
        "Conducting research to gather trusted, accurate data and information that startups and stakeholders can use as resources.",
      color: {
        icon: "fill-indigo-500",
        border: "border-indigo-500",
        title: "text-indigo-500",
        bg: "bg-white",
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 fill-indigo-500"
        >
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
          <path d="M17.5 10.5c.88 0 1.73.09 2.5.26V9.24c-.79-.15-1.64-.24-2.5-.24-.69 0-1.52.08-2.4.23v1.57c.85-.1 1.61-.3 2.4-.3z" />
        </svg>
      ),
    },
    {
      title: "ENTERPRISES GO DIGITAL",
      description:
        "Aiming to strengthen enterprises' digital capabilities through digital adoption and enable them to become active agents in the digital economy and business.",
      color: {
        icon: "fill-orange-500",
        border: "border-orange-500",
        title: "text-orange-500",
        bg: "bg-white",
      },
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 fill-orange-500"
        >
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-primary/80"
    >
      <div className="max-w-[1400px] mx-auto">
        <h1
          className={`text-center text-white text-fluid-5xl font-bold mb-6 sm:mb-8 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          What We Do?
        </h1>

        <p
          className={`text-center text-white text-fluid-base leading-relaxed mb-12 sm:mb-16 max-w-[1200px] mx-auto px-4 transition-all duration-1000 delay-150 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-10"
          }`}
        >
          <span className="font-bold ">
            The National Social Protection Council (NSPC) of Cambodia{" "}
          </span>
          is the high-level body responsible for developing, regulating, and
          harmonizing the national social protection system to reduce poverty
          and vulnerability. It coordinates social security and assistance
          policies, manages the identification of poor households (IDPoor), and
          ensures sustainable, inclusive coverage for citizens.
        </p>

        {/* Top 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {objectives.slice(0, 3).map((objective, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 sm:p-8 md:p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group ${objective.color.bg} ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } ${index === 0 ? "delay-150" : index === 1 ? "delay-300" : "delay-[450ms]"}`}
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-[100px] md:h-[100px] mx-auto mb-5 sm:mb-6 border-3 sm:border-4 ${objective.color.border} rounded-full flex items-center justify-center bg-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                {objective.icon}
              </div>
              <h2
                className={`${objective.color.title} text-fluid-xl font-bold mb-4 sm:mb-5 tracking-wide`}
              >
                {objective.title}
              </h2>
              <p className="text-gray-600 text-fluid-sm leading-relaxed">
                {objective.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-[900px] mx-auto">
          {objectives.slice(3, 5).map((objective, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 sm:p-8 md:p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group ${objective.color.bg} ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } ${index === 0 ? "delay-[600ms]" : "delay-[750ms]"}`}
            >
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-[100px] md:h-[100px] mx-auto mb-5 sm:mb-6 border-3 sm:border-4 ${objective.color.border} rounded-full flex items-center justify-center bg-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                {objective.icon}
              </div>
              <h2
                className={`${objective.color.title} text-fluid-xl font-bold mb-4 sm:mb-5 tracking-wide`}
              >
                {objective.title}
              </h2>
              <p className="text-gray-600 text-fluid-sm leading-relaxed">
                {objective.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
