import React from "react";
import Skeleton from "./Skeleton";

export default function CardSkeleton() {
  return (
    <article className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100 h-full flex flex-col">
      <div className="relative w-full aspect-video overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col">
        <Skeleton height={18} className="w-3/4" />
        <Skeleton height={12} className="w-full" />
        <div className="flex-1" />
      </div>
    </article>
  );
}
