"use client";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { DraftItem } from "./types";
import Badge from "../ui/badge/Badge";

interface RecentDraftsCardProps {
  drafts: DraftItem[];
}

function formatTimeAgo(dateStr: string, t: any): string {
  const hasTimezone = /Z|[+-]\d{2}(:\d{2})?$/.test(dateStr);
  const normalizedDateStr = (dateStr.includes('T') && !hasTimezone) 
    ? `${dateStr}Z` 
    : dateStr;
    
  const date = new Date(normalizedDateStr);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime()); // Prevent negative diffs
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t("justNow");
  if (diffMins < 60) return t("minsAgo", { mins: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t("hoursAgo", { hours: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return t("daysAgo", { days: diffDays });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getEntityIcon(entityType: string): React.ReactNode {
  const lower = entityType.toLowerCase();
  if (lower.includes("news")) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
      </svg>
    );
  }
  if (lower.includes("publication")) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    );
  }
  if (lower.includes("law")) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    );
  }
  if (lower.includes("video")) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function getEntityAccentColor(entityType: string): string {
  const lower = entityType.toLowerCase();
  if (lower.includes("news")) return "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
  if (lower.includes("publication")) return "text-purple-500 bg-purple-50 dark:bg-purple-500/10";
  if (lower.includes("law")) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
  if (lower.includes("video")) return "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
  return "text-gray-500 bg-gray-50 dark:bg-gray-500/10";
}

export default function RecentDraftsCard({ drafts }: RecentDraftsCardProps) {
  // We use RecentActivityTable translations for the time string formatting
  const t = useTranslations("DashboardOverview.RecentActivityTable");

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning-50 text-warning-500 dark:bg-warning-500/10">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
            Needs Attention
          </h3>
        </div>
        <Badge color="warning" size="sm">
          {drafts.length} Drafts
        </Badge>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {drafts.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 min-h-[150px]">
            No recent drafts
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={`${draft.type}-${draft.id}`}
              className="group flex items-center justify-between rounded-xl border border-gray-100 p-3.5 transition-all hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-transparent"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-lg ${getEntityAccentColor(draft.type)}`}>
                  {getEntityIcon(draft.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate pr-4">
                    {draft.title || "Untitled Document"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-medium text-gray-500 dark:text-gray-400">
                      {draft.type}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="text-gray-400 dark:text-gray-500">
                      {formatTimeAgo(draft.createdAt, t)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/${draft.type.toLowerCase()}s/${draft.id}`}
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:hover:bg-brand-500/20 dark:hover:text-brand-400"
                title="Continue Editing"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
