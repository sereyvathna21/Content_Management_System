# Audit Log Implementation Flow (Admin Dashboard)

This document defines a step-by-step implementation plan for an Admin Audit Log. It covers data model, logging rules, API contracts, and the Admin UI flow.

---

## 1) Objective

- Provide a searchable, immutable history of admin actions.
- Support security investigations, accountability, and troubleshooting.
- Make audit logs visible in the Admin dashboard with filters and detail view.

---

## 2) Scope

Audit logs should record **admin actions** that change data or configuration, including:

- Authentication events (login, logout, failed login, password reset)
- CRUD actions on core resources (news, videos, laws, publications, users, roles)
- Permission changes and role assignments
- Media uploads and deletes
- Security actions (user blocked, token revoked)
- Bulk actions

Non-admin public endpoints should not write audit logs unless explicitly required.

---

## 3) Data Model (Recommended)

### 3.1 AuditLog (table)

Required fields:

- Id (Guid or long)
- Action (string, e.g., "news:create", "role:permissions:update")
- EntityType (string, e.g., "News", "Role", "User")
- EntityId (string, nullable for non-entity events)
- Summary (string, human-readable)
- Status (string enum: Success, Failure)
- ActorFullName (string)
- ActorFullName (string)
- ActorRole (string or RoleId)
- IpAddress (string)
- UserAgent (string)
- CreatedAt (datetime, UTC)

Optional fields:

- Metadata (jsonb or json string) // store as jsonb when supported for query/filter
- ErrorMessage (string) // for failures
- RequestId (string) // trace correlation
- CorrelationId (string) // end-to-end request grouping
- SessionId (string) // optional, groups a single admin session
- TenantId (string) // if multi-tenant in future

**Multi-role rule:** If users can have multiple roles, store the highest-privilege role only and apply that rule consistently so the logs are not ambiguous.

### 3.2 Suggested indexes

- (CreatedAt DESC)
- (ActorUserId, CreatedAt DESC)
- (Action, CreatedAt DESC)
- (EntityType, EntityId)

### 3.3 JSON storage recommendation

- Postgres: use `jsonb` for `Metadata`.
- SQL Server: use `nvarchar(max)` with a JSON check constraint if possible.
- Benefit: filter by metadata fields server-side (e.g., `Metadata->>'field'`).

---

## 4) Event Taxonomy (Recommended)

Use a consistent namespace to make filtering reliable:

- auth:login
- auth:login_failed
- auth:logout
- user:create | user:update | user:delete | user:block | user:unblock
- role:create | role:update | role:delete
- role:permissions:update
- permission:create | permission:update | permission:delete
- news:create | news:update | news:delete | news:publish | news:unpublish
- video:create | video:update | video:delete | video:publish | video:unpublish
- laws:create | laws:update | laws:delete
- publication:create | publication:update | publication:delete
- media:upload | media:delete
- bulk:news:delete | bulk:news:publish | bulk:user:block | bulk:role:update

**Bulk event rule:** If you keep a generic bulk event, `Metadata` must include `targetAction` and `affectedCount` at minimum.

---

## 5) Write Flow (How Logs Are Recorded)

**Rule:** Logs are created server-side, not from the client.

1. Admin calls a protected API (e.g., create news).
2. Controller/service executes the action.
3. After success (or in catch block for failure), call `IAuditLogService.WriteAsync(...)`.
4. `IAuditLogService` composes a record using:

- Actor info from JWT claims
- Request metadata from HttpContext (IP, user agent)
- Action name, entity type/id, and summary
- Old/New values as JSON in `Metadata`
- `CorrelationId` from request headers (or generated)
- `SessionId` from auth session (if available)

5. **Write strategy**:

- Low traffic: save inline to database.
- Medium/high traffic: enqueue to in-memory channel or message queue and flush asynchronously.

6. Save AuditLog to database (inline or async worker).

**Async failure handling:** Retry failed queue writes up to 3 times. If still failing, write a minimal dead-letter log (file or fallback table) so the event is not silently dropped.

**Failure logging:** On exceptions or validation failures, log `Status = Failure` with `ErrorMessage`.

**Proxy IP handling:** If behind a proxy/CDN, read `X-Forwarded-For` or `CF-Connecting-IP` and fall back to `HttpContext.Connection.RemoteIpAddress`.

**Trusted proxy rule:** Only trust `X-Forwarded-For` or `CF-Connecting-IP` when the request comes from a known proxy IP range. Otherwise, ignore these headers and use `RemoteIpAddress` to prevent spoofing.

---

## 6) Read Flow (Admin Dashboard)

1. Admin opens Audit Log page.
2. Admin UI calls list endpoint with filters.
3. API returns paged results sorted by newest first.
4. Admin can open a detail drawer to view full metadata.

---

## 7) API Contract

### 7.1 Admin endpoints (protected)

- GET `/api/admin/audit-logs?page=1&pageSize=20&from=&to=&userId=&action=&entityType=&entityId=&status=&q=`
  - Returns paged list of audit logs with minimal fields for table display.
  - Enforce a max `pageSize` (recommended: 100).

- GET `/api/admin/audit-logs/{id}`
  - Returns full detail including `Metadata` and `ErrorMessage`.

- GET `/api/admin/audit-logs/export?format=csv&from=&to=&userId=&action=&entityType=&status=`
  - Optional. Exports filtered logs.
  - If export may be large, implement async job with download link.
  - Export scope should be restricted (recommended: SuperAdmin-only or server-side filtering to the requester's scope).

**Note:** No public or admin endpoint is required to create logs. Creation is internal.

### 7.2 List response (example)

```json
{
  "items": [
    {
      "id": "bcd2f0b3-9f2a-4c17-91dd-5a5d5d4f9871",
      "action": "news:update",
      "entityType": "News",
      "entityId": "a1b2c3",
      "summary": "Updated news title",
      "status": "Success",
      "actorUserId": 12,
      "actorEmail": "admin@example.com",
      "ipAddress": "203.0.113.10",
      "createdAt": "2026-05-26T03:21:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1348
}
```

### 7.3 Detail response (example)

```json
{
  "id": "bcd2f0b3-9f2a-4c17-91dd-5a5d5d4f9871",
  "action": "news:update",
  "entityType": "News",
  "entityId": "a1b2c3",
  "summary": "Updated news title",
  "status": "Success",
  "actorUserId": 12,
  "actorEmail": "admin@example.com",
  "actorRole": "Admin",
  "ipAddress": "203.0.113.10",
  "userAgent": "Mozilla/5.0 ...",
  "createdAt": "2026-05-26T03:21:00Z",
  "metadata": {
    "old": { "title": "Old Title" },
    "new": { "title": "New Title" }
  },
  "requestId": "0HMS3T1F6M4C5:00000001",
  "correlationId": "b4ac02a8b5d24a07",
  "sessionId": "sess_9f0c3d8a"
}
```

---

## 8) Permissions (Recommended)

- `audit:read` - Can view logs
- `audit:export` - Can export logs

Add these into your Permission constants and assign to SuperAdmin/Admin roles.

---

## 9) Step-by-step Implementation Plan

1. **Add model + migration**
   - Create `AuditLog` entity and add DbSet in ApplicationDbContext.
   - Add indexes (CreatedAt, Action, ActorUserId).

2. **Add DTOs**
   - `AuditLogListItemDto`
   - `AuditLogDetailDto`
   - `AuditLogQueryParams`

3. **Create service**
   - `IAuditLogService` with `WriteAsync(AuditLogEntry entry)`.
   - Implement in `AuditLogService`.

4. **Create log helper**

- `AuditLogEntry` model with `Action`, `EntityType`, `EntityId`, `Summary`, `Status`, `Metadata`, `CorrelationId`, `SessionId`.
- Helper for extracting actor/IP/user agent from HttpContext and proxy headers.

5. **Integrate logging**
   - Add calls in Admin controllers for create/update/delete.
   - Add logging to auth actions (login success/failure, logout).

6. **Add API controller**
   - `AdminAuditLogsController` with GET list and GET detail.
   - Protect with `HasPermission("audit:read")`.

7. **Add Admin UI page**
   - Table with filters: date range, action, user, entity type, status, free text.
   - Detail drawer for metadata and error message.

8. **Add export (optional)**

- Simple synchronous CSV export for small ranges.
- If estimated rows > 10,000, switch to async job + download link.
- Apply rate limiting to export endpoints.

9. **Verify & QA**
   - Trigger actions, verify logs appear.
   - Confirm metadata is stored and sensitive values are masked.

---

## 10) Data Validation Rules

- Do not store passwords, tokens, or secrets in `Metadata`.
- Mask PII when needed (e.g., last 4 digits only).
- Always store timestamps in UTC.
- Ensure audit logs are **append-only** (no update/delete APIs).

---

## 11) Security Controls

- Enforce HTTPS for all audit log endpoints; reject or redirect HTTP.
- Database access control: the application DB user should have INSERT-only privileges on the AuditLog table (no UPDATE/DELETE).
- Audit audit-log access: log `audit:read` and `audit:export` events when users view or export logs.
- Session revocation: record token/session revocation events so SessionId can be correlated during investigations.
- Alerting hook: consider alerts for patterns like repeated `auth:login_failed` from one IP or bulk deletes in a short window.

---

## 12) Retention Policy (Recommended)

- Default: keep audit logs for 365 days.
- Security events: keep for 2-3 years if required by policy.
- Provide a purge job or archive to cold storage for older data.

---

## 13) Admin UI Requirements

- Default sort: newest first.
- Filters:
  - Date range (from/to)
  - Action
  - User
  - Entity type
  - Status
  - Free-text search
- Columns:
  - Time, Action, Entity, Actor, Status, IP
- Detail view:
  - Summary + Metadata JSON (pretty formatted)
  - Error message if failed

---

## 14) Testing Checklist

- Create/update/delete a News item -> log created.
- Update role permissions -> log created with old/new values.
- Failed login -> log created with Status = Failure.
- List endpoint supports filters and pagination.
- Detail endpoint returns full metadata.
- Non-admin cannot access list or detail endpoints.
- Metadata masking removes secrets/password fields.
- Export endpoint is rate limited and respects permission checks.
- Performance: query 100,000+ rows with a date filter and confirm response time meets the accepted threshold.

---

## 15) Known Limitations / Out of Scope

- Read-only GET actions are not logged by default.
- Public endpoints are not logged unless explicitly required.
- Log tampering prevention relies on database access controls and backups.

---

If you want, I can scaffold the backend model, service, and controller, or add the Admin UI page next.
