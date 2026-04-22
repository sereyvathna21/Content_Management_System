"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ComponentCard from "@/components/common/ComponentCard";
import { pickTranslation } from "@/lib/pickTranslation";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";

export type PublicationTranslation = {
  id?: string;
  language: string;
  title: string;
  content?: string;
  attachmentUrl?: string;
  category?: string;
};

export type Publication = {
  id: string;
  category?: string;
  publicationDate?: string;
  translations: PublicationTranslation[];
};

type Props = {
  loading?: boolean;
  publications: Publication[];
  query?: string;
  locale?: string;
  onOpen: (publication: Publication) => void;
  onEdit: (publication: Publication) => void;
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

  const key = `PublicationsPage.filters.categories.${normalized}`;
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

function resolveAttachmentUrl(attachmentUrl?: string) {
  if (!attachmentUrl) return null;
  if (/^https?:\/\//i.test(attachmentUrl)) return attachmentUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  return `${backendUrl}${attachmentUrl.startsWith("/") ? "" : "/"}${attachmentUrl}`;
}

export default React.memo(function PublicationTable({
  loading,
  publications,
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
  const createText = createLabel ?? t("PublicationTable.create");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isDeleting = Boolean(deletingId && deleteId && deletingId === deleteId);

  return (
    <>
      <div>
        {!loading && onCreate && showInlineCreate && publications.length > 0 && (
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
          <div>{t("PublicationTable.loading")}</div>
        ) : publications.length === 0 ? (
          <ComponentCard title="" className="mt-2">
            <div className="py-12 text-center text-gray-500 space-y-3">
              {query ? (
                <>
                  <p className="text-lg font-medium">{t("PublicationTable.noItemsForQuery", { query })}</p>
                  <p className="mt-2 text-sm">{t("PublicationTable.tryDifferent")}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">{t("PublicationTable.noItemsTitle")}</p>
                  <p className="mt-2 text-sm">{t("PublicationTable.tryAdjust")}</p>
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
                        {t("PublicationTable.headers.title")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("PublicationTable.headers.category")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("PublicationTable.headers.date")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("PublicationTable.headers.attachment")}
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                        {t("PublicationTable.headers.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {publications.map((publication) => {
                      const translation = pickTranslation(
                        publication.translations.map((tr) => ({
                          id: tr.id,
                          language: tr.language,
                          title: tr.title,
                          pdfUrl: tr.attachmentUrl,
                          category: tr.category,
                        })),
                        locale,
                        `Publication #${publication.id}`,
                      );

                      const attachmentHref = resolveAttachmentUrl(translation.pdfUrl);

                      return (
                        <TableRow key={publication.id}>
                          <TableCell className="px-5 py-3 sm:px-6 text-start">
                            <button
                              className="text-sm font-medium text-gray-800 dark:text-white/90"
                              onClick={() => onOpen(publication)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="font-medium">{translation.title}</div>
                              </div>
                            </button>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {formatCategory(translation.category ?? publication.category, t) ?? <span className="text-gray-300 italic">-</span>}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {formatDate(publication.publicationDate, locale) ?? <span className="text-gray-300 italic">-</span>}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                            {attachmentHref ? (
                              <a className="text-sm text-blue-500 hover:underline" href={attachmentHref} target="_blank" rel="noreferrer">
                                {t("PublicationTable.viewAttachment")}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">{t("PublicationTable.noAttachment")}</span>
                            )}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Tooltip label={t("PublicationTable.tooltips.edit")}>
                                <button
                                  onClick={() => onEdit(publication)}
                                  title={t("PublicationTable.tooltips.edit")}
                                  aria-label={t("PublicationTable.tooltips.edit")}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </button>
                              </Tooltip>

                              {onDelete && (
                                <Tooltip label={t("PublicationTable.tooltips.delete")}>
                                  <button
                                    onClick={() => {
                                      setDeleteId(publication.id);
                                      setIsDeleteOpen(true);
                                    }}
                                    title={t("PublicationTable.tooltips.delete")}
                                    aria-label={t("PublicationTable.tooltips.delete")}
                                    disabled={Boolean(deletingId)}
                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition ${
                                      deletingId ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"
                                    }`}
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
            <h3 className="text-lg font-semibold mb-2">{t("PublicationTable.confirmDeleteTitle")}</h3>
            <p className="text-sm text-gray-600 mb-4">{t("PublicationTable.confirmDeleteText")}</p>
            <div className="flex justify-end gap-3">
              <button
                className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                {t("PublicationTable.cancel")}
              </button>
              <button
                className={`h-9 px-4 rounded-lg font-semibold text-white transition ${
                  isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
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
                {t("PublicationTable.delete")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
});
