"use client";
import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export default function Tooltip({ label, children, className = "" }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="pointer-events-none fixed opacity-100 scale-100 transition-all duration-150 z-[9999]"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="relative rounded-md bg-gray-900/95 text-white text-xs px-2.5 py-1.5 shadow-lg ring-1 ring-black/10 whitespace-nowrap">
              {label}
              <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 h-2 w-2 rotate-45 bg-gray-900/95 ring-1 ring-black/10" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
