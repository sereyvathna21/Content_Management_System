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
      <div className="font-semibold text-gray-800 wrap-break-words">{value}</div>
    </div>
  );
}

export function AuditLogDetailModal({ open, detail, loading, error, onClose }: Props) {
  // Scoped namespace hook matching your main page file template structure
  const t = useTranslations("AuditLogPage");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal isOpen={open} onClose={onClose} showCloseButton>
      <div className="p-4 sm:p-6 space-y-4">
        <div className="text-lg font-semibold text-primary border-b pb-2">
          {t("detailTitle") || "Audit Log Detail"}
        </div>

        {loading && (
          <div className="text-sm text-gray-500">{t("loading") || "Loading..."}</div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {detail && !loading && (
          <div className="space-y-4 text-sm overflow-y-auto max-h-[60vh]">
            {/* 1. Core General Information: Easy for business clients/users to interpret */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100">
              <DetailField label="Action" value={detail.action} />
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
                  <span className="font-mono text-xs bg-white border px-1.5 py-0.5 rounded inline-block break-all">
                    {detail.entityType}{detail.entityId ? ` • ${detail.entityId}` : ""}
                  </span>
                }
              />
              <DetailField label="Full Name" value={detail.actorFullName} />
              <DetailField label="Time" value={formatDateTime(detail.createdAt)} />
              <DetailField label="IP" value={detail.ipAddress || "-"} />
            </div>

            <DetailField label="Summary" value={detail.summary} />

            {detail.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs font-medium uppercase tracking-wider text-red-500 mb-0.5">Error Message</div>
                <div className="font-medium text-red-600 wrap-break-words font-mono text-xs">{detail.errorMessage}</div>
              </div>
            )}

            {/* 2. Collapsible Developer Details Panel: Keeps noise out of basic user views */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 outline-none select-none"
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
                <div className="mt-4 space-y-4">
                  {/* Metadata Raw Logs */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider flex-wrap gap-2">
                      <span>Metadata</span>
                      <button 
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(detail.metadata ?? {}, null, 2))}
                        className="text-primary hover:underline lowercase font-normal"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="max-h-48 overflow-auto rounded-xl border border-gray-200 bg-gray-950 p-2 sm:p-3 font-mono text-xs text-green-400 shadow-inner">
                      {JSON.stringify(detail.metadata ?? {}, null, 2)}
                    </pre>
                  </div>

                  {/* Network Telemetry Tracking IDs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 sm:p-3.5 rounded-xl border border-gray-100">
                    <DetailField label="Request ID" value={<span className="font-mono text-xs select-all text-gray-700 break-all">{detail.requestId || "N/A"}</span>} />
                    <DetailField label="Correlation ID" value={<span className="font-mono text-xs select-all text-gray-700 break-all">{detail.correlationId || "N/A"}</span>} />
                    <div className="sm:col-span-2">
                      <DetailField label="Session ID" value={<span className="font-mono text-xs select-all text-gray-700 break-all">{detail.sessionId || "N/A"}</span>} />
                    </div>
                    
                    <div className="sm:col-span-2 mt-1">
                      <div className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-0.5">User Agent</div>
                      <div className="font-mono text-xs text-gray-500 break-all bg-white p-2 rounded border">
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