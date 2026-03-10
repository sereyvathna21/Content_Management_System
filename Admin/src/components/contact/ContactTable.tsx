"use client";
import React, { useState } from "react";
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
  if (loading) return <div>Loading...</div>;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!loading && contacts.length === 0) {
    return (
      <ComponentCard title="" className="mt-2">
        <div className="py-12 text-center text-gray-500">
          {query ? (
            <>
              <p className="text-lg font-medium">No results for "{query}"</p>
              <p className="mt-2 text-sm">Try a different search term or clear filters.</p>
              <div className="mt-4 flex justify-center">
                <button
                  className="h-9 px-4 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                  onClick={() => onClear && onClear()}
                >
                  Clear filters
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="mt-2 text-sm">Try adjusting filters or search terms to find messages.</p>
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
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400 ">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  Subject
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400 ">
                  Date
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400 ">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">
                  Actions
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
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-theme-xs ${
                          c.read
                            ? "bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary/80"
                            : "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/10"
                        }`}
                      >
                        {c.read ? "Read" : "Unread"}
                      </span>
                    </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Tooltip label="View message">
                        <button
                          onClick={() => onOpen(c)}
                          title="View message"
                          aria-label="View message"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/3 transition"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Tooltip>

                      <Tooltip label={c.read ? "Mark as unread" : "Mark as read"}>
                        <button
                          onClick={() => onToggleRead(c.id)}
                          title={c.read ? "Mark as unread" : "Mark as read"}
                          aria-label={c.read ? "Mark as unread" : "Mark as read"}
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

                      <Tooltip label="Delete message">
                        <button
                          onClick={() => {
                            setDeleteId(c.id);
                            setIsModalOpen(true);
                          }}
                          title="Delete message"
                          aria-label="Delete message"
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
          <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
          <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button className="h-9 px-4 rounded-lg font-medium bg-white border border-gray-200" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button
              className="h-9 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setIsModalOpen(false);
                setDeleteId(null);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
