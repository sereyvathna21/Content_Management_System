"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Tooltip from "@/components/ui/Tooltip";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  passwordSet?: boolean;
  blocked?: boolean;
  avatar?: string;
};

type Props = {
  loading?: boolean;
  users: User[];
  query?: string;
  onOpen: (u: User) => void;
  onEdit: (u: User) => void;
  onBlockRequest: (id: string) => void;
  onClear?: () => void;
};

export default function UserTable({ loading, users, query, onOpen, onEdit, onBlockRequest, onClear }: Props) {
  const t = useTranslations();
  // delegate confirmation to parent; remove local confirm modal

  if (loading) return <div>{t("UserTable.loading")}</div>;

  if (!loading && users.length === 0) {
    return (
          <div className="py-12 text-center text-gray-500">
        {query ? (
          <>
            <p className="text-lg font-medium">{t("UserTable.noUsersForQuery", { query })}</p>
            <p className="mt-2 text-sm">{t("UserTable.tryDifferent")}</p>
            <div className="mt-4 flex justify-center">
              <button
                className="h-9 px-4 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90"
                onClick={() => onClear && onClear()}
              >
                {t("UserTable.clear")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">{t("UserTable.noUsersTitle")}</p>
            <p className="mt-2 text-sm">{t("UserTable.tryAdjust")}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-0">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">{t("UserTable.headers.user")}</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">{t("UserTable.headers.email")}</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">{t("UserTable.headers.password")}</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">{t("UserTable.headers.role")}</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-primary text-start text-md dark:text-gray-400">{t("UserTable.headers.actions")}</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="px-5 py-3 sm:px-6 text-start">
                    <button className="text-sm font-medium text-gray-800 dark:text-white/90" onClick={() => onOpen(u)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          {(() => {
                            const raw = (u.avatar ?? "").toString().trim();
                            const src = raw && raw !== "null" && raw !== "undefined" ? raw : "";
                            if (!src) {
                              return <img src="/images/user/default-avatar.svg" alt={u.name} className="w-full h-full object-cover" />;
                            }
                            if (src.startsWith("data:") || src.startsWith("blob:")) {
                              // data URLs: use native img
                              return <img src={src} alt={u.name} className="w-full h-full object-cover" />;
                            }

                            // Use native img with onError fallback to default for broken/404 URLs
                            return (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={src}
                                alt={u.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/user/default-avatar.svg";
                                }}
                              />
                            );
                          })()}
                        </div>
                        <div>{u.name}</div>
                      </div>
                    </button>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{u.email}</TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <span
                      aria-label={u.passwordSet ? t("UserTable.passwordSet") : t("UserTable.passwordNotSet")}
                      title={u.passwordSet ? t("UserTable.passwordSet") : t("UserTable.passwordNotSet")}
                      className={`inline-block px-2 py-0.5 rounded text-theme-xs ${u.passwordSet ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {u.passwordSet ? t("UserTable.passwordSet") : t("UserTable.passwordNotSet")}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{u.role}</TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Tooltip label={t("UserTable.tooltips.edit")}>
                        <button
                          onClick={() => onEdit(u)}
                          title={t("UserTable.tooltips.edit")}
                          aria-label={t("UserTable.tooltips.edit")}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/10 transition text-sky-500 dark:text-sky-400"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M3 21v-3.75L14.06 6.19l3.75 3.75L6.75 21H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </Tooltip>

                        <Tooltip label={u.blocked ? t("UserTable.tooltips.unblock") : t("UserTable.tooltips.block")}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onBlockRequest(u.id); }}
                          title={u.blocked ? t("UserTable.tooltips.unblock") : t("UserTable.tooltips.block")}
                          aria-label={u.blocked ? t("UserTable.tooltips.unblock") : t("UserTable.tooltips.block")}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/3 transition ${u.blocked ? "text-green-600" : "text-red-600"}`}
                        >
                          {u.blocked ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M16 11V8a4 4 0 10-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
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
    </>
  );
}
