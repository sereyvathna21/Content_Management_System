# Admin Dashboard Requirements — NSPC CMS

This document describes the recommended admin dashboard functions and requirements inferred from the Frontend and Admin code in this repository. Use this as a specification for implementing the Admin backend, API endpoints, and UI screens.

---

## 1 — Summary

- Purpose: allow administrators and editors to manage content published on the public site (publications, laws, news, videos, social content), manage users and roles, moderate content, export reports, and configure site settings and translations.
- Scope: CRUD for content types visible in the Frontend, media management, user/role management, analytics & exports, i18n support, and operational features (audit logs, backups, scheduling).

## 2 — High-level Admin Functions

- Authentication & Authorization
  - Sign in/out, session management, JWT or cookie-based tokens.
  - Role-based access: Admin, Editor, Moderator, Viewer.
  - Per-route and per-action permission checks.

- User & Role Management
  - List users, search, filter, sort, paginate.
  - Create/edit/delete user accounts and assign roles.
  - Reset password, invite links, last-login and activity metadata.

- Content Management (for each content type below)
  - Create, Read, Update, Delete (CRUD) operations.
  - Drafts, scheduled publish/unpublish dates, and versioning or simple revision history.
  - Bulk actions (publish/unpublish/delete), multi-select exports.
  - Rich text editing and attachments (PDFs, images, video links).

Content types inferred from Frontend:
  - Publications (PDFs, authors, publish date, categories)
  - Laws / Legal resources (PDF, category, date, tags)
  - News / Articles (title, excerpt, body, image, category, date)
  - Videos / Multimedia (title, url/embed, thumbnail, date)
  - Social Content / Pages (about, governance, sections with i18n)

- Media Management
  - Upload, store, and serve media (images, PDFs, video thumbnails).
  - Replace or remove files, generate thumbnails, size limits.
  - File browser with search and usage references.

- Taxonomy & Metadata
  - Categories, tags, and custom fields for content filtering.
  - Manage display order and grouping used by Frontend components.

- Search & Indexing
  - Admin-side search for content and users, leverage existing search utilities.
  - Re-indexing trigger if a search index (e.g., Elastic, Algolia) used.

- Export & Reporting
  - CSV/PDF export for selected items (see `ExportBar.tsx`).
  - Basic analytics dashboards: counts, recent activity, content metrics.

- Moderation & Workflow
  - Content approval flow (Draft → Review → Published).
  - Comment or feedback moderation (if comments exist or planned).

- Audit Logs & Activity
  - Log create/update/delete actions with user, timestamp, and diff summary.

- Settings & Configuration
  - Site settings (site title, default language), social links, contact info.
  - i18n strings management for `en` and `kh` used by Frontend.

## 3 — Suggested API Endpoints (REST-style)

- Auth
  - POST `/api/admin/auth/login`
  - POST `/api/admin/auth/logout`
  - GET `/api/admin/auth/me`

- Users
  - GET `/api/admin/users` (list, filter, paginate)
  - POST `/api/admin/users` (create)
  - GET `/api/admin/users/:id`
  - PUT `/api/admin/users/:id` (update)
  - DELETE `/api/admin/users/:id`

- Publications / Laws / News / Videos
  - GET `/api/admin/{type}`
  - POST `/api/admin/{type}`
  - GET `/api/admin/{type}/:id`
  - PUT `/api/admin/{type}/:id`
  - DELETE `/api/admin/{type}/:id`
  - POST `/api/admin/{type}/bulk` (bulk actions)

- Media
  - POST `/api/admin/media/upload`
  - GET `/api/admin/media` (list)
  - DELETE `/api/admin/media/:id`

- Settings & I18n
  - GET/PUT `/api/admin/settings`
  - GET/PUT `/api/admin/i18n/:locale` (manage translations)

- Exports & Reports
  - POST `/api/admin/export` (request CSV/PDF)

## 4 — UI Screens & Components (Admin)

- Login screen and session timeout handling.
- Dashboard overview: metrics widgets (counts, recent items, pending review).
- Content list pages per content type with search, filters, sort, pagination, multi-select and export (use `SearchBar`, `SortControl`, `Pagination` patterns present in Frontend).
- Content editor/page: form with fields, WYSIWYG or markdown, file attachments, preview, save draft, schedule publish.
- Media library with upload and file details.
- User & role management UI.
- Settings and translation editor.
- Confirmation dialogs for destructive actions (reuse `ConfirmDialog` component pattern).

## 5 — Data Model Notes (high level)

- Shared fields across content types: `id`, `title`, `slug`, `excerpt`, `body`, `images`, `files`, `category`, `tags`, `authorId`, `createdAt`, `updatedAt`, `publishedAt`, `status` (`draft|published|archived`).
- i18n: `title`, `excerpt`, `body`, and other display fields must support `en` and `kh`.

## 6 — Non-functional Requirements

- Authentication: token expiration & refresh, secure cookie or secure storage.
- Performance: server-side pagination for lists, efficient media delivery (CDN recommended).
- Security: RBAC, rate-limiting on admin APIs, input validation and file-type restrictions.
- Backups: export and backup routines for content and media.

## 7 — Acceptance Criteria (examples)

- Admin user can create, edit, and publish a `Law` with PDF attachment and have it appear on the public `Laws` page.
- Editors can save drafts and schedule publish dates; scheduled items become public at the correct time.
- Admin can bulk-export selected `Publications` to PDF/CSV as expected by `ExportBar` behavior.

## 8 — Next Implementation Steps

1. Define database schema for content types (tables/collections) and implement API routes listed above.
2. Implement auth with RBAC and protect all admin APIs.
3. Build Admin UI pages referencing components in `Admin/src` and reuse Frontend patterns for search/pagination.
4. Add media storage (S3 or local + CDN) and implement file upload endpoint.
5. Implement audit logs and reporting endpoints.

---

If you'd like, I can:

- generate OpenAPI / Swagger example for the endpoints listed above,
- scaffold the admin API controllers for one content type (e.g., `laws`), or
- scaffold the React admin pages (list + editor) and wire them to the existing `api.ts` client.

Tell me which next step you prefer and I'll proceed.
