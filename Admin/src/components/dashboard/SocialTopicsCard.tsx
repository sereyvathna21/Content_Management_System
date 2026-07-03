"use client";
import React from "react";
import { useTranslations } from "next-intl";
import type { SocialTopicStats } from "./types";

interface SocialTopicsCardProps {
  socialTopics: SocialTopicStats;
}

export default function SocialTopicsCard({ socialTopics }: SocialTopicsCardProps) {
  const t = useTranslations("DashboardOverview.SocialTopicsCard");
  const publishedPct = socialTopics.total > 0
    ? Math.round((socialTopics.published / socialTopics.total) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("desc")}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Main stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl mb-6">
          <div className="text-center p-2 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{socialTopics.total}</p>
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">{t("total")}</p>
          </div>
          <div className="text-center p-2 sm:p-4 bg-emerald-50/30 dark:bg-emerald-500/5">
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{socialTopics.published}</p>
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 mt-1">{t("published")}</p>
          </div>
          <div className="text-center p-2 sm:p-4">
            <p className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300">{socialTopics.draft}</p>
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">{t("draft")}</p>
          </div>
        </div>

        {/* Sections count */}
        <div className="flex items-center justify-between rounded-xl border border-blue-100/50 bg-blue-50/30 dark:border-blue-500/10 dark:bg-blue-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{t("totalSections")}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("acrossAllTopics")}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{socialTopics.totalSections}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          <span>{t("publishedRate")}</span>
          <span className="text-gray-900 dark:text-white">{publishedPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${publishedPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
