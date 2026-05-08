"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ComponentCard from "@/components/common/ComponentCard";
import Tooltip from "@/components/ui/Tooltip";

import { SocialTopic } from "../../types/social.types";

type Props = {
  loading?: boolean;
  topics: SocialTopic[];
  query?: string;
  locale?: string;
  onEdit: (t: SocialTopic) => void;
  onDelete: (t: SocialTopic) => void;
};

export default React.memo(function SocialTopicTable({
  loading,
  topics,
  query,
  locale,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations();

  return (
    <div>

      {topics.length === 0 ? (
        <ComponentCard title="" className="mt-2">
          <div className="py-12 text-center text-gray-500 space-y-3">
            {query ? (
              <>
                <p className="text-lg font-medium">{t("SocialTable.noTopicsForQuery")?.replace('{query}', query) || `No topics found for "${query}"`}</p>
                <p className="mt-2 text-sm">{t("SocialTable.tryDifferent") || "Try a different search term."}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">{t("SocialTable.noTopicsTitle") || "No topics found"}</p>
                <p className="mt-2 text-sm">{t("SocialTable.tryAdjust") || "Try creating a new topic."}</p>
              </>
            )}
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="" className="mt-2">
          <div className="space-y-4">
            <div className="md:hidden space-y-3">
              {topics.map((tItem) => {
                const titleText = locale === "en" ? (tItem.titleEn || tItem.titleKm) : tItem.titleKm;
                const dateLocale = (locale === "km" || locale === "kh") ? "km-KH" : locale ?? "en-US";
                const publishedDateStr = tItem.publishedAt 
                    ? new Date(tItem.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })
                    : "-";
                const statusLabel = tItem.status === 1
                  ? (t("SocialTable.status.published") || "Published")
                  : (t("SocialTable.status.draft") || "Draft");

                return (
                  <div key={tItem.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          className="text-sm font-semibold text-gray-800 hover:text-primary transition truncate"
                          onClick={() => onEdit(tItem)}
                        >
                          {titleText}
                        </button>
                        <p className="text-xs text-gray-500 font-mono mt-1 truncate">{tItem.slug}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tItem.status === 1
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {t("SocialTable.headers.publishedAt") || "Published Date"}: {publishedDateStr}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => onEdit(tItem)}
                        className="px-3 py-1.5 text-xs font-medium text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50"
                      >
                        {t("SocialTable.tooltips.edit") || "Edit"}
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(tItem)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          {t("SocialTable.tooltips.delete") || "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-0">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/5">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                          {t("SocialTable.headers.title")}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                          {t("SocialTable.headers.slug")}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                          {t("SocialTable.headers.status")}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                          {t("SocialTable.headers.publishedAt")}
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                          {t("SocialTable.headers.actions")}
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {topics.map((tItem) => {
                        const titleText = locale === "en" ? (tItem.titleEn || tItem.titleKm) : tItem.titleKm;
                        const dateLocale = (locale === "km" || locale === "kh") ? "km-KH" : locale ?? "en-US";
                        const publishedDateStr = tItem.publishedAt 
                            ? new Date(tItem.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })
                            : "-";

                        return (
                          <TableRow key={tItem.id}>
                            <TableCell className="px-5 py-3 sm:px-6 text-start">
                              <button
                                className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-primary transition"
                                onClick={() => onEdit(tItem)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="font-medium">{titleText}</div>
                                </div>
                              </button>
                            </TableCell>

                            <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                              {tItem.slug}
                            </TableCell>

                            <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                              {tItem.status === 1 ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">{t("SocialTable.status.published") || "Published"}</span>
                              ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">{t("SocialTable.status.draft") || "Draft"}</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                              {publishedDateStr}
                            </TableCell>

                            <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Tooltip label={t("SocialTable.tooltips.edit")}>
                                  <button
                                    onClick={() => onEdit(tItem)}
                                    title={t("SocialTable.tooltips.edit")}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                  
                                </Tooltip>
                               { onDelete && (
                                  <Tooltip label={t("SocialTable.tooltips.delete")}>
                                    <button
                                      onClick={() => onDelete(tItem)}
                                      title={t("SocialTable.tooltips.delete")}
                                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition text-red-500 dark:text-red-400"
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 7h16M10 11v6M14 11v6M5 7l1.5 12a2 2 0 002 2h5a2 2 0 002-2L19 7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </button>
                                  </Tooltip>
                                )}
                                  
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
  );
});
