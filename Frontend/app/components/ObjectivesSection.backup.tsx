"use client";
import React from "react";
import { OBJECTIVES } from "../data/objectives";
import {
  useIntersectionObserver,
  useAutoRotation,
} from "../hooks/useObjectivesSection";
import ObjectivesWheel from "./ObjectivesWheel";
import ObjectivesDetailCard from "./ObjectivesDetailCard";

export default function ObjectivesSection() {
  const { isVisible, sectionRef } = useIntersectionObserver();
  const { selectedObjective, setSelectedObjective } =
    useAutoRotation(OBJECTIVES);

  return (
    <div
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-6">
          <div
            className={`inline-block transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
          >
            <span className="inline-block px-4 py-2 border border-primary rounded-full text-primary text-sm font-semibold tracking-wider uppercase mb-4">
              Our Mission
            </span>
          </div>

          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-bold bg-primary bg-clip-text text-transparent transition-all duration-1000 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
          >
            What We Do?
          </h1>

          <p
            className={`text-black text-lg md:text-xl leading-relaxed max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
          >
            <span className="font-semibold text-primary">
              The National Social Protection Council (NSPC) of Cambodia
            </span>{" "}
            is the high-level body responsible for developing, regulating, and
            harmonizing the national social protection system to reduce poverty
            and vulnerability.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div
            className={`flex justify-center transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <ObjectivesWheel
              objectives={OBJECTIVES}
              selectedObjective={selectedObjective}
              setSelectedObjective={setSelectedObjective}
            />
          </div>

          <div
            className={`transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <ObjectivesDetailCard
              objective={OBJECTIVES[selectedObjective]}
              objectives={OBJECTIVES}
              selectedObjective={selectedObjective}
              setSelectedObjective={setSelectedObjective}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
