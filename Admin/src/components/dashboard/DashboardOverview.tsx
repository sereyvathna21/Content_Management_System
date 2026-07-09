"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getBackendUrl } from "@/lib/backend";
import type { DashboardData } from "./types";
import ContentStatsCards from "./ContentStatsCards";
import PublishingTrendChart from "./PublishingTrendChart";
import ContactMessagesCard from "./ContactMessagesCard";
import TelegramSyncCard from "./TelegramSyncCard";
import SocialTopicsCard from "./SocialTopicsCard";
import RecentActivityTable from "./RecentActivityTable";
import SystemOverviewCard from "./SystemOverviewCard";
import RecentDraftsCard from "./RecentDraftsCard";

export default function DashboardOverview() {
  const t = useTranslations("DashboardOverview");
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (signal?: AbortSignal) => {
      if (status === "loading" || !session?.accessToken) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${getBackendUrl()}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
          cache: "no-store",
          signal,
        });

        if (!res.ok) {
          setError(`Failed to load dashboard (HTTP ${res.status})`);
          return;
        }

        const data = (await res.json()) as DashboardData;
        if (!signal?.aborted) {
          setDashboardData(data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Dashboard fetch error:", err);
        setError(t("failedToLoad"));
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [session?.accessToken, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, [fetchDashboard]);

  // Loading skeleton
  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Stats cards skeleton */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
        {/* Chart skeleton */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
            <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-[310px] rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
            <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-[200px] rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">{error}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("refreshPrompt")}</p>
          <button
            onClick={() => fetchDashboard()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Row 1: Content Stats Cards */}
      <div className="col-span-12">
        <ContentStatsCards
          news={dashboardData.news}
          publications={dashboardData.publications}
          laws={dashboardData.laws}
          videos={dashboardData.videos}
        />
      </div>

      {/* Row 2: Recent Drafts + Publishing Trend */}
      <div className="col-span-12 xl:col-span-5">
        <RecentDraftsCard drafts={dashboardData.recentDrafts} />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <PublishingTrendChart data={dashboardData.publishingTrend} />
      </div>

      {/* Row 3: Contact Messages + Telegram Sync */}
      <div className="col-span-12 xl:col-span-5">
        <ContactMessagesCard contacts={dashboardData.contacts} />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <TelegramSyncCard telegramSync={dashboardData.telegramSync} />
      </div>

      {/* Row 4: Social Topics + System Overview */}
      <div className="col-span-12 xl:col-span-7">
        <SocialTopicsCard socialTopics={dashboardData.socialTopics} />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <SystemOverviewCard users={dashboardData.users} media={dashboardData.media} />
      </div>

      {/* Row 5: Recent Activity */}
      <div className="col-span-12">
        <RecentActivityTable recentActivity={dashboardData.recentActivity} />
      </div>
    </div>
  );
}
