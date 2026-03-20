"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import type { Law } from "@/hooks/useLaws";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import ComponentCard from "@/components/common/ComponentCard";
import Tooltip from "@/components/ui/Tooltip";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

type Props = {
  loading: boolean;
  laws: Law[];
  query?: string;
  onEdit: (law: Law) => void;
  onDelete: (id: string) => void;
  onClear?: () => void;
};

export default function LawTable({ loading, laws, query, onEdit, onDelete, onClear }: Props) {
  const t = useTranslations("LawsPage");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return <div className="py-4 text-gray-500">{t("table.loading")}</div>;
  }

  if (!loading && laws.length === 0) {
    return (
      <ComponentCard title="" className="mt-2">
        <div className="py-12 text-center text-gray-500">
          {query ? (
            <>
              <p className="text-lg font-medium">{t("table.noResultsFor", { query })}</p>
              <p className="mt-2 text-sm">{t("table.tryDifferentSearch")}</p>
              <div className="mt-4 flex justify-center">
                <button
                  className="h-9 px-4 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  onClick={() => onClear?.()}
                >
                  {t("table.clearFilters")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">{t("table.noLawsFound")}</p>
              <p className="mt-2 text-sm">{t("table.tryAdjust")}</p>
            </>
          )}
        </div>
      </ComponentCard>
    );
  }

  return (
    <>
      <ComponentCard title="" className="mt-2">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.title")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.category")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.date")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.pdfEn")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.pdfKh")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  {t("table.columns.actions")}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {laws.map((law) => (
                <TableRow key={law.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <TableCell className="px-5 py-3 text-sm text-gray-800 dark:text-white/90 max-w-xs">
                    <div className="font-medium truncate" title={law.title}>
                      {law.title}
                    </div>
                    {law.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5" title={law.description}>
                        {law.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {law.category}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {law.date ? new Date(law.date).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    {law.pdfUrl ? (
                      <a
                        href={law.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs truncate block max-w-[120px]"
                        title={law.pdfUrl}
                      >
                        {t("table.viewPdf")}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    {law.pdfUrlKh ? (
                      <a
                        href={law.pdfUrlKh}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs truncate block max-w-[120px]"
                        title={law.pdfUrlKh}
                      >
                        {t("table.viewPdf")}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Tooltip label={t("table.tooltips.edit")}>
                        <button
                          onClick={() => onEdit(law)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label={t("table.tooltips.edit")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip label={t("table.tooltips.delete")}>
                        <button
                          onClick={() => setDeleteId(law.id)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={t("table.tooltips.delete")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ComponentCard>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        className="max-w-md p-6"
        backdropClassName="fixed inset-0 h-full w-full bg-gray-400/30 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold text-primary mb-2">{t("table.confirmDeleteTitle")}</h3>
        <p className="text-sm text-gray-500 mb-4">{t("table.confirmDeleteText")}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
            {t("table.cancel")}
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              if (deleteId) {
                onDelete(deleteId);
                setDeleteId(null);
              }
            }}
          >
            {t("table.delete")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
