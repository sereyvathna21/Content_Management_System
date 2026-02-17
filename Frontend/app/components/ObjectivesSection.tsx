"use client";
import React from "react";
import { OBJECTIVES } from "../data/objectives";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("ObjectivesPage");

  return (
    <>
      <div
        ref={sectionRef}
        className="relative py-14 px-4 sm:px-6 lg:px-8 bg-white overflow-x-visible overflow-y-hidden"
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <div
              className={`inline-block transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
            >
              <span className="inline-block px-4 py-2 border border-primary/30 rounded-full text-primary  text-sm font-semibold tracking-wider uppercase mb-4">
                {t("missionLabel")}
              </span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl md:text-6xl font-bold text-primary  transition-all duration-1000 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
            >
              {t("title")}
            </h1>

            <p
              className={`text-black text-lg md:text-xl leading-relaxed max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
            >
              <span className="font-semibold text-primary">
                {t("nspcName")}
              </span>{" "}
              {t("descriptionRest")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 items-center gap-8">
            <div
              className={`relative flex justify-center transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <ObjectivesWheel
                objectives={OBJECTIVES}
                selectedObjective={selectedObjective}
                setSelectedObjective={setSelectedObjective}
              />
            </div>

            <div
              className={`flex justify-center transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
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
    </>
  );
}
