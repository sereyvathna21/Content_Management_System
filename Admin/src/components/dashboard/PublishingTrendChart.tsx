"use client";
import React, { useMemo } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { PublishingTrendItem } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PublishingTrendChartProps {
  data: PublishingTrendItem[];
}

export default function PublishingTrendChart({ data }: PublishingTrendChartProps) {
  const t = useTranslations("DashboardOverview.PublishingTrendChart");
  const categories = useMemo(() => data.map((d) => {
    const [year, month] = d.month.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }), [data]);

  const series = useMemo(() => [
    { name: t("news"), data: data.map((d) => d.news) },
    { name: t("publications"), data: data.map((d) => d.publications) },
    { name: t("laws"), data: data.map((d) => d.laws) },
    { name: t("videos"), data: data.map((d) => d.videos) },
  ], [data, t]);

  const totalPublished = useMemo(() => data.reduce(
    (sum, d) => sum + d.news + d.publications + d.laws + d.videos,
    0
  ), [data]);

  const options: ApexOptions = useMemo(() => ({
    colors: ["#6366F1", "#A855F7", "#14B8A6", "#F43F5E"], // Indigo, Purple, Teal, Rose (Premium modern palette)
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 310,
      toolbar: { show: false },
      stacked: false,
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 1.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#9CA3AF", // Muted gray
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontWeight: 500,
        },
        formatter: (val: number) => Math.floor(val).toString(),
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "13px",
      fontWeight: 500,
      labels: { colors: "#6B7280" },
      markers: { size: 6, strokeWidth: 0 },
      itemMargin: { horizontal: 10, vertical: 0 },
    },
    grid: {
      borderColor: "#F3F4F6", // Very light grid
      strokeDashArray: 3,
      xaxis: { lines: { show: true } }, // Crosshair grid looks more technical/premium
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} ${t("items")}`,
      },
    },
  }), [categories, t]);

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("desc", { count: totalPublished })}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-4 -ml-2 flex flex-col justify-end">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
