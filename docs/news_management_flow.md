# News and Videos Admin Management Flow

This document explains how to manage News Articles and Videos from the Admin dashboard. It covers the data model, publish rules, API contracts, revalidation flow, and a consolidated execution playbook.

---

## 1) Purpose

- Manage News Articles and Videos shown on the public News page.
- Replace the current static data sources in [Frontend/app/Landing-page/News/articles.ts](Frontend/app/Landing-page/News/articles.ts) and [Frontend/app/Landing-page/News/videos.ts](Frontend/app/Landing-page/News/videos.ts).

Goal: one clear flow from Admin UI -> API -> database -> public UI refresh.

---

## 2) Scope and Source of Truth

- Public UI requirements live in [Frontend/app/Landing-page/News/page.tsx](Frontend/app/Landing-page/News/page.tsx), [Frontend/app/Landing-page/News/[id]/page.tsx](Frontend/app/Landing-page/News/[id]/page.tsx), and [Frontend/app/Landing-page/News/videos/[id]/page.tsx](Frontend/app/Landing-page/News/videos/[id]/page.tsx).
- Admin UI should be the source of truth for all News and Video content.

---

## 3) Data Model (Recommended)

### 3.1 NewsArticle (table)

Required fields:

- id (Guid)
- slug (string, unique)
- category (string)
- status (Draft, Published, Archived)
- publishAt (datetime, optional)
- imageUrl or imageMediaId (string or Guid)
- createdAt, updatedAt
- createdByUserId, updatedByUserId

Optional fields:

- imageAltKm, imageAltEn (string)
- featured (bool)
- sortOrder (int)
- deletedAt (datetime, optional)
- deletedByUserId (Guid or int, optional)

### 3.2 NewsArticleTranslation (table)

Required fields:

- id (Guid)
- articleId (Guid, FK to NewsArticle)
- language (km, en)
- title (string, required for default language)
- excerpt (string, required for default language)

Optional fields:

- subtitle (string)
- contentHtml or contentMd (string)
- metaTitle (string)
- metaDescription (string)
- canonicalUrl (string)

Relationship:

- One NewsArticle has many NewsArticleTranslation records.
- Prefer a separate table rather than JSON so you can filter/search by language.

### 3.3 Video (table)

Required fields:

- id (Guid)
- title (string)
- description (string)
- embedUrl (string, required)
- category (string)
- status (Draft, Published, Archived)
- publishAt (datetime, optional)
- createdAt, updatedAt

Optional fields:

- thumbnailUrl or thumbnailMediaId (string or Guid)
- sortOrder (int)
- featured (bool)
- deletedAt (datetime, optional)
- deletedByUserId (Guid or int, optional)

---

## 4) Translation Policy

- Default language: KM (locale key: km).
- EN is optional for drafts, but if provided it must include title and excerpt.
- Publish requires KM title and excerpt.
- Public API is strict by language: if a translation is missing for the requested lang, omit it from list results and return 404 for detail.
- Use locale codes km/en to match Next-Intl and the NEXT_LOCALE cookie.

### 4.1 Admin Multi-language Management

- Yes, News supports multiple languages through the NewsArticleTranslation table.
- Admin forms should use language tabs (KM, EN) and validate per-language fields.
- To add another language later, update the language enum, admin form tabs, validation rules, and public API language filtering.

### 4.2 Video Translation Decision

- Decide now: either add a VideoTranslation table (KM/EN titles and descriptions) or document that video is single-language.
- If videos are single-language, keep title and description on the Video table and do not require translations.

---

## 5) Publish Gate Rules

News cannot be published unless all items below are valid:

- slug is present and unique
- category is present
- publishAt is set (now or future) if status is Published
- feature image exists (imageUrl or imageMediaId)
- default language (KM) has title and excerpt
- if image is present, imageAltKm is required

Video cannot be published unless all items below are valid:

- embedUrl is present and uses an allowed host (YouTube, Vimeo, Facebook)
- title and description are present
- category is present
- publishAt is set (now or future) if status is Published
- if a thumbnail is used, alt text is required in the default language

---

## 6) Roles and Permissions (Recommended)

| Role       | View | Create Draft | Edit Draft | Publish | Delete | Manage Media |
| ---------- | ---- | ------------ | ---------- | ------- | ------ | ------------ |
| SuperAdmin | Yes  | Yes          | Yes        | Yes     | Yes    | Yes          |
| Admin      | Yes  | Yes          | Yes        | Yes     | Yes    | Yes          |
| Editor     | Yes  | Yes          | Yes        | No      | No     | Limited      |
| Viewer     | Yes  | No           | No         | No      | No     | No           |

Note: adjust these rules to match your actual RBAC implementation.

---

## 7) API Contract

### Admin endpoints (protected)

News:

- GET /api/admin/news?page=1&pageSize=20&q=&category=&status=&includeDeleted=
- POST /api/admin/news
- GET /api/admin/news/{id}
- PUT /api/admin/news/{id}
- DELETE /api/admin/news/{id}
- POST /api/admin/news/{id}/restore
- POST /api/admin/news/bulk

Videos:

- GET /api/admin/videos?page=1&pageSize=20&q=&category=&status=&includeDeleted=
- POST /api/admin/videos
- GET /api/admin/videos/{id}
- PUT /api/admin/videos/{id}
- DELETE /api/admin/videos/{id}
- POST /api/admin/videos/{id}/restore
- POST /api/admin/videos/bulk

### Public endpoints (unprotected)

- GET /api/public/news?lang=km&page=1&pageSize=12
- GET /api/public/news/{slug}?lang=km
- GET /api/public/videos?lang=km&page=1&pageSize=12

---

## 8) Bulk Actions Spec

Bulk action request body (news and videos):

```json
{
  "action": "publish",
  "ids": ["id1", "id2"],
  "publishAt": "2026-05-11T09:00:00Z"
}
```

Supported actions:

- publish (sets status to Published and publishAt)
- unpublish (sets status to Draft)
- delete (soft delete by default; sets deletedAt and deletedByUserId)
- restore (clears deletedAt and deletedByUserId)

## 9) Soft Delete Behavior

- Admin list endpoints exclude soft-deleted records by default.
- Use includeDeleted=true to view deleted items in admin lists.
- Public endpoints always exclude soft-deleted records.
- Restore clears deletedAt and deletedByUserId.

---

## 10) Revalidation Flow (Detailed)

Revalidation is required to refresh the public site after admin updates.

Important: scheduled publishing requires a background job. If you set publishAt in the future but do not run a scheduler (Hangfire/Quartz/worker), the item will not auto-publish.

Setup:

- Ensure the Next.js revalidation route exists in [Frontend/app/api/revalidate/route.ts](Frontend/app/api/revalidate/route.ts).
- Configure FrontendUrl and RevalidateSecret in [Backend/appsettings.json](Backend/appsettings.json).

Backend call pattern:

- POST {FrontendUrl}/api/revalidate
- Body:

```json
{
  "secret": "<RevalidateSecret>",
  "path": "/Landing-page/News"
}
```

Recommended paths:

- /Landing-page/News
- /Landing-page/News/{slug}
- /Landing-page/News/videos/{id}

Optional: if you later extend [Frontend/app/api/revalidate/route.ts](Frontend/app/api/revalidate/route.ts) to use revalidateTag, add a tag param and document tag names here.

---

## 11) Admin UI File Map (Proposed)

News:

- Admin/src/app/(admin)/news/page.tsx
- Admin/src/components/news/NewsTable.tsx
- Admin/src/components/news/NewsFilters.tsx
- Admin/src/components/news/NewsForm.tsx
- Admin/src/components/news/NewsEditForm.tsx

Videos:

- Admin/src/app/(admin)/videos/page.tsx
- Admin/src/components/videos/VideoTable.tsx
- Admin/src/components/videos/VideoFilters.tsx
- Admin/src/components/videos/VideoForm.tsx

Reusable helpers:

- Admin/src/lib/pickTranslation.ts
- Admin/src/lib/api.ts

Revalidation route:

- Frontend/app/api/revalidate/route.ts

---

## 12) Execution Playbook (Merged Steps + Checklist)

1. Confirm requirements

- Review public UI requirements in [Frontend/app/Landing-page/News/page.tsx](Frontend/app/Landing-page/News/page.tsx) and [Frontend/app/Landing-page/News/[id]/page.tsx](Frontend/app/Landing-page/News/[id]/page.tsx).
- Decide default language (Km) and slug rules.
- Use locale codes km/en to match frontend locale settings.

2. Build database models

- Add NewsArticle, NewsArticleTranslation, Video models.
- Add DbSet entries and relationships in ApplicationDbContext.

3. Add DTOs and mappings

- Create list, detail, create, update DTOs.
- Update AutoMapper profiles.

4. Implement admin APIs

- Add controllers with Admin and SuperAdmin authorization.
- Implement CRUD and bulk endpoints with validation.

5. Implement public APIs

- Add list and detail endpoints.
- Enforce strict language filtering.

6. Add media upload support

- Reuse existing media endpoints for images/thumbnails.
- Validate file type and size.
- Allowed types: jpg, png, webp.
- Max size: 10MB per file.
- Enforce limits server-side and return a 400 with a clear message when invalid.

7. Build Admin UI pages

- Add list pages with search, filters, pagination.
- Add create/edit forms with language tabs.
- Add publish controls and delete confirmations.

8. Wire the public News page to APIs

- Replace static arrays in [Frontend/app/Landing-page/News/articles.ts](Frontend/app/Landing-page/News/articles.ts) and [Frontend/app/Landing-page/News/videos.ts](Frontend/app/Landing-page/News/videos.ts).
- Update [Frontend/app/Landing-page/News/page.tsx](Frontend/app/Landing-page/News/page.tsx) to fetch from public APIs.

9. Add revalidation hooks

- Configure secrets in [Backend/appsettings.json](Backend/appsettings.json).
- Trigger revalidation after publish/update/delete.

10. Verify end-to-end

- Create, edit, publish, and delete a news article.
- Create, edit, and delete a video.
- Confirm public pages update and pagination works.

---

## 13) Migration Checklist

Backend commands:

```bash
cd Backend
dotnet ef migrations add AddNewsAndVideos
dotnet ef database update
```

---

## 14) Fast-Start Schedule (4-Day Sprint)

Day 1:

- Confirm data model and translation policy.
- Add EF models and migrations.
- Build admin list endpoints.

Day 2:

- Implement admin create/edit endpoints and validation.
- Build admin UI list and create forms.

Day 3:

- Add public APIs and wire public News pages.
- Add revalidation call and test content refresh.

Day 4:

- Implement bulk actions, publish gates, and QA.
- Finalize docs and handoff.

---

## 15) Future Upgrade Path

- Replace simple textareas with a rich text editor (TipTap).
- Add category and tag tables for better filtering.
- Add scheduled publishing with a background job (required for publishAt to auto-publish).

---

## 16) Minimum Required Fields

News:

- slug
- category
- status
- translations[default].title
- translations[default].excerpt
- imageUrl or imageMediaId

Videos:

- title
- description
- embedUrl
- category
- status

---

If you want, I can scaffold the backend models/controllers and the Admin UI pages for News and Videos next.
