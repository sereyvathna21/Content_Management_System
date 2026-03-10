"use client";
import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export default function Tooltip({ label, children, className = "" }: Props) {
  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
