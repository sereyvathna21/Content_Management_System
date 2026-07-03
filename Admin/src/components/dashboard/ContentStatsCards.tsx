"use client";
import React from "react";
import { useTranslations } from "next-intl";
import type { ContentStats } from "./types";

interface ContentStatsCardsProps {
  news: ContentStats;
  publications: ContentStats;
  laws: ContentStats;
  videos: ContentStats;
}

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  stats: ContentStats;
  accentColor: string;
}

function StatCard({ title, icon, stats, accentColor }: StatCardProps) {
  const t = useTranslations("DashboardOverview.ContentStatsCards");
  const publishedPct = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-gray-700 md:p-6">
      <div className="absolute top-0 left-0 w-full h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundColor: accentColor }} />
      
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {stats.total.toLocaleString()}
          </h4>
        </div>
        <div className="flex items-center justify-center rounded-xl p-2.5 transition-colors duration-300" style={{ color: accentColor, backgroundColor: `${accentColor}1A` }}>
          {icon}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-gray-900 dark:text-gray-200">{publishedPct}%</span>
          <span className="text-gray-500 dark:text-gray-400">{t("published")}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            {stats.published}
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            {stats.draft}
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
            {stats.archived}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800/50 overflow-hidden flex">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%`, backgroundColor: accentColor }}
        />
        <div
          className="h-full bg-gray-300 dark:bg-gray-600 transition-all duration-700 ease-out"
          style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}
        />
        <div
          className="h-full bg-gray-200 dark:bg-gray-700 transition-all duration-700 ease-out"
          style={{ width: `${stats.total > 0 ? (stats.archived / stats.total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

export default function ContentStatsCards({ news, publications, laws, videos }: ContentStatsCardsProps) {
  const t = useTranslations("DashboardOverview.ContentStatsCards");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-5">
      <StatCard
        title={t("news")}
        accentColor="#3B82F6"
        stats={news}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
          </svg>
        }
      />
      <StatCard
        title={t("publications")}
        accentColor="#8B5CF6"
        stats={publications}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        }
      />
      <StatCard
        title={t("laws")}
        accentColor="#10B981"
        stats={laws}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
          </svg>
        }
      />
      <StatCard
        title={t("videos")}
        accentColor="#F43F5E"
        stats={videos}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        }
      />
    </div>
  );
}
