"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function GoalsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" },
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const goals = [
    {
      title: "Inclusive Protection",
      desc: "Design social programs that reach the most vulnerable and leave no one behind.",
      icon: (
        <Image
          src="/goals/goal1.svg"
          alt="Inclusive Protection icon"
          width={48}
          height={48}
        />
      ),
    },
    {
      title: "Poverty Reduction",
      desc: "Implement targeted support to sustainably lift households out of poverty.",
      icon: (
        <Image
          src="/goals/goal2.svg"
          alt="Poverty Reduction icon"
          width={48}
          height={48}
        />
      ),
    },
    {
      title: "Access to Services",
      desc: "Improve access to health, education and social services for all communities.",
      icon: (
        <Image
          src="/goals/goal3.svg"
          alt="Access to Services icon"
          width={48}
          height={48}
        />
      ),
    },
    {
      title: "Resilience & Capacity",
      desc: "Strengthen household and community resilience to shocks and stresses.",
      icon: (
        <Image
          src="/goals/goal2.svg"
          alt="Resilience & Capacity icon"
          width={48}
          height={48}
        />
      ),
    },
  ];

  return (
    <div
      ref={ref}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-8 transition-all duration-700  ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-primary/95 mb-6">
        Our Goals
      </h2>

      <p className="text-center text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
        The National Social Protection Council pursues a set of strategic goals
        to promote equity, reduce vulnerability, and ensure access to essential
        services for all Cambodians.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {goals.map((g) => (
          <div
            key={g.title}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              {React.cloneElement(g.icon, { className: "w-12 h-12" })}
              <h3 className="text-lg font-bold text-gray-800">{g.title}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{g.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
