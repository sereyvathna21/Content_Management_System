export type AuditLogListItem = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  status: "Success" | "Failure" | string;
  actorFullName: string;
  ipAddress?: string | null;
  createdAt: string;
};

export type AuditLogDetail = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  status: "Success" | "Failure" | string;
  actorFullName: string;
  actorRole?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  errorMessage?: string | null;
  requestId?: string | null;
  correlationId?: string | null;
  sessionId?: string | null;
};

export type Filters = {
  from: string;
  to: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  status: string;
  q: string;
};

export const initialFilters: Filters = {
  from: "",
  to: "",
  userId: "",
  action: "",
  entityType: "",
  entityId: "",
  status: "",
  q: "",
};