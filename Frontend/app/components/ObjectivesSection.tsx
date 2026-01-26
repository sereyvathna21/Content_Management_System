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
      icon: "🎯",
      title: "Protect Vulnerable Groups",
      description:
        "Design and deliver safety nets to reduce poverty and vulnerability.",
    },
    {
      icon: "📘",
      title: "Policy & Research",
      description: "Develop evidence-based policies and monitor impact.",
    },
    {
      icon: "🤝",
      title: "Partnerships",
      description: "Collaborate with stakeholders to scale effective programs.",
    },
    {
      icon: "🌱",
      title: "Inclusive Development",
      description: "Promote inclusive growth and reduce regional inequalities.",
    },
    {
      icon: "🛠️",
      title: "Capacity Building",
      description:
        "Strengthen institutions and workforce to deliver effective programs.",
    },
  ];

  return (
    <div
      ref={sectionRef}
      className={`bg-gradient-to-br from-primary via-primary to-primary/90 py-20 mt-20 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Our Objectives
        </h2>
        <p className="text-white/90 text-center text-lg mb-12 max-w-3xl mx-auto">
          Committed to building a stronger, more inclusive Cambodia through
          comprehensive social protection
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {objectives.map((objective, index) => (
            <article
              key={index}
              className={`bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col justify-between hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {objective.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">{objective.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {objective.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="bg-white text-primary px-8 py-3 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
}
