"use client";
import { useEffect, useRef, useState } from "react";

export default function ChangeManagementSection() {
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

  const phases = [
    {
      icon: "🔄",
      number: "01",
      title: "Change Impact Analysis",
      description: "Assessing how changes affect stakeholders.",
      color: "bg-teal-400",
    },
    {
      icon: "🔍",
      number: "02",
      title: "Communication Strategy Development",
      description: "Ensuring transparency during changes.",
      color: "bg-purple-400",
    },
    {
      icon: "☀️",
      number: "03",
      title: "User Adoption Support",
      description: "Helping teams adapt to updated processes.",
      color: "bg-yellow-400",
    },
    {
      icon: "✅",
      number: "04",
      title: "Resistance Management Approach",
      description: "Addressing concerns and challenges.",
      color: "bg-teal-500",
    },
    {
      icon: "🧠",
      number: "05",
      title: "Training Reinforcement Activities",
      description: "Strengthening understanding of new practices.",
      color: "bg-purple-500",
    },
  ];

  return (
    <div
      ref={sectionRef}
      className={`relative py-20 transition-all duration-1000 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{
        background:
          "linear-gradient(135deg, #4CAF4F 0%, #45a049 50%, #4CAF4F 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 8s ease infinite",
      }}
    >
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-fluid-5xl font-bold text-white text-center mb-3 sm:mb-4">
          Change Management Process
        </h2>
        <p className="text-white/90 text-center text-fluid-base mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4">
          A comprehensive approach to managing organizational change effectively
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {phases.map((phase, index) => (
            <article
              key={index}
              className={`bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl h-full flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 hover:scale-105 group relative overflow-hidden ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                <div
                  className={`${phase.color} w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                >
                  {phase.icon}
                </div>
                <div>
                  <h3 className="font-bold text-fluid-xl mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-fluid-sm text-gray-600 leading-relaxed mb-4">
                    {phase.description}
                  </p>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-200 absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                    {phase.number}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
          <button className="bg-white text-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-fluid-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-gray-50">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}
