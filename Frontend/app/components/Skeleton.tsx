import React from "react";

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  style?: React.CSSProperties;
};

export default function Skeleton({
  className = "",
  width,
  height,
  circle = false,
  count = 1,
  style,
}: SkeletonProps) {
  const base = "bg-gray-100 dark:bg-gray-600 animate-pulse";

  const makeStyle = (i?: number): React.CSSProperties => {
    const s: React.CSSProperties = { ...(style || {}) };
    if (width) s.width = typeof width === "number" ? `${width}px` : width;
    if (height) s.height = typeof height === "number" ? `${height}px` : height;
    s.borderRadius = circle ? "50%" : 8;
    if (typeof i === "number" && i > 0) s.marginTop = 8;
    // Add animation delay for staggered effect
    s.animationDelay = `${(i || 0) * 75}ms`;
    s.animationDuration = "1.5s";
    return s;
  };

  if (!count || count <= 1) {
    return <div className={`${base} ${className}`} style={makeStyle()} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${base} ${className}`} style={makeStyle(i)} />
      ))}
    </>
  );
}
