# Path B Social Content Implementation (Single File)

## Decision Summary (Recommended)

- Best option for this project now: Path B (Markdown + API + Admin publish flow).
- Why: faster delivery, lower implementation risk, simpler maintenance, and fully supports managing large bilingual content and images from Admin.
- Long-term upgrade: move editor UX to TipTap only after Path B is stable in production.
- Rule of thumb: ship Path B first, then improve editor experience without changing backend contracts.

## 1. Objective

Implement Path B so the Admin dashboard fully manages Social content (text + images), and the Landing page only renders published content from backend APIs.

This removes manual edits in frontend data files and gives a clean draft-to-publish workflow.

## 2. Why Path B is best for this project now

- Fits current stack (Admin Next.js + Backend .NET + existing module patterns).
- Faster and lower risk than introducing full WYSIWYG at first.
- Scales for large bilingual content with clear validation and publishing control.
- Keeps a clear upgrade path to richer editing later.

## 3. Target architecture

### Source of truth

- Admin dashboard is the only place where content is edited.
- Backend database stores topic/section/media/revision records.
- Frontend Landing page reads published data from public API.

### Runtime flow

1. Admin edits content and media.
2. Admin saves draft.
3. Admin publishes.
4. Backend marks content as published and triggers cache invalidation.
5. Landing page fetches latest published content and renders it.

## 4. Data model

### SocialTopic

- Id
- Slug (governance, assistance, security)
- TitleKm
- TitleEn
- SubtitleKm
- SubtitleEn
- SortOrder
- Status (Draft, Published)
- PublishedAt
- PublishedByUserId
- UpdatedAt
- UpdatedByUserId

### SocialSection

- Id
- TopicId
- ParentSectionId (nullable)
- SectionKey (stable key)
- TitleKm
- TitleEn
- ContentKm (Markdown)
- ContentEn (Markdown)
- SortOrder
- Depth
- Status (Draft, Published)
- UpdatedAt
- UpdatedByUserId

### SocialSectionMedia

- Id
- SectionId
- MediaId
- Position (Top, Bottom, Left, Right, Full)
- CaptionKm
- CaptionEn
- AltKm
- AltEn
- SortOrder

### Media

- Id
- StoragePath
- PublicUrl
- MimeType
- FileSize
- Width
- Height
- UploadedByUserId
- CreatedAt

### SocialRevision

- Id
- TopicId
- SnapshotJson
- RevisionNumber
- CreatedAt
- CreatedByUserId
- ActionType (SaveDraft, Publish, Rollback)

## 5. API design

### Admin endpoints

- GET /api/admin/social/topics
- GET /api/admin/social/topics/{topicId}
- POST /api/admin/social/topics
- PUT /api/admin/social/topics/{topicId}
- POST /api/admin/social/topics/{topicId}/publish
- POST /api/admin/social/topics/{topicId}/rollback/{revisionId}
- GET /api/admin/social/topics/{topicId}/sections
- POST /api/admin/social/topics/{topicId}/sections
- PUT /api/admin/social/sections/{sectionId}
- DELETE /api/admin/social/sections/{sectionId}
- POST /api/admin/social/topics/{topicId}/sections/reorder
- POST /api/admin/social/media/upload
- POST /api/admin/social/sections/{sectionId}/media
- DELETE /api/admin/social/sections/{sectionId}/media/{sectionMediaId}
- GET /api/admin/social/topics/{topicId}/revisions

### Public endpoints (frontend)

- GET /api/public/social/topics
- GET /api/public/social/topics/{slug}?lang=km
- GET /api/public/social/topics/{slug}?lang=en

Public endpoint rules:

- Return Published only.
- Return localized fields for requested language.
- Return section tree already ordered.

## 6. Admin dashboard flow

### Screens

1. Social Topics List

- Show status (Draft/Published), last update, quick actions.

2. Topic Editor

- Left: section tree.
- Right: section form.
- Top action bar: Save Draft, Publish, Preview.

### Section features

- Add root section
- Add child section
- Reorder section
- Duplicate section
- Delete section
- Change section status (Draft/Published)

### Section fields

- Title Khmer
- Title English
- Content Khmer (Markdown)
- Content English (Markdown)
- Parent section
- Sort order

### Image handling

For each section:

- Upload image
- Set position (top/bottom/left/right/full)
- Set alt text (km/en)
- Set caption (km/en)
- Reorder images
- Remove image

## 7. Validation and publishing rules

### Before saving draft

- Basic schema validation.
- Keep partial data allowed.

### Before publish

- Khmer required fields must be complete.
- English required/optional based on policy.
- Alt text required for images.
- No invalid ordering or broken parent references.

### On publish

- Create revision snapshot.
- Mark status Published.
- Save PublishedAt and PublishedBy.
- Trigger frontend cache revalidation.

## 8. Frontend integration plan

### Current state

Frontend Social page reads static file data.

### Target state

Frontend Social page fetches public API by topic + locale and renders response.

### Rendering rules

- Keep existing renderer style behavior where possible.
- Render section tree by sort order.
- Render markdown content safely.
- Render media by configured position.
- Use localized alt/caption.

### Caching

- Prefer on-demand revalidation from publish endpoint.
- Keep fallback revalidate interval for safety.

## 9. Migration plan from static file

1. Create DB schema and migrations.
2. Write import script from existing social content source.
3. Verify hierarchy, bilingual text, and media mapping.
4. Enable API-based rendering in frontend.
5. Keep temporary fallback until verified.
6. Remove static dependency after QA sign-off.

## 10. Roles and permissions

- Admin and SuperAdmin: full edit + publish + rollback.
- Editor: draft only (optional policy).
- Viewer: read only.

All write actions should be audit logged.

## 11. Implementation roadmap

### Phase 1: Backend foundation

- Add models, DbContext config, migrations.
- Build admin/public controllers.
- Add role authorization.

### Phase 2: Media and validation

- Add upload and section-media linking.
- Add publish validation rules.
- Add audit logs.

### Phase 3: Admin UI

- Build topics list.
- Build tree editor + bilingual markdown form.
- Build draft/publish actions.
- Build revisions and rollback view.

### Phase 4: Frontend switch

- Replace static data read with public API fetch.
- Add loading/empty/error states.
- Add revalidation flow.

### Phase 5: Launch

- Import existing content.
- Validate km/en output.
- Test publish, rollback, media rendering.
- Remove static content path.

## 12. Go-live checklist

- Authorization tested for Admin and SuperAdmin.
- Draft and publish flow tested.
- Revisions and rollback tested.
- Frontend revalidation confirmed.
- Khmer and English QA approved.
- Monitoring/logging enabled for social endpoints.

## 13. Future upgrade path (optional)

After Path B is stable, you can upgrade editor UX to TipTap without changing overall architecture by replacing only the section content editor while keeping the same API and publish workflow.

## 14. Step-by-step execution playbook (what to do now)

Follow these steps in order. Do not start Landing page API rendering until Step 8.

### Step 1: Freeze scope and acceptance criteria

Actions:

- Confirm v1 topics: governance, assistance, security.
- Confirm language policy for publish: Khmer required, English required or optional.
- Confirm image policy: allowed types, max size, required alt text.
- Confirm revalidation environment setup and shared secret key name/value strategy between Backend and Frontend (for example REVALIDATE_SECRET).

Deliverables:

- Approved scope checklist.
- Approved validation policy.

Done when:

- Team agrees what can block publish.

### Step 2: Add backend entities and enums

Actions:

- Create models for SocialTopic, SocialSection, SocialSectionMedia, SocialRevision.
- Add enums for TopicStatus and ImagePosition.
- Add base audit fields consistent with existing project style.

Deliverables:

- Compiling model classes.

Done when:

- Backend builds with new entities.

### Step 3: Configure DbContext and relationships

Actions:

- Register DbSet properties in ApplicationDbContext.`
- Configure section self-reference (ParentSectionId).
- Configure topic to sections and section to media relationships.
- Add unique and performance indexes (slug, sort order, status).

Deliverables:

- Entity configuration added and reviewed.

Done when:

- No relationship or key configuration warnings.

### Step 4: Create and apply migration

Actions:

- Generate migration for new social tables.
- Review migration SQL for constraints and cascade behavior.
- Apply database update in local environment.

Deliverables:

- Migration files committed.
- Database schema updated.

Done when:

- New social tables exist and foreign keys are correct.

### Step 5: Build DTOs and mapping profile

Actions:

- Create admin request and response DTOs for topics, sections, media, revisions.
- Create public response DTOs for localized frontend render.
- Add mapping layer (AutoMapper or manual projection), consistent with existing project pattern.

Deliverables:

- Stable API contracts for admin and public routes.

Done when:

- Controllers can return DTOs without manual object shaping.

### Step 6: Implement admin APIs

Actions:

- Add admin controller routes for topic CRUD, section CRUD, reorder, media attach/remove.
- Add publish, rollback, and revisions endpoints.
- Add role authorization for Admin and SuperAdmin.

Deliverables:

- Working admin endpoints.

Done when:

- Postman or Swagger checks pass for all admin routes.

### Step 7: Implement public APIs for frontend

Actions:

- Add public routes for topic list and topic detail by slug and lang.
- Return only published records.
- Return ordered section tree and localized fields.

Deliverables:

- Frontend-consumable read endpoints.

Done when:

- Public responses are stable for both km and en.

### Step 8: Build admin Social UI

Actions:

- Create Social topic list page with status and action buttons.
- Create topic editor with section tree + form panel.
- Add bilingual markdown fields and section reorder actions.
- Add save draft, publish, preview, rollback UI actions.

Deliverables:

- End-to-end content editing from admin UI.

Done when:

- Non-developer can create, edit, and publish text content. Image flow is completed in Step 9.

### Step 9: Add image upload and section image management

Actions:

- Confirm storage target (local disk) before implementing upload service.
- Add image upload UI and backend upload integration.
- Add per-image position, alt text km/en, caption km/en, sort order.
- Add client and server validation for files.

Deliverables:

- Complete image management flow in admin.

Done when:

- Published images render correctly with localized metadata.

### Step 10: Add publish validation and audit logs

Actions:

- Enforce publish-time completeness rules.
- Save revision snapshot on publish and rollback actions.
- Write audit entries for create/update/delete/publish actions.

Deliverables:

- Reliable governance and traceability.

Done when:

- Invalid content cannot be published and changes are traceable.

### Step 11: Import existing static social content

Actions:

- Build one-time import script from current social content source.
- Map nested sections and media to database structure.
- Verify Khmer and English values after import.

Deliverables:

- Database seeded with current production-equivalent content.

Done when:

- Imported topic output matches current site content.

### Step 12: Switch Frontend Social page to API mode

Actions:

- Replace static content read with public API fetch.
- Keep current renderer behavior and map API payload to renderer input.
- Add loading, empty, and error states.

Deliverables:

- Frontend Social page reading live published data.

Done when:

- New publish actions are visible on Landing page.

### Step 13: Add cache revalidation hook

Actions:

- Trigger frontend revalidation when publish completes.
- Keep a fallback revalidate interval for resilience.

Deliverables:

- Predictable content freshness after publish.

Done when:

- Publish updates appear without manual redeploy.

### Step 14: QA and release

Actions:

- Run bilingual content QA for all topics.
- Run authorization tests for Admin and SuperAdmin.
- Run regression tests for existing modules.
- Remove old static dependency after sign-off.

Deliverables:

- Production-ready rollout.

Done when:

- Team signs off and social content changes happen only in admin dashboard.

## 15. Fast start checklist (first 3 working days)

### Day 1

- Complete Step 1 to Step 3.
- Start Step 4 migration generation.

### Day 2

- Finish Step 4 and Step 5.
- Implement Step 6 admin APIs (topic and section CRUD first).

### Day 3

- Finish Step 6.
- Complete Step 7 in the morning.

### Day 4

- Start Step 8 admin UI skeleton (topics list and editor layout).

If this schedule is blocked, do not move to frontend integration. Unblock backend contracts first.
