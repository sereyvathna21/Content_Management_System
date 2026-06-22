"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { AuditLogDetail } from "../../types/auditLog";
import { formatDateTime, statusColor } from "../../lib/auditLogUtils";

type Props = {
  open: boolean;
  detail: AuditLogDetail | null;
  loading: boolean;
  error: string;
  onClose: () => void;
};

type FieldProps = { label: string; value: React.ReactNode };

function DetailField({ label, value }: FieldProps) {
  return (
    <div>
      <div className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-0.5">{label}</div>
      <div className="font-semibold text-gray-800 dark:text-gray-200 break-words">{value}</div>
    </div>
  );
}

// ─── OldValues / NewValues diff view ─────────────────────────────────────────
function DiffView({ oldValues, newValues }: { oldValues: Record<string, unknown>; newValues: Record<string, unknown> }) {
  const allKeys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
      {/* Header */}
      <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-1 px-3 py-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">Field</div>
        <div className="col-span-1 px-3 py-2 font-bold text-red-500 uppercase tracking-wider text-[10px] border-l border-gray-200 dark:border-gray-700">Before</div>
        <div className="col-span-1 px-3 py-2 font-bold text-emerald-500 uppercase tracking-wider text-[10px] border-l border-gray-200 dark:border-gray-700">After</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {allKeys.map((key) => {
          const oldVal = oldValues[key] ?? null;
          const newVal = newValues[key] ?? null;
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          return (
            <div
              key={key}
              className={`grid grid-cols-3 ${hasChanged ? "bg-amber-50/30 dark:bg-amber-900/10" : ""}`}
            >
              <div className="col-span-1 px-3 py-2.5 font-semibold text-gray-600 dark:text-gray-400 font-mono">
                {key}
              </div>
              <div className={`col-span-1 px-3 py-2.5 border-l border-gray-100 dark:border-gray-800 font-mono break-all ${hasChanged ? "bg-red-50/60 dark:bg-red-900/10 text-red-600 dark:text-red-400" : "text-gray-500"}`}>
                {oldVal === null ? <span className="italic text-gray-300">null</span> : String(oldVal)}
              </div>
              <div className={`col-span-1 px-3 py-2.5 border-l border-gray-100 dark:border-gray-800 font-mono break-all ${hasChanged ? "bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400" : "text-gray-500"}`}>
                {newVal === null ? <span className="italic text-gray-300">null</span> : String(newVal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuditLogDetailModal({ open, detail, loading, error, onClose }: Props) {
  const t = useTranslations("AuditLogPage");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Detect if metadata has OldValues/NewValues structure
  const hasDiff =
    detail?.metadata &&
    typeof detail.metadata === "object" &&
    "OldValues" in detail.metadata &&
    "NewValues" in detail.metadata;

  const oldValues = hasDiff ? (detail!.metadata as any).OldValues as Record<string, unknown> : null;
  const newValues = hasDiff ? (detail!.metadata as any).NewValues as Record<string, unknown> : null;

  return (
    <Modal isOpen={open} onClose={onClose} showCloseButton>
      <div className="p-4 sm:p-6 space-y-4 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white">
            {t("detailTitle") || "Audit Log Detail"}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-500 py-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            {t("loading") || "Loading..."}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {detail && !loading && (
          <div className="space-y-4 text-sm overflow-y-auto max-h-[70vh] pr-0.5">
            {/* Core General Info */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50/70 dark:bg-gray-800/40 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <DetailField label="Action" value={
                <span className="font-mono text-xs bg-white dark:bg-gray-900 border dark:border-gray-700 px-1.5 py-0.5 rounded">{detail.action}</span>
              } />
              <DetailField
                label="Status"
                value={
                  <div className="mt-0.5">
                    <Badge size="sm" variant="light" color={statusColor(detail.status)}>
                      {detail.status}
                    </Badge>
                  </div>
                }
              />
              <DetailField
                label="Entity"
                value={
                  <span className="font-mono text-xs bg-white dark:bg-gray-900 border dark:border-gray-700 px-1.5 py-0.5 rounded inline-block break-all">
                    {detail.entityType}{detail.entityId ? ` • ${detail.entityId}` : ""}
                  </span>
                }
              />
              <DetailField label="User" value={detail.actorFullName} />
              <DetailField label="Time" value={formatDateTime(detail.createdAt)} />
              <DetailField label="IP" value={
                <span className="font-mono text-xs">{detail.ipAddress || "—"}</span>
              } />
            </div>

            {detail.summary && (
              <DetailField label="Summary" value={detail.summary} />
            )}

            {detail.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-800 rounded-xl">
                <div className="text-xs font-medium uppercase tracking-wider text-red-500 mb-1">Error Message</div>
                <div className="font-medium text-red-600 dark:text-red-400 break-all font-mono text-xs">{detail.errorMessage}</div>
              </div>
            )}

            {/* ── Diff View for OldValues/NewValues ── */}
            {hasDiff && oldValues && newValues && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Changes</div>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-semibold">
                    {Object.keys(oldValues).length} field{Object.keys(oldValues).length !== 1 ? "s" : ""} modified
                  </span>
                </div>
                <DiffView oldValues={oldValues} newValues={newValues} />
              </div>
            )}

            {/* ── Raw Metadata (when not a diff) ── */}
            {!hasDiff && detail.metadata && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                  <span>Metadata</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(JSON.stringify(detail.metadata ?? {}, null, 2))}
                    className="text-primary hover:underline lowercase font-normal normal-case tracking-normal"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-950 p-2 sm:p-3 font-mono text-xs text-green-400 shadow-inner">
                  {JSON.stringify(detail.metadata ?? {}, null, 2)}
                </pre>
              </div>
            )}

            {/* ── Collapsible Technical Details ── */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 outline-none select-none transition-colors"
              >
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
                {showAdvanced ? "Hide Technical Details" : "Show Technical Details"}
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  {/* Raw Metadata (when diff view is shown) */}
                  {hasDiff && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                        <span>Raw Metadata</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(JSON.stringify(detail.metadata ?? {}, null, 2))}
                          className="text-primary hover:underline lowercase font-normal normal-case tracking-normal"
                        >
                          Copy JSON
                        </button>
                      </div>
                      <pre className="max-h-40 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-950 p-2 sm:p-3 font-mono text-xs text-green-400 shadow-inner">
                        {JSON.stringify(detail.metadata ?? {}, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Network Telemetry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <DetailField label="Request ID" value={<span className="font-mono text-xs select-all text-gray-700 dark:text-gray-300 break-all">{detail.requestId || "N/A"}</span>} />
                    <DetailField label="Correlation ID" value={<span className="font-mono text-xs select-all text-gray-700 dark:text-gray-300 break-all">{detail.correlationId || "N/A"}</span>} />
                    <div className="sm:col-span-2">
                      <DetailField label="Session ID" value={<span className="font-mono text-xs select-all text-gray-700 dark:text-gray-300 break-all">{detail.sessionId || "N/A"}</span>} />
                    </div>
                    <div className="sm:col-span-2 mt-1">
                      <div className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-0.5">User Agent</div>
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400 break-all bg-white dark:bg-gray-900 p-2 rounded border dark:border-gray-700">
                        {detail.userAgent || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}