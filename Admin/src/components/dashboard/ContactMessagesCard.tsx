"use client";
import React, { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { ContactStats } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ContactMessagesCardProps {
  contacts: ContactStats;
}

export default function ContactMessagesCard({ contacts }: ContactMessagesCardProps) {
  const t = useTranslations("DashboardOverview.ContactMessagesCard");
  const repliedPct = contacts.total > 0 ? Math.round((contacts.replied / contacts.total) * 100) : 0;

  const series = useMemo(() => [
    contacts.replied, 
    contacts.unread, 
    Math.max(0, contacts.total - contacts.replied - contacts.unread)
  ], [contacts]);

  const options: ApexOptions = useMemo(() => ({
    colors: ["#10B981", "#F59E0B", "#E5E7EB"], // Sleeker green, amber, and very subtle gray
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 200,
    },
    labels: [t("replied"), t("unread"), t("readNoReply")],
    plotOptions: {
      pie: {
        donut: {
          size: "82%", // Thinner, more elegant donut
          labels: {
            show: true,
            name: { show: true, fontSize: "12px", color: "#9CA3AF", fontWeight: 500 },
            value: { show: true, fontSize: "28px", fontWeight: 600, color: "#111827", offsetY: 4 },
            total: {
              show: true,
              label: t("total"),
              fontSize: "12px",
              color: "#9CA3AF",
              fontWeight: 500,
              formatter: () => contacts.total.toString(),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 }, // Removed white borders for a cleaner look
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
    },
  }), [contacts.total, t]);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("replyRate", { rate: repliedPct })}
          </p>
        </div>
        {contacts.unread > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-semibold text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning-500 animate-pulse" />
            {contacts.unread} {t("unreadCount")}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-center">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={200}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("replied")}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{contacts.replied}</p>
        </div>
        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("unread")}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{contacts.unread}</p>
        </div>
        <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-gray-800" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("read")}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.max(0, contacts.total - contacts.replied - contacts.unread)}
          </p>
        </div>
      </div>
    </div>
  );
}
