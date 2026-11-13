# Current state — Admin CMS

Last consolidated: 2026-11-09. Source/configuration reviewed locally; test/build/hosted evidence is historical unless explicitly stated. No live service inspection or application test rerun occurred in this documentation task.

| Area | Implemented | Recorded tests | Deployment / uncertainty |
| --- | --- | --- | --- |
| CMS foundation | Batches; selected-batch subject/chapter/lecture management; homepage/faculty/visibility controls | Historical builds and UI inspection | Latest hosted standalone Admin deployment not established |
| Payment controls | Paid Batch, Payment Enabled, optional button ID; development-only isolated test button | September 6 build and authenticated form inspection | No successful actual purchase/button verification recorded |
| Overview editor | Validated overview_content text/lists/icons with add/remove/reorder | September 8 build and rollback-only admin/student/malformed SQL cases | Updated phone/live Admin synchronization unverified |
| Images | HTTPS URLs or JPG/PNG/WebP picker, preview, 5 MB/10,000px checks, upload status/save blocking | September 11 build/static checks and live policy predicates | Browser upload/save/display E2E pending; limits are picker-side |
| Login | getUser/profile/current-token gate, cancellation/generation guards, tab logout lock | Six combined login/upload checks recorded September 11 | Actual admin/student login/logout/refresh checks and redeployment pending |

Administrator email was changed September 11 while retaining identity/role; password was not rotated and account-wide sessions were not revoked in that task. Changing email is not remediation of exposed credentials. Shared credential retirement/session work remains open.

Cancelled form uploads and previous images may remain in Storage to avoid deleting shared references. Admin-only thumbnail write migration was recorded live; public image reads remain intentional. Overview statistics are display overrides, not real review/count analytics.

Evidence: [App gate](../src/App.tsx), [batch CMS](../src/components/BatchesCMS.tsx), [image input](../src/components/BatchImageInput.tsx), [overview editor](../src/components/BatchOverviewEditor.tsx), [tests](../tests), [shared history](../../C50-Project/main-brain/archive/root-memory-2026-11-09.md).

## Test Series synchronization — 2026-11-12

**Implemented:** Dedicated Test Series section supports create/edit, thumbnail/banner images, free/paid price settings, preview, draft/publish and removal from sale. Content opens the existing syllabus editor. Stable create IDs and a synchronous save guard prevent duplicate submissions.

**Tested / database applied:** November 12: Web TypeScript/build and 19 payment tests passed; Admin build and 6 tests passed; Android TypeScript, 39 tests and direct Metro export passed. Supabase migrations and rollback-only authorization/visibility/payment tests passed. No new hosted application deployment, native APK or physical-device test.

**Remaining:** Deploy the updated backend/web and Admin, then build/install Android and verify a real admin edit appears on both clients. Existing deployed applications do not automatically acquire these new screens. No customer content was created/published during verification. Test Series remain catalogs with learning content, not an interactive exam/scoring engine. Physical-book work is deferred.

## Razorpay completion — 2026-11-12

Implemented: Payments navigation and a read-only Supabase ledger with 50-row pagination, status/mode filters, provider IDs (including legacy fallback), customer/batch labels, amount, verification date, method and failure code. Refreshes on focus, manually and every 30 visible seconds. Existing administrator session gate and Supabase RLS enforce access; signatures/raw provider payloads are not selected. Admin TypeScript/build and 6 existing tests passed; ledger browser E2E and deployment remain pending.

[Canonical integration status and validation](../../C50-Project/main-brain/CURRENT-STATE.md). Backend credentials were configured locally only; no deployed credentials, customer payments or schema were changed. Full test-mode checkout, cancellation/failure/recovery and webhook verification remain required before release.

## Google Drive lecture notes — 2026-11-12

Implemented locally: consistent HTTPS notes-link validation across all three clients; standard Drive file links preserve file IDs and access parameters, folder/malformed links and embedded credentials are rejected. Admin retains URL/upload inputs, adds inline guidance/errors and Open link preview, blocks invalid saves and recognizes the snake-case PDF indicator. Website PDF Notes opens safely in a new tab; Drive does not use an iframe/download attribute, while direct .pdf URLs retain the reader. Android shows PDF Notes with the optional title separately and checks batch access before opening through Linking, reporting open/access errors.

Validation: Web TypeScript/build and Admin TypeScript/build passed; Admin's 6 existing tests passed; Android TypeScript and 44 tests passed, including 5 new tests for links, parameter preservation, cross-client consistency and access-before-opening/failure behavior. Headless Edge with intercepted local fixtures verified Admin edit/load, validation/preview/save/reload/PDF badge and Web Drive new-tab attributes/no iframe plus direct-PDF reader compatibility. Browser HMR websocket warnings did not block fixture checks. Live Supabase metadata confirmed the existing text notes_url/notes_title fields; no migration or content mutation. Add-new-lecture against live Supabase, actual Drive file permissions, physical-device opening and updated APK remain unverified. No deployment or real-file external opening was performed.

Limits: valid URL syntax cannot prove the target is a PDF or viewable by a student. Public Drive links can be redistributed; app enrollment checks do not secure the externally hosted file. No Drive permission changes, file copying, new tables or API contracts. Existing payment/access behavior retained. Web build still reports its pre-existing large-bundle warning.

## Session privacy — 2026-11-13

**Implemented locally:** Admin retains authoritative Auth/profile/role verification. Logout persists across reloads and same-origin tabs, clears CMS state and invalidates delayed checks. New login waits for prior sign-out; only a successful password response proceeds to independent authorization. All clients retain a persisted local logout lock when network sign-out or a subsequent login fails.

**Verified:** Admin TypeScript/production build passed. All 6 existing login/upload tests passed. Local Edge fixtures passed verified login, cross-tab offline logout, failed re-login followed by reload, and account isolation. Actual hosted authorization remains a release check.

**Release:** No deployment, Supabase configuration/schema/data change, or new APK was performed. Deploy Web/backend together, deploy Admin and rebuild Android separately. Existing custom-token website sessions must sign in again. Physical-device and real-account production checks remain pending.
