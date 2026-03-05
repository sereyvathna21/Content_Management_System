import React from "react";
import CardSkeleton from "./CardSkeleton";

export default function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}
