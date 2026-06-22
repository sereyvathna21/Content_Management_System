"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import ComponentCard from "@/components/common/ComponentCard";
import RequirePermission from "@/components/auth/RequirePermission";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

type ConnectionStatus = "unknown" | "connected" | "not_configured" | "error";

function StatusPill({ status, t }: { status: ConnectionStatus; t: any }) {
  const configs: Record<ConnectionStatus, { dot: string; bg: string; text: string; labelKey: string }> = {
    unknown:        { dot: "bg-gray-400",    bg: "bg-gray-50 border-gray-200",       text: "text-gray-500",     labelKey: "statusUnknown" },
    connected:      { dot: "bg-emerald-400", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700",  labelKey: "statusConnected" },
    not_configured: { dot: "bg-amber-400",   bg: "bg-amber-50 border-amber-200",     text: "text-amber-700",   labelKey: "statusNotConfigured" },
    error:          { dot: "bg-red-400",     bg: "bg-red-50 border-red-200",         text: "text-red-700",     labelKey: "statusError" },
  };
  const c = configs[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${status === "connected" ? "animate-pulse" : ""}`} />
      {t(c.labelKey as any)}
    </span>
  );
}

export default function TelegramSettingsPage() {
  const t = useTranslations("TelegramPage");
  const { data: session, status } = useSession();

  const [botToken, setBotToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("unknown");
  const [showToken, setShowToken] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    if (status === "loading" || !session?.accessToken) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to load settings.");
      const data = await res.json();

      const token = data["TelegramBotToken"] || "";
      const channel = data["TelegramChannelId"] || "";

      setBotToken(token);
      setChannelId(channel);

      if (!token || !channel) {
        setConnectionStatus("not_configured");
      } else {
        setConnectionStatus("unknown");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTestResult(null);

    try {
      const payload = {
        TelegramBotToken: botToken.trim(),
        TelegramChannelId: channelId.trim(),
      };

      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to update settings.");
      }

      setSuccessMsg(t("successSaved"));
      setLastSaved(new Date());

      if (!botToken.trim() || !channelId.trim()) {
        setConnectionStatus("not_configured");
      } else {
        setConnectionStatus("unknown");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!botToken.trim() || !channelId.trim()) {
      setTestResult({ ok: false, message: t("testFillFields") });
      return;
    }
    if (!session?.accessToken) return;

    setTesting(true);
    setTestResult(null);

    try {
      // Call the Telegram API's getMe endpoint to verify the bot token
      const meRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
      const meData = await meRes.json();

      if (!meData.ok) {
        setConnectionStatus("error");
        setTestResult({ ok: false, message: t("testInvalidToken", { description: meData.description || "Unknown error" }) });
        return;
      }

      const botName = meData.result?.username || meData.result?.first_name || "Unknown Bot";
      setConnectionStatus("connected");
      setTestResult({ ok: true, message: t("testSuccess", { botName }) });
    } catch (err: any) {
      setConnectionStatus("error");
      setTestResult({ ok: false, message: t("testNetworkError") });
    } finally {
      setTesting(false);
    }
  };

  const formatLastSaved = (date: Date) => {
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RequirePermission anyOf={["telegram:read", "telegram:update"]}>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl text-primary font-semibold">{t("title")}</h1>
              <StatusPill status={connectionStatus} t={t} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {t("subtitle")}
            </p>
          </div>
          {lastSaved && (
            <div className="text-xs text-gray-400 shrink-0 sm:text-right">
              {t("lastSaved")}<br className="hidden sm:block" /> {formatLastSaved(lastSaved)}
            </div>
          )}
        </div>

        {/* Status banners */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-xl flex items-start sm:items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Info callout — How to get a token */}
        <div className="rounded-xl border border-sky-200 bg-sky-50 dark:bg-sky-900/10 dark:border-sky-800 p-4 flex gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-sky-800 dark:text-sky-300 space-y-1">
            <div className="font-semibold">{t("setupGuideTitle")}</div>
            <ol className="list-decimal list-inside space-y-0.5 text-xs text-sky-700 dark:text-sky-400">
              <li>{t("setupStep1")}</li>
              <li>{t("setupStep2")}</li>
              <li>{t("setupStep3")}</li>
              <li>{t("setupStep4")}</li>
              <li>{t("setupStep5")}</li>
            </ol>
          </div>
        </div>

        {/* Main form card */}
        <ComponentCard
          title={t("credentialsTitle")}
          desc={t("credentialsDesc")}
        >
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* Bot Token field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("botTokenLabel")}
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full h-11 px-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm font-mono"
                  placeholder={t("botTokenPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowToken((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={showToken ? t("hideToken") : t("showToken")}
                >
                  {showToken ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {t("botTokenHelp")}
              </p>
            </div>

            {/* Channel ID field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t("channelIdLabel")}
              </label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-sm font-mono"
                placeholder={t("channelIdPlaceholder")}
              />
              <p className="text-xs text-gray-400">
                {t("channelIdHelp")}
              </p>
            </div>

            {/* Test connection result */}
            {testResult && (
              <div className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                testResult.ok
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {testResult.ok ? (
                  <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {testResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Test connection button */}
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !botToken.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    {t("testing")}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("testConnection")}
                  </>
                )}
              </button>

              <RequirePermission anyOf={["telegram:update"]}>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-primary hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md text-sm min-w-[130px]"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      {t("saveChanges")}
                    </>
                  )}
                </button>
              </RequirePermission>
            </div>
          </form>
        </ComponentCard>
      </div>
    </RequirePermission>
  );
}
