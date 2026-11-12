# Architecture — Admin CMS

Last consolidated: 2026-11-09. Source/configuration reviewed locally; test/build/hosted evidence is historical unless explicitly stated. No live service inspection or application test rerun occurred in this documentation task.

Standalone Vite/React static app with authenticated shell and Batches, Syllabus and Homepage CMS views. Selecting Content on a batch passes its ID into the syllabus editor. A separate legacy embedded web Admin exists; this folder documents the standalone panel.

## Authorization

Supabase Auth supplies session identity. App verifies server user, profile admin role and matching current token before showing CMS. Generation guards, cancellation/timeouts and deferred auth/visibility checks reject stale results. Logout locks the panel immediately for the tab and signs out locally. This does not revoke all sessions. Database/Storage policies remain authoritative against direct client requests.

## Data flow

CMS → authenticated Supabase SDK → batches/subjects/chapters/lectures/homepage_settings and Storage. Database snake_case is mapped to UI types. Editor drafts are not published until save; uploaded files can exist before save. Payment settings are metadata, never authority to mark payments successful or insert paid enrollment.

Batch overview uses shared validated overview_content JSONB, bounded plain text/lists and allowed icons. Mobile reads on focus/foreground/pull and active polling. Price/free/payment fields remain distinct from cosmetic captions/statistics. Image uploads use unique non-overwriting paths, admin precheck and public URLs; picker validation is not a bucket-wide guarantee.

[Shared architecture](../../C50-Project/main-brain/ARCHITECTURE.md) owns schema/auth/payment/storage contracts. [Batch overview runbook](../../c50-mobile/docs/batch-overview-cms.md) owns editing details. [Admin session helper](../src/lib/adminSession.ts), [types](../src/types.ts), and [Supabase client](../src/lib/supabaseClient.ts) are local evidence.

Never add secret/service-role keys to the static client. Actual paid-media protection must be implemented at the storage/provider boundary, not only in CMS/player visibility.

## Test Series integration — 2026-11-12

Dedicated Test Series section supports create/edit, thumbnail/banner images, free/paid price settings, preview, draft/publish and removal from sale. Content opens the existing syllabus editor. Stable create IDs and a synchronous save guard prevent duplicate submissions.

Shared schema, catalog visibility, role policies and purchase/access rules are canonical in [Web/backend architecture](../../C50-Project/main-brain/ARCHITECTURE.md). Removal only sets catalog visibility false. Enrolled students retain their existing learning access; direct enrollment writes are blocked and clients use the shared authenticated backend. No new exam-attempt or results schema is introduced.

## Payment synchronization — 2026-11-12

Follow the [canonical payment contract](../../C50-Project/main-brain/ARCHITECTURE.md). Web and direct Android share the backend purchase ledger and Supabase enrollments. The standalone Admin Payments view reads those records with administrator RLS, pagination and refresh. No client possesses the Razorpay secret; no parallel client-owned payment status writes were added.
