import React from "react";
import type { Objective } from "@/types/objectives";
import { gradientIdFrom } from "@/app/lib/colorUtils";

type WheelProps = {
  objectives: Objective[];
  selectedObjective: number;
  setSelectedObjective: (value: number | ((prev: number) => number)) => void;
};

export default function ObjectivesWheel({
  objectives,
  selectedObjective,
  setSelectedObjective,
}: WheelProps) {
  return (
    <div className="relative w-[360px] h-[280px] sm:w-[430px] sm:h-[350px] md:w-[480px] md:h-[400px] lg:w-[530px] lg:h-[450px] mx-auto overflow-visible">
      <svg
        viewBox="0 0 400 400"
        overflow="visible"
        preserveAspectRatio="xMidYMid meet"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] -rotate-90"
      >
        <defs>
          <linearGradient
            id="gradient-blue"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient
            id="gradient-purple"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <linearGradient
            id="gradient-cyan"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient
            id="gradient-indigo"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient
            id="gradient-green"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#4CAF4F" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient
            id="gradient-orange"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
          </filter>
        </defs>

        {objectives.map((objective, index) => {
          const segmentAngle = 360 / objectives.length;
          const startAngle = index * segmentAngle;
          const endAngle = startAngle + segmentAngle;
          const gap = 6;

          const outerRadius = 200;
          const innerRadius = 110;

          const startAngleRad = ((startAngle + gap) * Math.PI) / 180;
          const endAngleRad = ((endAngle - gap) * Math.PI) / 180;

          const x1 = 200 + outerRadius * Math.cos(startAngleRad);
          const y1 = 200 + outerRadius * Math.sin(startAngleRad);
          const x2 = 200 + outerRadius * Math.cos(endAngleRad);
          const y2 = 200 + outerRadius * Math.sin(endAngleRad);
          const x3 = 200 + innerRadius * Math.cos(endAngleRad);
          const y3 = 200 + innerRadius * Math.sin(endAngleRad);
          const x4 = 200 + innerRadius * Math.cos(startAngleRad);
          const y4 = 200 + innerRadius * Math.sin(startAngleRad);

          // Format numeric values to fixed decimals to avoid tiny server/client
          // floating-point differences that can cause React hydration errors.
          const fmt = (n: number) => Number(n.toFixed(3));

          const fx1 = fmt(x1);
          const fy1 = fmt(y1);
          const fx2 = fmt(x2);
          const fy2 = fmt(y2);
          const fx3 = fmt(x3);
          const fy3 = fmt(y3);
          const fx4 = fmt(x4);
          const fy4 = fmt(y4);

          const largeArcFlag = segmentAngle - gap * 2 > 180 ? 1 : 0;

          const pathData = `M ${fx1} ${fy1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${fx2} ${fy2} L ${fx3} ${fy3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${fx4} ${fy4} Z`;

          const isSelected = selectedObjective === index;
          const gradientId = gradientIdFrom(objective.color.primary);

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={`url(#${gradientId})`}
                className={`cursor-pointer transition-all duration-500 origin-center ${
                  isSelected
                    ? "opacity-100 scale-105"
                    : "opacity-70 hover:opacity-90 scale-100"
                }`}
                onClick={() => setSelectedObjective(index)}
                filter={isSelected ? "url(#shadow)" : ""}
                style={{ borderRadius: "8px" }}
                rx="4"
                ry="4"
              />
            </g>
          );
        })}

        <circle cx="200" cy="200" r="110" fill="white" filter="url(#shadow)" />
      </svg>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center transition-all duration-700`}
        >
          <div
            className={`font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wider transition-all duration-700 bg-gradient-to-br ${objectives[selectedObjective].color.primary} bg-clip-text text-transparent`}
          >
            NSPC
          </div>
        </div>
      </div>

      {/* icons around wheel */}
      {objectives.map((objective, index) => {
        const segmentAngle = 360 / objectives.length;
        const angle = index * segmentAngle + segmentAngle / 2 - 90;
        const radian = (angle * Math.PI) / 180;
        const radius = 150;
        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        const isSelected = selectedObjective === index;

        return (
          <button
            key={index}
            onClick={() => setSelectedObjective(index)}
            className={`absolute z-20 transition-all duration-700 -translate-x-1/2 -translate-y-1/2 ${isSelected ? "scale-110 sm:scale-115 lg:scale-125" : "scale-100"}`}
            style={{
              top: `calc(50% + ${y * 0.7}px)`,
              left: `calc(50% + ${x * 0.7}px)`,
            }}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isSelected ? "bg-white shadow-2xl" : "bg-white/90 hover:bg-white"}`}
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 transition-all duration-500 ${isSelected ? objective.color.text : "text-gray-600"}`}
              >
                {objective.icon}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
