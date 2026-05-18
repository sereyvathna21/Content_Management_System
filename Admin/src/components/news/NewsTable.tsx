"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ComponentCard from "@/components/common/ComponentCard";
import { pickTranslation } from "@/lib/pickTranslation";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";
import { resolveBackendUrl } from "@/lib/backend";

export type NewsArticleTranslation = {
  id?: string;
  language: string;
  title: string;
  excerpt: string;
  subtitle?: string;
  contentHtml?: string;
  contentMd?: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  category: string;
  status: string;
  publishAt?: string;
  imageUrl?: string;
  imageAltKh?: string;
  imageAltEn?: string;
  featured: boolean;
  translations: NewsArticleTranslation[];
};

type Props = {
  loading?: boolean;
  news: NewsArticle[];
  query?: string;
  locale?: string;
  onOpen: (n: NewsArticle) => void;
  onEdit: (n: NewsArticle) => void;
  onDelete?: (id: string) => Promise<void> | void;
  deletingId?: string | null;
  onCreate?: () => void;
  createLabel?: string;
  showInlineCreate?: boolean;
};

function formatCategory(category: string | undefined) {
  if (!category) return null;
  return category;
}

function formatDate(value: string | undefined, locale?: string) {
  if (!value) return null;
  const dateLocale = locale === "km" ? "km-KH" : locale ?? "en-US";
  return new Date(value).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function resolveImageUrl(url?: string) {
  if (!url) return null;
  return resolveBackendUrl(url);
}

export default React.memo(function NewsTable({
  loading,
  news,
  query,
  locale,
  onOpen,
  onEdit,
  onDelete,
  deletingId,
  onCreate,
  createLabel,
  showInlineCreate = true,
}: Props) {
  const t = useTranslations("NewsTable");
  const createText = createLabel ?? "Create";
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isDeleting = Boolean(deletingId && deleteId && deletingId === deleteId);

  return (
    <>
    <div>
      {!loading && onCreate && showInlineCreate && news.length > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onCreate}
            className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm"
          >
            {createText}
          </button>
        </div>
      )}

      {loading ? (
        <div>{t("loading")}</div>
      ) : news.length === 0 ? (
        <ComponentCard title="" className="mt-2">
          <div className="py-12 text-center text-gray-500 space-y-3">
            {query ? (
              <>
                <p className="text-lg font-medium">{t("noNewsForQuery", { query })}</p>
                <p className="mt-2 text-sm">{t("tryDifferent")}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">{t("noNewsTitle")}</p>
                <p className="mt-2 text-sm">{t("tryAdjust")}</p>
              </>
            )}

            {onCreate && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onCreate}
                  className="h-9 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md text-sm"
                >
                  {createText}
                </button>
              </div>
            )}
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="" className="mt-2">
          <div className="space-y-4">
            <div className="hidden md:block max-w-full overflow-x-auto">
              <div className="min-w-0">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("headers.title")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("headers.category")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("headers.status")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("headers.date")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("headers.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {news.map((n) => {
                      const tr = pickTranslation(
                        n.translations.map((t) => ({ ...t, description: t.excerpt })),
                        locale || "en",
                        `News #${n.id}`,
                      );
                      const imageUrl = resolveImageUrl(n.imageUrl ? n.imageUrl.split(',')[0] : undefined);
                      
                      return (
                        <TableRow key={n.id}>
                          <TableCell className="px-5 py-3 sm:px-6 text-start">
                            <button
                              type="button"
                              className="text-sm font-medium text-gray-800 dark:text-white/90 text-left"
                              onClick={() => onOpen(n)}
                            >
                              <div className="flex items-center gap-3">
                                {imageUrl && (
                                  <img src={imageUrl} alt="" className="w-10 h-10 object-cover rounded-md shrink-0" />
                                )}
                                <div className="font-medium line-clamp-2">{tr.title}</div>
                              </div>
                            </button>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {formatCategory(n.category) ?? <span className="text-gray-300 italic">-</span>}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              n.status === "Published" ? "bg-green-100 text-green-700" :
                              n.status === "Draft" ? "bg-gray-100 text-gray-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {n.status}
                            </span>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {formatDate(n.publishAt, locale) ?? <span className="text-gray-300 italic">-</span>}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Tooltip label={t("tooltips.edit")}>
                                <button
                                  type="button"
                                  aria-label="Edit"
                                  onClick={() => onEdit(n)}
                                  title={t("tooltips.edit")}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 transition text-sky-500"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" />
                                    <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                  </svg>
                                </button>
                              </Tooltip>
                              {onDelete && (
                                <Tooltip label={t("tooltips.delete")}>
                                  <button
                                    type="button"
                                    aria-label="Delete"
                                    onClick={() => {
                                      setDeleteId(n.id);
                                      setIsDeleteOpen(true);
                                    }}
                                    title={t("tooltips.delete")}
                                    disabled={Boolean(deletingId)}
                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${deletingId ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 text-red-500"}`}
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18" />
                                      <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" />
                                      <path d="M10 11v6" />
                                      <path d="M14 11v6" />
                                      <path d="M9 6V4h6v2" />
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
            
            <div className="md:hidden space-y-3">
              {news.map((n) => {
                const tr = pickTranslation(
                  n.translations.map((t) => ({ ...t, description: t.excerpt })),
                  locale || "en",
                  `News #${n.id}`,
                );
                const imageUrl = resolveImageUrl(n.imageUrl ? n.imageUrl.split(",")[0] : undefined);
                const statusClass =
                  n.status === "Published"
                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                    : n.status === "Draft"
                      ? "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10"
                      : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20";

                return (
                  <div key={n.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" className="text-left w-full" onClick={() => onOpen(n)}>
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15l4-4 4 4 6-6 4 4" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 line-clamp-2">{tr.title}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              {formatCategory(n.category) ?? <span className="text-gray-300 italic">-</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {n.status}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Publish Date: {formatDate(n.publishAt, locale) ?? <span className="text-gray-300 italic">-</span>}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onEdit(n)}
                        className="px-3 py-1.5 text-xs font-medium text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50"
                      >
                        Edit
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(n.id);
                            setIsDeleteOpen(true);
                          }}
                          disabled={Boolean(deletingId)}
                          className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition ${
                            deletingId ? "opacity-50 cursor-not-allowed border-red-100 text-red-300" : "text-red-600 border-red-200 hover:bg-red-50"
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ComponentCard>
      )}
    </div>
    {onDelete && (
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} className="w-[92vw] max-w-md max-h-[80vh] overflow-y-auto p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t("confirmDeleteTitle")}</h3>
          <p className="text-gray-500 mb-6">{t("confirmDeleteText")}</p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteId || !onDelete || isDeleting) return;
                await onDelete(deleteId);
                setIsDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              {isDeleting ? t("deleting") : t("delete")}
            </button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
});
