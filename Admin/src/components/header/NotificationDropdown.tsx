"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Dropdown } from "../ui/dropdown/Dropdown";

type NotificationKind = "created" | "deleted" | "general";

type NotificationItem = {
  id: string;
  message: string;
  kind: NotificationKind;
  titleKm?: string;
  titleEn?: string;
  createdAt: Date;
};

type NotificationApiItem = {
  id: number;
  message: string;
  kind: string;
  titleKm?: string;
  titleEn?: string;
  createdAt: string;
};

function pickLocalizedTitle(titleKm: string | undefined, titleEn: string | undefined, locale: string): string {
  const prefersKhmer = locale === "kh" || locale === "km";
  const km = titleKm?.trim();
  const en = titleEn?.trim();

  if (prefersKhmer) {
    return km || en || "";
  }

  return en || km || "";
}

function extractTitleFromLegacyMessage(message: string): string {
  const match = message.match(/^Law\s+"(.+?)"\s+was\s+(?:created|deleted)\.?$/i);
  if (!match || !match[1]) {
    return "";
  }

  return match[1].trim();
}

function detectNotificationKind(message: string): NotificationKind {
  const normalized = message.toLowerCase();
  if (normalized.includes("delete") || normalized.includes("លុប")) return "deleted";
  if (normalized.includes("create") || normalized.includes("បង្កើត")) return "created";
  return "general";
}

function normalizeNotificationKind(kind: string | undefined, message: string): NotificationKind {
  if (kind === "created" || kind === "deleted" || kind === "general") {
    return kind;
  }

  return detectNotificationKind(message);
}

function formatTime(date: Date, locale: string): string {
  const timeLocale = locale === "kh" ? "km-KH" : "en-US";
  return new Intl.DateTimeFormat(timeLocale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationDropdown() {
  const t = useTranslations("NotificationDropdown");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const backendUrl =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001").replace(/\/$/, "");

  useEffect(() => {
    if (status === "loading" || !session?.accessToken) {
      return;
    }

    const accessToken = session.accessToken;

    const controller = new AbortController();

    async function loadStoredNotifications() {
      try {
        const response = await fetch(`${backendUrl}/api/notifications?take=30`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data: NotificationApiItem[] = await response.json();
        const initialItems = data.map((item) => ({
          id: `${item.id}`,
          message: item.message,
          kind: normalizeNotificationKind(item.kind, item.message),
          titleKm: item.titleKm,
          titleEn: item.titleEn,
          createdAt: new Date(item.createdAt),
        }));

        setNotifications(initialItems);
        setNotifying(initialItems.length > 0);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        console.error("Failed to load stored notifications", error);
      }
    }

    loadStoredNotifications();

    return () => {
      controller.abort();
    };
  }, [backendUrl, session?.accessToken, status]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/notificationHub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on(
      "ReceiveNotification",
      (payload: string | { message?: string; kind?: string; titleKm?: string; titleEn?: string; createdAt?: string }) => {
        const message = typeof payload === "string" ? payload : payload.message ?? "";
        if (!message) {
          return;
        }

        const kind =
          typeof payload === "string"
            ? detectNotificationKind(message)
            : normalizeNotificationKind(payload.kind, message);

        const createdAt =
          typeof payload === "string"
            ? new Date()
            : payload.createdAt
              ? new Date(payload.createdAt)
              : new Date();

      const item: NotificationItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        kind,
        titleKm: typeof payload === "string" ? undefined : payload.titleKm,
        titleEn: typeof payload === "string" ? undefined : payload.titleEn,
        createdAt,
      };

      setNotifications((prev) => [item, ...prev].slice(0, 30));
      setNotifying(true);
      },
    );

    connection
      .start()
      .then(() => console.log("SignalR Connected"))
      .catch((err) => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop().then(() => console.log("SignalR Disconnected"));
    };
  }, [backendUrl]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    setNotifying(false);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-primary ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-primary rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-60 mt-[17px] flex w-[350px] max-h-[480px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {t("heading")}
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("empty")}
            </li>
          ) : (
            notifications.map((notification) => {
              const isCreated = notification.kind === "created";
              const isDeleted = notification.kind === "deleted";
              const localizedTitle = isCreated
                ? t("titles.created")
                : isDeleted
                  ? t("titles.deleted")
                  : t("titles.general");
              const preferredTitle = pickLocalizedTitle(
                notification.titleKm,
                notification.titleEn,
                locale,
              );
              const fallbackLegacyTitle = extractTitleFromLegacyMessage(notification.message);
              const effectiveTitle = preferredTitle || fallbackLegacyTitle;
              const localizedMessage = effectiveTitle
                ? isCreated
                  ? t("messages.createdWithTitle", { title: effectiveTitle })
                  : isDeleted
                    ? t("messages.deletedWithTitle", { title: effectiveTitle })
                    : notification.message
                : notification.message || (isCreated
                  ? t("messages.created")
                  : isDeleted
                    ? t("messages.deleted")
                    : "");
              const localizedBadge = isCreated
                ? t("badges.created")
                : isDeleted
                  ? t("badges.deleted")
                  : t("badges.general");

              return (
                <li
                  key={notification.id}
                  className="rounded-lg border-b border-gray-100 px-3 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${
                        isCreated
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          : isDeleted
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                      }`}
                    >
                      {isCreated || isDeleted ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M14 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7L14 3Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 3V7H18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 12H15"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9 16H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        "i"
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                          {localizedTitle}
                        </p>
                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.createdAt, locale)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {localizedMessage}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isCreated
                            ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                            : isDeleted
                              ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                        }`}
                      >
                        {localizedBadge}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </Dropdown>
    </div>
  );
}