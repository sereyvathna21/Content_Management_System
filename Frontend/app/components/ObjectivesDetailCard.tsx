import React from "react";
import type { Objective } from "@/types/objectives";

type DetailCardProps = {
  objective: Objective;
  objectives: Objective[];
  selectedObjective: number;
  setSelectedObjective: (value: number | ((prev: number) => number)) => void;
};

export default function ObjectivesDetailCard({
  objective,
  objectives,
  selectedObjective,
  setSelectedObjective,
}: DetailCardProps) {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-2xl overflow-hidden w-full md:h-[350px] h-auto flex items-center">
      <div
        className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${objective.color.primary}`}
      />

      <div
        className={`absolute top-0 right-0 w-36 h-36 md:w-48 md:h-48 bg-gradient-to-br ${objective.color.primary} opacity-5 rounded-full blur-3xl transition-all duration-700`}
      />

      <div className="relative flex flex-col h-full justify-center items-center space-y-4 text-center px-4">
        <div
          className={`w-14 h-14 md:w-18 md:h-18 mx-auto rounded-xl bg-gradient-to-br ${objective.color.primary} flex items-center justify-center shadow-xl ${objective.color.glow} transition-all duration-500`}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 text-white">
            {objective.icon}
          </div>
        </div>

        <h2
          className={`text-lg md:text-xl font-bold ${objective.color.text} transition-all duration-500`}
        >
          {objective.title}
        </h2>

        <p className="text-slate-600 text-base leading-relaxed text-center px-2">
          {objective.description}
        </p>

        <div className="flex justify-center items-center space-x-2 pt-3">
          {objectives.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedObjective(i)}
              className="group relative"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${selectedObjective === i ? `bg-gradient-to-r ${objective.color.primary} scale-125` : "bg-slate-300 group-hover:bg-slate-400"}`}
              />
            </button>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 pt-2">
          <button
            onClick={() =>
              setSelectedObjective((prev) =>
                prev === 0 ? objectives.length - 1 : prev - 1,
              )
            }
            className={`p-2 rounded-full border-2 ${objective.color.border} ${objective.color.text} hover:bg-gradient-to-br ${objective.color.primary} hover:text-white transition-all duration-300 hover:scale-110`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() =>
              setSelectedObjective((prev) => (prev + 1) % objectives.length)
            }
            className={`p-2 rounded-full border-2 ${objective.color.border} ${objective.color.text} hover:bg-gradient-to-br ${objective.color.primary} hover:text-white transition-all duration-300 hover:scale-110`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
