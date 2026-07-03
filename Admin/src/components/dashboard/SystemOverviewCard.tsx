"use client";
import React from "react";
import { useTranslations } from "next-intl";
import type { UserStats, MediaStats } from "./types";

interface SystemOverviewCardProps {
  users: UserStats;
  media: MediaStats;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val < 10 ? 1 : 0)} ${sizes[i]}`;
}

export default function SystemOverviewCard({ users, media }: SystemOverviewCardProps) {
  const t = useTranslations("DashboardOverview.SystemOverviewCard");
  const storageUsedStr = formatBytes(media.totalSizeBytes);
  const maxStorage = 10 * 1024 * 1024 * 1024; // Default 10GB capacity
  const storagePct = Math.min(100, (media.totalSizeBytes / maxStorage) * 100);

  const items = [
    {
      label: t("totalUsers"),
      value: users.total.toString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      colorClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("activeRoles"),
      value: users.activeRoles.toString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      bgClass: "bg-purple-50 dark:bg-purple-900/20",
      colorClass: "text-purple-600 dark:text-purple-400",
    },
    {
      label: t("mediaFiles"),
      value: media.totalFiles.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      ),
      bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
      colorClass: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("desc")}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="group flex items-center justify-between rounded-xl border border-gray-100 p-3.5 transition-all hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
            >
              <div className="flex items-center gap-3.5">
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${item.bgClass} ${item.colorClass}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="text-gray-700 dark:text-gray-300 font-bold">{item.value}</span>
                  </p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

        {/* Storage Bar - Anchored to bottom */}
        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-gray-100 p-5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              <span>{t("storageUsed")}</span>
              <span className="text-gray-900 dark:text-white font-bold text-sm">{storageUsedStr}</span>
            </div>
            
            <div className="relative h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner">
              {/* Split track to make it look like segmented blocks */}
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${storagePct}%` }}
              />
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_98%,rgba(255,255,255,0.8)_98%)] bg-[length:10px_100%]" />
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              <span>0%</span>
              <span>{t("capacity", { capacity: 10 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
