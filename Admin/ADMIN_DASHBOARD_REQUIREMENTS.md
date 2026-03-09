# Admin Dashboard CMS — Implementation Plan

This document lists a concrete, step-by-step plan to build an admin dashboard CMS for the Frontend landing site. Each top-level step includes practical sub-steps, recommended tools, and commands where useful.

## Overview

- Goal: Provide a production-ready CMS admin for the existing Frontend (content types: news, publications, laws, resources, partners, goals, images, translations, pages).
- Approach: Keep frontend unchanged where possible; expose content via a headless API (either self-hosted or managed) and build an admin UI that uses that API.

## Prerequisites

- Repository: `Frontend/` (landing site) and `Admin/` (dashboard). Backend folder exists if you prefer a custom .NET backend (`Backend/`).
- Dev tools: Node.js, npm/yarn, Docker (optional), an S3-compatible bucket for media (or use local storage during development).

## Step-by-step Plan

1. Define content models (1–2 days)
   - Inventory frontend content used by pages: `News`, `Publication`, `Law`, `Resource`, `Partner`, `Goal`, `Page`, `Image`, `Event`.
   - For each model define fields, types, relations, and i18n variants (e.g., `title`, `slug`, `summary`, `body`, `status`, `publishedAt`, `author`, `locale`, `media[]`).
   - Output: JSON/YAML spec of models (save as `docs/content-models.md`).

2. Choose backend approach (few hours)
   - Options:
     - Managed Headless CMS (fast): Contentful, Sanity, Strapi Cloud, or Netlify CMS.
     - Self-hosted Headless (flexible): Strapi (Node) or a custom .NET Web API using `Backend/` for deeper integration.
   - Recommendation: If you want minimal infra and quick UI, use Strapi (self-hosted) or Sanity (hosted). If you already use .NET backend and prefer one stack, extend `Backend/` with CMS endpoints.

3. Scaffold backend & admin APIs (1–3 days)
   - If Strapi: initialize and import models from step 1. If .NET: scaffold controllers, DTOs, EF models.
   - Implement endpoints: list, get, create, update, delete for each content type; search and pagination; publish/unpublish endpoints.
   - Secure endpoints with JWT / cookie auth.
   - Example (Strapi quick start):
     ```bash
     npx create-strapi-app cms --quickstart
     # then create content-types via the Strapi admin UI or import JSON models
     ```

4. Implement authentication & RBAC (1–2 days)
   - Admin UI auth: use JWT or session-based sign-in. If using Next.js for admin, implement sign-in page with `next-auth` or custom JWT flow.
   - RBAC roles: `admin`, `editor`, `author`, `viewer` — map to API permissions.
   - If using Strapi, configure Roles & Permissions in Strapi admin.

5. Media management (1–2 days)
   - Choose storage: S3 (recommended) or Strapi local during development.
   - Implement upload endpoint and return media URLs. Add image resizing/optimization if needed (Thumbor, Cloudinary, or Next.js Image on fetch).

6. Rich text editor + structured content (1–3 days)
   - Integrate an editor in admin UI: TipTap (rich + extensible) or ProseMirror. If you use Sanity, use its Portable Text.
   - Support embedding media, code blocks, and tables.

7. Build Admin UI (2–5 days)
   - Reuse `Admin/` template components and Tailwind styles. Pages to build:
     - Dashboard (overview, stats)
     - Content lists (for each model) with filtering & pagination
     - Content editors (form pages) with preview and media upload
     - Site settings, i18n management, user management
   - Map fields from content models to forms; validate inputs and show inline validation.
   - Example: fetch list
     ```ts
     // admin example: fetch posts
     const res = await fetch('/api/cms/news?limit=20');
     const data = await res.json();
     ```

8. Live preview & content staging (1–3 days)
   - Add a preview endpoint in the frontend that can render unpublished content via a secure preview token.
   - Implement a `Preview` button in the admin editor that opens the frontend with the preview token.

9. i18n / localization (1–2 days)
   - Reuse `messages/en.json` and `messages/kh.json` structure. Content models should include `locale` or localized fields.
   - Add locale switcher in admin and per-locale content editing.

10. Data sync & migration (1–2 days)
   - If you already have content, create import scripts to migrate into the CMS (CSV/JSON importers).

11. Charts, analytics, and activity logs (1–3 days)
   - Add endpoints to fetch metrics required by the dashboard (views, signups, content counts). Use existing chart components in `Admin/src/components/charts`.
   - Add audit log entries for content changes.

12. Testing, CI, and deployment (2–4 days)
   - Add unit/integration tests for backend APIs and admin UI critical flows.
   - Add CI pipeline to run tests and build (GitHub Actions example).
   - Deploy backend (Heroku/GCP/Azure/DigitalOcean) and connect media bucket. Deploy admin and frontend (Vercel recommended for Next.js frontend).
   - Example deploy preview command (frontend):
     ```bash
     npm run build
     npm run start
     ```

13. Documentation & handoff (1 day)
   - Write admin user docs: creating content, approving/publishing, media upload, preview flow.
   - Developer docs: how to run locally, add content-types, and deploy.

## Suggested Minimal Implementation Path (fast MVP — ~1 week)

1. Use Strapi or Sanity for backend (fast model creation). 2. Reuse `Admin/` UI to wire simple CRUD pages. 3. Add S3 for media. 4. Add preview and i18n later.

## Suggested Full Implementation Path (production-ready)

1. Custom .NET backend if you want full control and to consolidate with `Backend/`. 2. Implement RBAC, audit logs, tests, and CI. 3. Harden security and add backups for media/content.

## Files to add/update

- `docs/content-models.md` — content model definitions
- `Admin/src/pages/*` or `Admin/src/app/*` — admin UI pages
- `Backend/Controllers/Cms*Controller.cs` (if custom .NET) — CMS API endpoints
- `infra/` — deployment manifests (optional)

## Next steps I can take now

- Generate `docs/content-models.md` from the `Frontend/` content usage.
- Scaffold a Strapi instance with the initial content models.
- Scaffold admin list and editor pages wiring to a chosen CMS API.

Pick one of the next steps above and I will start implementing it.
