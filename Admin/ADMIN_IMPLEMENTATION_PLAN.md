# Admin Implementation Plan — NSPC CMS

This single-file plan consolidates the detailed implementation steps for the NSPC CMS admin dashboard. It combines scope, requirements, API suggestions, DB design notes, UI tasks, and step-by-step instructions to implement each part.

---

## Summary

- Purpose: implement an Admin dashboard to manage site content (laws, publications, news, videos, social pages), users & roles, media, i18n, exports, and moderation workflows.
- Main goals: secure admin APIs, editable content with i18n support, media management, bulk exports, audit logs, and an intuitive admin UI.

## High-level Functions

- Authentication & RBAC
- User & Role Management
- Content Management (CRUD + drafts + scheduling)
- Media Storage & Uploads
- Taxonomy (categories/tags)
- Search & Exports (CSV/PDF)
- Moderation & Audit Logs
- Settings & i18n editor

---

## Implementation Steps (detailed)

1) Define scope & data models

- Deliverables: JSON schemas/ER diagram for `Law`, `Publication`, `NewsArticle`, `Video`, `User`, `Media`, `Settings`.
- Actions:
  - Inspect `Frontend/app/Landing-page/*` pages to confirm required fields.
  - Define fields and i18n structure: text fields must support `en` and `kh`.
  - Produce sample JSON documents for each type.

2) Design DB schema & migrations

- Deliverables: migration scripts and table/collection definitions.
- Actions:
  - Choose DB (SQL Server / PostgreSQL recommended for the .NET Backend).
  - Create tables: `laws`, `publications`, `news_articles`, `videos`, `users`, `media`, `categories`, `tags`, `audit_logs`, `settings`.
  - Add indexes: `slug`, `publishedAt`, `status`, `authorId`, and search-related indexes.

Example EF Core commands:
```bash
cd Backend
dotnet ef migrations add AddAdminModels
dotnet ef database update
```

3) Implement authentication & RBAC backend

- Deliverables: auth endpoints and middleware enforcing roles.
- Actions:
  - Implement `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`.
  - Create `roles` (Admin, Editor, Moderator, Viewer) and middleware to check claims.
  - Use JWT or secure HttpOnly cookies; implement token expiry/refresh.

4) Extend API client (`Frontend/app/lib/api.ts`) for admin endpoints

- Deliverables: `adminRequest` helpers and typed wrappers.
- Actions:
  - Add `adminRequest<T>(method, path, body)` that prefixes `/admin` and attaches token.
  - Add helper functions like `getAdminUsers()`, `getAdminLaws()`.

Sample helper:
```ts
export async function adminRequest<T>(method:string, path:string, body?:unknown){
  return request<T>(method, `/admin${path}`, body);
}
```

5) Implement content APIs: Laws

- Deliverables: CRUD endpoints and PDF handling.
- Endpoints:
  - `GET /api/admin/laws`
  - `POST /api/admin/laws`
  - `GET /api/admin/laws/:id`
  - `PUT /api/admin/laws/:id`
  - `DELETE /api/admin/laws/:id`
  - `POST /api/admin/laws/bulk`

Payload example:
```json
{
  "title": {"en":"...","kh":"..."},
  "slug":"national-health-act",
  "category":"Royal Degree",
  "date":"2020-05-10",
  "pdfUrl":"/media/laws/123.pdf",
  "status":"published"
}
```

6) Implement content APIs: Publications

- Deliverables: CRUD + bulk export.
- Endpoints: same pattern as `laws`, plus `POST /api/admin/publications/bulk-export`.

7) Implement content APIs: News & Videos

- Deliverables: CRUD for articles and video metadata (embedUrl, thumbnailUrl).
- Notes: prefer embedded videos (YouTube/Vimeo); support thumbnail uploads.

8) Media storage & upload endpoints

- Deliverables: `POST /api/admin/media/upload`, `GET /api/admin/media`, `DELETE /api/admin/media/:id`.
- Actions:
  - Choose storage backend (S3 recommended). For dev, use local storage with signed URLs.
  - Implement file type checks, size limits, and thumbnail generation.

9) Implement i18n endpoints & translation editor

- Deliverables: `GET/PUT /api/admin/i18n/:locale` and an admin editor UI.
- Actions:
  - Map to `Frontend/messages/en.json` and `messages/kh.json` or store translations in DB.
  - Provide export/import tooling and backups when editing keys.

10) Build Admin UI: auth, layout, and sidebar

- Deliverables: Login page, protected layout, sidebar navigation.
- Actions:
  - Reuse `Admin/src/layout/AppSidebar.tsx` and `Admin/src/app/(admin)/page.tsx` as base.
  - Add `AuthProvider` that calls `GET /api/admin/auth/me` and stores session.

11) Build Admin UI: list pages (search, filter, pagination)

- Deliverables: list pages for laws, publications, news, videos, users, media.
- Actions:
  - Reuse `SearchBar`, `SortControl`, `Pagination`, `ListSkeleton` patterns from Frontend.
  - Server-side pagination and filters in APIs.

12) Build Admin UI: editors with attachments and preview

- Deliverables: create/edit pages for each content type with i18n tabs, attachments, preview, schedule.
- Actions:
  - Use a WYSIWYG or markdown editor, language tabs, and file upload integration.

13) Bulk actions, export, and reporting features

- Deliverables: bulk publish/unpublish/delete, CSV/PDF export endpoint, dashboard metrics.
- Actions:
  - Implement `POST /api/admin/{type}/bulk` and `POST /api/admin/export`.
  - Implement server-side export generation (streaming if needed) and client download flow.

14) Audit logs, activity feed, and moderation workflow

- Deliverables: `audit_logs` table, approvals endpoint, UI for pending items.
- Actions:
  - Log create/update/delete with actor, timestamp, and JSON diffs.
  - Provide UI to approve/reject items in `review` state.

15) Tests, documentation & deployment

- Deliverables: unit/integration tests, `Admin/README.md` with setup, and CI steps.
- Actions:
  - Add backend tests (`dotnet test`), frontend tests (Jest/Playwright/Cypress as desired).
  - Document required env vars: DB connection, S3 credentials, JWT secret.

Example local dev commands
```bash
# Backend
cd Backend
dotnet build
dotnet ef database update
dotnet run

# Frontend (admin)
cd Admin
npm install
npm run dev
```

---

## Suggested File Map & Priorities

Start with these priorities in order:
1. DB schema & migrations (Step 2)
2. Auth & RBAC (Step 3)
3. API client helpers (Step 4)
4. `laws` CRUD and media upload (Steps 5 & 8)
5. Admin UI skeleton + `laws` list + editor (Steps 10, 11, 12)

After these are functional, add publications, news/videos, exports, i18n editor, and audit logs.

---

If you want, I can now scaffold the backend controllers and EF models for `laws` (server side) and create the admin list and editor pages for `laws` in the Admin app. Which would you like me to create next?
