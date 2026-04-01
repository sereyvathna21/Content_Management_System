"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import type { Contact } from "../../hooks/useContacts";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../ui/table";

import ComponentCard from "../common/ComponentCard";
import Tooltip from "../ui/Tooltip";
import { Modal } from "../ui/modal";

type Props = {
  loading: boolean;
  contacts: Contact[];
  onOpen: (c: Contact) => void;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
  query?: string;
  onClear?: () => void;
};

export default function ContactTable({
  loading,
  contacts,
  onOpen,
  onToggleRead,
  onDelete,
  query,
  onClear,
}: Props) {
  const t = useTranslations("ContactPage");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) return <div>{t("loading")}</div>;

  if (!loading && contacts.length === 0) {
    return (
      <ComponentCard title="" className="mt-2">
        <div className="py-12 text-center text-gray-500">
          {query ? (
            <>
              <p className="text-lg font-medium">{t("noResultsFor", { query })}</p>
              <p className="mt-2 text-sm">{t("tryDifferentSearch")}</p>
              <div className="mt-4 flex justify-center">
                <button
                  className="h-9 px-4 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  onClick={() => onClear && onClear()}
                >
                  {t("clearFilters")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">{t("noContactsFound")}</p>
              <p className="mt-2 text-sm">{t("tryAdjustFilters")}</p>
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
        <div className="min-w-0">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                  {t("columns.name")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400 ">
                  {t("columns.email")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                  {t("columns.subject")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400 ">
                  {t("columns.date")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400 ">
                  {t("columns.status")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-lg dark:text-gray-400">
                  {t("columns.actions")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="px-5 py-3 sm:px-6 text-start">
                      <button className="text-sm font-medium text-gray-800 dark:text-white/90" onClick={() => onOpen(c)}>
                      {c.name}
                    </button>
                  </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400 ">
                      {c.email}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400 ">
                      {c.subject}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400  ">
                      <div className="inline-flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-theme-xs ${
                            c.read
                              ? "bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary/80"
                              : "bg-red-50 text-red-500 dark:bg-blue-light-500/10"
                          }`}
                        >
                          {c.read ? t("status.read") : t("status.unread")}
                        </span>
                        {c.replied && (
                          <span className="inline-block px-2 py-0.5 rounded text-theme-xs bg-blue-light-50 text-blue-light-500">
                            {t("status.replied")}
                          </span>
                        )}
                      </div>
                    </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Tooltip label={t("viewMessage")}>
                        <button
                          onClick={() => onOpen(c)}
                          title={t("viewMessage")}
                          aria-label={t("viewMessage")}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/3 transition text-primary"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Tooltip>

                      <Tooltip label={c.read ? t("markAsUnread") : t("markAsRead")}>
                        <button
                          onClick={() => onToggleRead(c.id)}
                          title={c.read ? t("markAsUnread") : t("markAsRead")}
                          aria-label={c.read ? t("markAsUnread") : t("markAsRead")}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/3 transition"
                        >
                          {c.read ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M12 5v14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5 12h14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip label={t("deleteMessage")}>
                        <button
                          onClick={() => {
                            setDeleteId(c.id);
                            setIsModalOpen(true);
                          }}
                          title={t("deleteMessage")}
                          aria-label={t("deleteMessage")}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-red-50 transition"
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ComponentCard>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("confirmDeleteTitle")}</h3>
          <p className="text-sm text-gray-600 mb-4">{t("confirmDeleteText")}</p>
          <div className="flex justify-end gap-3">
            <button className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200" onClick={() => setIsModalOpen(false)}>{t("cancel")}</button>
            <button
              className="h-9 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setIsModalOpen(false);
                setDeleteId(null);
              }}
            >
              {t("delete")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
