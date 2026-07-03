"use client";
import React, { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { TelegramSyncStats } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface TelegramSyncCardProps {
  telegramSync: TelegramSyncStats;
}

export default function TelegramSyncCard({ telegramSync }: TelegramSyncCardProps) {
  const t = useTranslations("DashboardOverview.TelegramSyncCard");
  const total =
    telegramSync.notSynced +
    telegramSync.pending +
    telegramSync.success +
    telegramSync.failed;

  const successPct = total > 0 ? Math.round((telegramSync.success / total) * 100) : 0;

  const series = useMemo(() => [
    telegramSync.success,
    telegramSync.pending,
    telegramSync.notSynced,
    telegramSync.failed,
  ], [telegramSync]);

  const options: ApexOptions = useMemo(() => ({
    colors: ["#3B82F6", "#F59E0B", "#E5E7EB", "#EF4444"], // Blue, Amber, Gray, Red
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 200,
    },
    labels: [t("synced"), t("pending"), t("notSynced"), t("failed")],
    plotOptions: {
      pie: {
        donut: {
          size: "82%",
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
              formatter: () => total.toString(),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    tooltip: { 
      theme: "light",
      fillSeriesColor: false, 
    },
  }), [total, t]);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("successRate", { rate: successPct })}
        </p>
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

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("syncedLabel")}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{telegramSync.success}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("pendingLabel")}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{telegramSync.pending}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("noneLabel")}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{telegramSync.notSynced}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("failedLabel")}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{telegramSync.failed}</span>
        </div>
      </div>
    </div>
  );
}
