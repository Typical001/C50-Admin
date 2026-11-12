# Changelog — Admin CMS

Historical entries below are consolidated summaries, not newly executed work. Full sanitized records are in [archive](archive/README.md). Append future entries with change, rationale, validation, deployment outcome and remaining work.

## Undated historical work

Standalone batch/syllabus/homepage CMS, faculty uploads, FAQ toggles, batch mapping and video embed fixes recorded.

## 2026-09-06

Paid Batch/Payment Enabled/button reference controls and isolated development-only test button implemented; build and authenticated controls inspected.

## 2026-09-08

Overview JSONB editor with add/remove/reorder controls; Admin build and rollback-only role/content checks recorded.

## 2026-09-11 uploads

Validated thumbnail/banner picker and live admin-only Storage write migration recorded. Actual browser upload/display E2E pending.

## 2026-09-11 login

Demo credential display removed, authorization/logout race guards added and administrator email changed; six regression checks recorded. Password rotation/global revocation pending.

## 2026-11-09

Main Brain created from shared historical evidence and local source. No CMS deployment or live content mutation performed.

## 2026-11-09 — Documentation validation

Confirmed all 24 required Main Brain documents across three apps. Checked 51 Markdown files for local link targets: no broken links. Credential-pattern scan found no matches for known historical seeded passwords, JWTs, long Supabase key values, recovery-token values or private-key headers. Historical credentials were redacted before archiving; this does not rotate credentials or sanitize Git history. Commands and dependency ranges were read from local manifests; application tests were not rerun for this documentation-only change. No application code, database, credentials or deployment settings changed.

## 2026-11-12 — Test Series catalog synchronization

Dedicated Test Series section supports create/edit, thumbnail/banner images, free/paid price settings, preview, draft/publish and removal from sale. Content opens the existing syllabus editor. Stable create IDs and a synchronous save guard prevent duplicate submissions.

Removal uses `catalog_visible=false`, retaining `is_active`, enrolled access, content and payments. Existing series markers are recognized without copying rows; canonical Test Series tags preserve other tags. Paid/free access type and active status cannot be changed after enrollment/payment records exist; this avoids invalidating previous purchases. Pending verified payments can still finalize after withdrawal.

November 12: Web TypeScript/build and 19 payment tests passed; Admin build and 6 tests passed; Android TypeScript, 39 tests and direct Metro export passed. Supabase migrations and rollback-only authorization/visibility/payment tests passed. No new hosted application deployment, native APK or physical-device test.

Applied migrations: `20261112050742_test_series_catalog_visibility`, `20261112050911_scope_batch_admin_read_policy`, `20261112051122_server_owned_enrollment_creation`. Local filenames were aligned with the recorded remote migration versions after CLI creation and MCP application. Direct enrollment inserts are denied; supported clients continue through the authenticated Express free-enrollment endpoint and server-only paid finalizer.

Validation found and corrected an existing anonymous catalog policy calling a non-anonymous admin function. Admin upload regression assertion was updated for the stronger synchronous save guard. Existing Web bundle-size warning remains. No credentials changed, no real charges initiated, no users deleted and no test fixtures retained.

## Razorpay completion — 2026-11-12

Implemented: Payments navigation and a read-only Supabase ledger with 50-row pagination, status/mode filters, provider IDs (including legacy fallback), customer/batch labels, amount, verification date, method and failure code. Refreshes on focus, manually and every 30 visible seconds. Existing administrator session gate and Supabase RLS enforce access; signatures/raw provider payloads are not selected. Admin TypeScript/build and 6 existing tests passed; ledger browser E2E and deployment remain pending.

[Canonical integration status and validation](../../C50-Project/main-brain/CURRENT-STATE.md). Backend credentials were configured locally only; no deployed credentials, customer payments or schema were changed. Full test-mode checkout, cancellation/failure/recovery and webhook verification remain required before release.

## Google Drive lecture notes — 2026-11-12

Implemented locally: consistent HTTPS notes-link validation across all three clients; standard Drive file links preserve file IDs and access parameters, folder/malformed links and embedded credentials are rejected. Admin retains URL/upload inputs, adds inline guidance/errors and Open link preview, blocks invalid saves and recognizes the snake-case PDF indicator. Website PDF Notes opens safely in a new tab; Drive does not use an iframe/download attribute, while direct .pdf URLs retain the reader. Android shows PDF Notes with the optional title separately and checks batch access before opening through Linking, reporting open/access errors.

Validation: Web TypeScript/build and Admin TypeScript/build passed; Admin's 6 existing tests passed; Android TypeScript and 44 tests passed, including 5 new tests for links, parameter preservation, cross-client consistency and access-before-opening/failure behavior. Headless Edge with intercepted local fixtures verified Admin edit/load, validation/preview/save/reload/PDF badge and Web Drive new-tab attributes/no iframe plus direct-PDF reader compatibility. Browser HMR websocket warnings did not block fixture checks. Live Supabase metadata confirmed the existing text notes_url/notes_title fields; no migration or content mutation. Add-new-lecture against live Supabase, actual Drive file permissions, physical-device opening and updated APK remain unverified. No deployment or real-file external opening was performed.

Limits: valid URL syntax cannot prove the target is a PDF or viewable by a student. Public Drive links can be redistributed; app enrollment checks do not secure the externally hosted file. No Drive permission changes, file copying, new tables or API contracts. Existing payment/access behavior retained. Web build still reports its pre-existing large-bundle warning.
