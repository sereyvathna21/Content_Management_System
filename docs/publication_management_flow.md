# Publication Module Flow - Reusable Blueprint

This document explains the Publication module flow and turns it into a reusable implementation pattern so we can build similar modules faster (for example: Regulation, Policy, Notice, or Law-like features).

## 1) Purpose

Use this file as:
- The shared reference before implementation
- The checklist during implementation
- The QA baseline after implementation

Goal: keep one clear flow from UI -> API -> database -> UI refresh, with consistent multilingual behavior and file upload (attachments) handling.

---

## 2) Current Publication Module Architecture

### Main admin files

- `src/app/(admin)/publications/page.tsx`: page orchestrator (state, API calls, modals)
- `src/components/publications/PublicationTable.tsx`: list + row actions
- `src/components/publications/PublicationFilters.tsx`: search + category filter
- `src/components/publications/PublicationForm.tsx`: create/edit form (`initialPublication?`)
- `src/components/publications/AttachmentDropZone.tsx`: file upload UI (PDF/attachments)
- `src/components/publications/Toast.tsx`: local form-level toast
- `src/lib/pickTranslation.ts`: language fallback helper

### Flow diagram

```mermaid
graph TD
    A[Publications Page] --> B[Load List]
    A --> C[Open Create Modal]
    A --> D[Open Edit Modal]
    A --> E[Open View Modal]
    A --> F[Delete Item]

    B --> G[GET /api/publications]
    C --> H[POST /api/publications]
    D --> I[PUT /api/publications/:id]
    F --> J[DELETE /api/publications/:id]

    H --> B
    I --> B
    J --> B
```

---

## 3) End-to-End CRUD Flow (Publication)

The Publication flow follows the same orchestration as the Law module. Key points: a single page orchestrator handles loading and refresh, create/edit are modal-driven forms supporting multilingual translations and per-translation attachments, and list operations trigger server reloads.

### 3.1 List (Read)

1. Page mounts and ensures session/token is valid.
2. Calls `GET /api/publications`.
3. Stores result in `publications` state in the page orchestrator.
4. Applies client-side category/search filters (or server-side when pagination is added).
5. Renders filtered list in the table component.

### 3.2 Create

1. Click `New Publication`.
2. Open create modal with `PublicationForm`.
3. Fill base fields (`Category`, `PublicationDate`, optional `Authors`) and `translations[]`.
4. Optional attachment upload per translation via `AttachmentDropZone`.
5. Validate required fields (especially Khmer/default title).
6. Build multipart `FormData` with fields and files.
7. Submit `POST /api/publications`.
8. Close modal and reload list on success.

### 3.3 Edit

1. Click edit action in table.
2. Open edit modal with selected `initialPublication`.
3. Hydrate form state from existing translations and attachments.
4. Update values and optionally add/replace attachments.
5. Validate, build `FormData`, submit `PUT /api/publications/:id`.
6. Close modal and reload list on success.

### 3.4 Delete

1. Click delete action in table.
2. Confirm in modal.
3. Submit `DELETE /api/publications/:id`.
4. Reload list.

### 3.5 View Detail

1. Click publication title or view action.
2. Open view modal.
3. Show all translations, metadata (authors/date/category) and attachment links.

---

## 4) API Contract (Publication Pattern)

### Admin endpoints (protected)

- `GET /api/publications`
- `POST /api/publications`
- `PUT /api/publications/{id}`
- `DELETE /api/publications/{id}`

### Public endpoints (optional, unprotected)

- `GET /api/public/publications`
- `GET /api/public/publications/{id}`

### Multipart payload pattern

```text
Category: string
PublicationDate?: string
Authors?: string[]
Translations[0].Language: "km"
Translations[0].Title: string
Translations[0].Summary?: string
Translations[0].Content?: string
Translations[0].AttachmentFile?: File
Translations[1].Language: "en"
...
```

---

## 5) Reusable Blueprint for Any Similar Module

When creating a new module, replace `Publication` with the module name (example `Regulation`). Keep identical state and orchestration patterns to reduce bugs.

### 5.1 File/folder template

```text
src/app/(admin)/{module}/
  page.tsx

src/components/{module}/
  {Module}Table.tsx
  {Module}Filters.tsx
  {Module}Form.tsx
  {Module}EditForm.tsx   (or merge with Form using initialData?)

src/lib/
  pickTranslation.ts      (reuse)
```

### 5.2 Naming map

- `Law` -> `{Module}`
- `/api/laws` -> `/api/{module-endpoint}`
- `LawForm.*` translation keys -> `{Module}Form.*`
- `LawTable.*` translation keys -> `{Module}Table.*`

### 5.3 State contract in page orchestrator

Minimum page state:

```ts
items: ModuleItem[]
loading: boolean
error: string | null
search: string
category: string
createOpen: boolean
viewOpen: boolean
editingItem: ModuleItem | null
selectedItem: ModuleItem | null
```

### 5.4 Minimal operations

- `load()` -> list endpoint
- `handleCreated()` -> close modal + `load()`
- `handleUpdated()` -> close modal + `load()`
- `handleDelete(id)` -> delete endpoint + `load()`

---

## 6) Implementation Checklist (Copy/Paste Ready)

## Backend

- [ ] Add model + translation model (if multilingual)
- [ ] Add DTOs for create/update/list/detail
- [ ] Add mapper profile updates
- [ ] Add controller endpoints (GET/POST/PUT/DELETE)
- [ ] Add validation (required default language title, file type/size)
- [ ] Add migration and update DB

## Admin UI

- [ ] Add page orchestrator route under `src/app/(admin)/{module}/page.tsx`
- [ ] Add filters, table, create/edit form components
- [ ] Add view and delete confirmation modals
- [ ] Connect API with auth token
- [ ] Add loading, error, and empty states
- [ ] Add delete loading lock to prevent duplicate requests

## i18n

- [ ] Add translation keys in `messages/en.json`
- [ ] Add translation keys in `messages/kh.json`
- [ ] Ensure labels/errors/buttons are translated

## QA

- [ ] Create with Khmer only
- [ ] Create with Khmer + English
- [ ] Edit and replace attachment
- [ ] Delete item and verify table refresh
- [ ] Verify failed API shows meaningful message
- [ ] Verify token expiry behavior

---

## 7) Rules We Should Keep for Similar Modules

1. Default language (`km`) cannot be removed.
2. Do not submit if default language title is empty.
3. Always use multipart when file upload is possible.
4. Keep list API and form submit API separate and explicit.
5. Keep a single page orchestrator responsible for reload flow.
6. Reuse shared utilities (`pickTranslation`, common toast/modal patterns).

---

## 8) Recommended Improvements (Apply to Publication and New Modules)

1. Merge create/edit into one component with `initialData?` to reduce duplication.
2. Extract constants (`API_BASE`, category options) into shared files.
3. Prevent stale list races with `AbortController` in `load()`.
4. Add retry UI on list fetch failure.
5. Move from client-side filtering to server-side filtering when pagination is added.

---

## 9) Definition of Done for New Module

A new module is considered complete when:

- CRUD works end-to-end with authenticated APIs.
- Khmer-first multilingual rules are enforced.
- File uploads/attachments are validated and persisted.
- Admin list can search/filter reliably.
- Errors are specific and user-friendly.
- The implementation follows the same orchestration pattern as Publication.

---

If you want, I can also create a compact `module_blueprint.md` that extracts the generic parts for reuse across modules.
