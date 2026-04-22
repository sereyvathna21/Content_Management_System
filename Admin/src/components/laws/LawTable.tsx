"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ComponentCard from "@/components/common/ComponentCard";
import { pickTranslation } from "@/lib/pickTranslation";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";

export type LawTranslation = {
  id?: string;
  language: string;
  title: string;
  category?: string;
  description?: string;
  pdfUrl?: string;
};

export type Law = {
  id: string;
  category?: string;
  date?: string;
  translations: LawTranslation[];
};

type Props = {
  loading?: boolean;
  laws: Law[];
  query?: string;
  locale?: string;
  onOpen: (l: Law) => void;
  onEdit: (l: Law) => void;
  onDelete?: (id: string) => Promise<void> | void;
  deletingId?: string | null;
  onCreate?: () => void;
  createLabel?: string;
  showInlineCreate?: boolean;
};

function formatCategory(category: string | undefined, t: ReturnType<typeof useTranslations>) {
  if (!category) return null;

  const normalized = category
    .trim()
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
    .map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("");

  const key = `LawsPage.filters.categories.${normalized}`;
  return t.has(key) ? t(key) : category;
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

function resolvePdfUrl(pdfUrl?: string) {
  if (!pdfUrl) return null;
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  return `${backendUrl}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
}

export default React.memo(function LawTable({
  loading,
  laws,
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
  const t = useTranslations();
  const createText = createLabel ?? t("LawTable.create");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isDeleting = Boolean(deletingId && deleteId && deletingId === deleteId);

  return (
    <>
    <div>
      {!loading && onCreate && showInlineCreate && laws.length > 0 && (
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
        <div>{t("LawTable.loading")}</div>
      ) : laws.length === 0 ? (
        <ComponentCard title="" className="mt-2">
          <div className="py-12 text-center text-gray-500 space-y-3">
            {query ? (
              <>
                <p className="text-lg font-medium">{t("LawTable.noLawsForQuery", { query })}</p>
                <p className="mt-2 text-sm">{t("LawTable.tryDifferent")}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">{t("LawTable.noLawsTitle")}</p>
                <p className="mt-2 text-sm">{t("LawTable.tryAdjust")}</p>
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
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-0">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                      {t("LawTable.headers.title")}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                      {t("LawTable.headers.category")}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                      {t("LawTable.headers.date")}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                      {t("LawTable.headers.pdf")}
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                      {t("LawTable.headers.actions")}
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {laws.map((l) => {
                    const tr = pickTranslation(
                      l.translations.map((translation) => ({
                        id: translation.id,
                        language: translation.language,
                        title: translation.title,
                        category: translation.category,
                        description: translation.description,
                        pdfUrl: translation.pdfUrl,
                      })),
                      locale,
                      `Law #${l.id}`,
                    );
                    const pdfHref = resolvePdfUrl(tr.pdfUrl);
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="px-5 py-3 sm:px-6 text-start">
                          <button
                            className="text-sm font-medium text-gray-800 dark:text-white/90"
                            onClick={() => onOpen(l)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="font-medium">{tr.title}</div>
                            </div>
                          </button>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                          {formatCategory(tr.category ?? l.category, t) ?? <span className="text-gray-300 italic">-</span>}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                          {formatDate(l.date, locale) ?? <span className="text-gray-300 italic">-</span>}
                        </TableCell>

                        {/* ← this was the broken part, <a was missing */}
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                          {pdfHref ? (
                            <a
                              className="text-sm text-blue-500 hover:underline"
                              href={pdfHref}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("LawTable.viewPdf")}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">{t("LawTable.noPdf")}</span>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Tooltip label={t("LawTable.tooltips.edit")}>
                              <button
                                onClick={() => onEdit(l)}
                                title={t("LawTable.tooltips.edit")}
                                aria-label={t("LawTable.tooltips.edit")}
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                  <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </Tooltip>
                            {onDelete && (
                              <Tooltip label={t("LawTable.tooltips.delete")}>
                                <button
                                  onClick={() => {
                                    setDeleteId(l.id);
                                    setIsDeleteOpen(true);
                                  }}
                                  title={t("LawTable.tooltips.delete")}
                                  aria-label={t("LawTable.tooltips.delete")}
                                  disabled={Boolean(deletingId)}
                                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${deletingId ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}`}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M3 6h18" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 11v6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 11v6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 6V4h6v2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        </ComponentCard>
      )}
    </div>
    {onDelete && (
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} className="max-w-md p-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("LawTable.confirmDeleteTitle")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("LawTable.confirmDeleteText")}</p>
          <div className="flex justify-end gap-3">
            <button
              className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              {t("LawTable.cancel")}
            </button>
            <button
              className={`h-9 px-4 rounded-lg font-semibold text-white transition ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteId || !onDelete || isDeleting) return;
                await onDelete(deleteId);
                setIsDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              {isDeleting && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {t("LawTable.delete")}
            </button>
          </div>
        </div>
      </Modal>
    )}
    </>
  );
});