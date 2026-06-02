"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getBackendUrl } from "@/lib/backend";
import { readApiError } from "@/lib/readApiError";
import { AuditLogDetail } from "../types/auditLog";

export function useAuditLogDetail(detailId: string | null, open: boolean) {
  const { data: session } = useSession();
  const backendUrl = useMemo(() => getBackendUrl(), []);

  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadDetail = useCallback(
    async (id: string) => {
      if (!session?.accessToken) return;
      setDetailLoading(true);
      setDetailError("");
      try {
        const res = await fetch(`${backendUrl}/api/admin/audit-logs/${id}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!res.ok) {
          const message = await readApiError(res, "Failed to load audit log detail");
          setDetailError(message);
          setDetail(null);
          return;
        }
        const raw = await res.json();
        setDetail({ ...raw, actorFullName: raw.actorFullName || "N/A" });
      } catch (err) {
        console.error(err);
        setDetailError("Failed to load audit log detail.");
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [backendUrl, session?.accessToken]
  );

  useEffect(() => {
    if (!open || !detailId) return;
    loadDetail(detailId);
  }, [detailId, open, loadDetail]);

  const reset = () => {
    setDetail(null);
    setDetailError("");
  };

  return { detail, detailLoading, detailError, reset };
}