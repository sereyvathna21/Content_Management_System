import React from "react";
import Link from "next/link";

type Props = {
  currentLabel?: string;
};

export default function Breadcrumbs({ currentLabel = "Video" }: Props) {
  return (
    <nav className="mb-4 sm:mb-6 md:mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
        <li>
          <Link
            href="/Landing_page/Home"
            className="text-gray-500 hover:text-primary transition-colors"
          >
            Home
          </Link>
        </li>
        <li className="text-gray-400">/</li>
        <li>
          <Link
            href="/Landing_page/News"
            className="text-gray-500 hover:text-primary transition-colors"
          >
            News
          </Link>
        </li>
        <li className="text-gray-400">/</li>
        <li className="text-primary font-medium">{currentLabel}</li>
      </ol>
    </nav>
  );
}
