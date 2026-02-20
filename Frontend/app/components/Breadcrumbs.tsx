"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  currentLabel?: string;
};

export default function Breadcrumbs({ currentLabel }: Props) {
  const t = useTranslations("NewsPage");
  const label = currentLabel || t("videoLabel");

  return (
    <nav className="mb-4 sm:mb-6 md:mb-8 mt-16 sm:mt-0" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
        <li>
          <Link
            href="/Landing-page/Home"
            className="text-gray-500 hover:text-primary transition-colors"
          >
            {t("breadcrumbs.home")}
          </Link>
        </li>
        <li className="text-gray-400">/</li>
        <li>
          <Link
            href="/Landing-page/News"
            className="text-gray-500 hover:text-primary transition-colors"
          >
            {t("breadcrumbs.news")}
          </Link>
        </li>
        <li className="text-gray-400">/</li>
        <li className="text-primary font-medium">{label}</li>
      </ol>
    </nav>
  );
}
