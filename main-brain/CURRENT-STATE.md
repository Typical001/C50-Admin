# Current state — Admin CMS

## Premium Notes and expandable Study Spaces — 2026-11-18

Implemented: individual/bundle catalog, external Buy/form workflow, per-account Pending/Purchased/Rejected states, manual Admin review with decision history and separate delivery status. Android Study Spaces now has Show more/Show less instead of horizontal scrolling. The external Buy button is included in the Play/AAB variant by explicit user request; no Play-program eligibility or publication approval is claimed. Existing batch payments are unchanged.

Tested: Web/Android TypeScript; Web/Admin production builds; Admin lint (pre-existing unrelated warnings); 36 backend payment/session/Google/notes tests and 44 Android tests. The follow-up audit-grant fix also passed the 25-test payment/notes and six-test session suites. Browser fixtures verified 1440/768/360 layouts, external opener isolation, Pending/reopen, Admin approval/customer refresh, editing/save/reload, empty/error/retry and failed-load save lock. No live purchase or form submission was made.

Supabase: both additive migrations applied; local filenames reconciled with hosted migration versions 20261118082723 and 20261118125532. Three protected tables, no public/client direct access or RPC execution; service-role audit UPDATE/DELETE revoked and INSERT retained. Products and requests remain empty.

Built: production AAB versionCode 6, EAS build a4a12973-bace-483d-8fee-ab6d354bb2c6 (FINISHED). Local artifact: c50-mobile/dist/Carrier50-v6-premium-notes.aab. Archive inspection confirmed Premium Notes, Pending status and expected public Supabase URL/key. EAS production public variable names EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY were explicitly configured for reproducible future builds; values are not recorded here. AAB build success is not device verification or Play publication.

Release checkpoint: Web/backend revision 266a6cc54a28ff8616fcc9d0c4277a4c1d9cdcbb pushed and hosted rollout observed: asset index-DE48gmpx.js contains Premium Notes; anonymous catalog returns HTTP 200 with an empty array and no-store; own-request and both Admin read routes return HTTP 401 without login. Render dashboard deployment ID was not inspected. Admin revision 356662ac10bd9a749fae687fecb9f2809f0c0a88 pushed; hosted asset index-BwDqKVye.js contains Premium Notes controls. Signed-in hosted Admin save/reload is not claimed. Actual product/form configuration, physical-device acceptance, external seller/payment matching and Play publication remain outstanding.

[canonical Premium Notes runbook](../../C50-Project/docs/premium-notes.md)


## Google Play Billing rollout — 2026-11-15

Implemented locally: Android native Play checkout/restore with store prices; backend account-bound Google verification and post-commit acknowledgement; shared cross-provider access; Admin immutable product mapping and provider-labelled ledger; Web ledger provider display. Razorpay remains the website/direct-APK provider.

Applied: Supabase migrations 20261115062543 and 20261115062749. Google tokens/account bindings are server-only; current two paid-batch mappings remain disabled. Tested: Web TypeScript/build, 21 payment + 6 session regressions, 2 Google/isolated SQL tests; Admin lint (existing warnings) and build; Android TypeScript + 44 tests.

Not complete: Google Cloud/Play credentials, RTDN/scheduler configuration, product activation, verified AAB upload/Internal release, physical-device acceptance, Google financial totals/refund catch-up and production release. EAS build cda43959-bd39-4a2b-abf2-88fc12678c27 (version code 5) finished successfully and was uploaded to a saved Internal testing draft; not released to testers or production. No real charge or production Play release. See [shared runbook](../../C50-Project/docs/google-play-billing.md).


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


## Homepage app promotion — 2026-11-14

Implemented: Homepage CMS now edits the app promotion visibility, text, phone labels and per-store Hidden/Coming Soon/Available state. Available links require HTTPS store listing URLs without credentials. The unfinished email subscription section is removed. Failed Admin settings loads block saving and offer Retry. Both stores default to Coming Soon with no links. Supabase migration applied November 14; hosted Web and Admin rollout verified; see release evidence below.


### Hosted release evidence — 2026-11-14

Verified live November 14, 2026: Web revision cc5e8d4991e7065d2c1338f38f5c562361f7057c (feature commit fd824c4e821ec4ccaabec9923f813a4d220953b5), Render deploy dep-dbsabanf3r2c73e6i3ng; Admin revision 27aee7ed18845a86845d776362ba4bb54ef1b608, Netlify deploy 6af8a55f2655a2dd680a6336. Supabase migration version 20261114071849 is applied and matches the local migration filename. Public /health and /api/homepage returned 200; homepage GET has no-store and safe Coming Soon defaults, and unauthenticated PUT returned 401. Hosted Admin displayed the new controls, saved unchanged settings successfully and reloaded them; the database content fingerprint excluding updated_at was unchanged. Public page inspection confirmed promotion content and no subscription form. Real store listing URLs remain unset; no sample links or content were published. No Android change/build required.

## Google Play configuration progress — 2026-11-16

Render environment-update deployment dep-dbt9l7c9v7es73a055ng succeeded at revision 361815c557478fcc9b0c6e5b399ac796783f35dc. The GOOGLE_APPLICATION_CREDENTIALS variable and google-play-verifier.json secret filename are present; credential contents were not displayed. Google API authentication remains to be checked from the server.

After explicit approval, the verifier service account is Active in Play Console with Carrier50-only read, financial and order-management permissions (no Admin/release grants). Cloud Pub/Sub API is enabled and the c50-play-purchases topic exists. Both batch products are saved as India-only Buy drafts, Test 1 INR 2499 and Test Batch INR 50; Google bulk price rounding was corrected before saving. Notification subscription, publisher grant, RTDN configuration and scheduled reconciliation are not yet complete. Product mappings and checkout remain disabled.

User changed the release target to production on November 16. This supersedes the earlier Internal-only release authorization; it does not establish production readiness or a completed submission. No real charge has been made. Supplied financial-account details are not stored in project documentation.

Local validation today: Web TypeScript/build, 21 payment tests, 6 session tests and 3 Google/SQL tests passed. Admin lint/build passed with existing lint warnings. Financial-total changes are local and not deployed yet. The local migration file for already-applied 20261115144004 has been restored and tested in isolated PGlite. Physical-device purchase/restore/refund acceptance remains outstanding.

## Google Play rollout checkpoint — 2026-11-16 17:10 IST

Supersedes earlier November 15/16 setup-pending observations. Production is the user-authorized target. Version 5 is saved as a production draft, not submitted or live; physical-device payment/restore acceptance is outstanding. Both India-only Buy products remain drafts and checkout/mappings remain disabled.

The dedicated verifier has Carrier50-only read, financial and order-management permissions. Render revision d61a1bf86d970fced916d2c94ae8cd308cbac2a5 is deployed (dep-dbtelij2o0lc73ejn3l0). Its read-only Google purchase API authentication PASSED at 17:07 IST, resolving the earlier 401 permissionDenied observation without broadening access. No purchase or charge was created. Financial-total code is deployed in Web; Admin commit 4975f8d was pushed, but its exact hosted revision is not yet established.

Pub/Sub topic, authenticated push subscription, topic-only Google publisher grant and Play RTDN settings are configured. Full test-notification delivery confirmation remains to be recorded. Scheduled reconciliation is enabled every ten minutes. A manual invocation reached the deployed backend with HTTP 200 on an empty Google purchase ledger; this verifies transport/authentication, not real-purchase processing.

Migrations 20261116112806, 20261116112940 and 20261116113506 are applied. Managed pg_net grants could not be restricted by postgres; the final transport uses synchronous http directly, never placing the Vault credential in the net queue. The unused queue log contains zero requests. Private run logs retain only time/status; client roles cannot invoke the Vault validator or access the private schema. Do not revert to the older queued transport.

Validation rerun: Web TypeScript/build passed (existing large-bundle warning); 31 focused tests passed: 4 Google/SQL/reconciliation, 21 payment and 6 session/mobile-session tests. No Android rebuild or device acceptance was performed in this continuation. Security advisor reports expected private-table no-policy notices plus existing access-helper and leaked-password-protection warnings; no claim of a clean full security audit.

Remaining: notification delivery proof, product option review/activation, controlled device acceptance, exact Admin hosted verification and production submission. Partial-refund reporting, stale financial snapshots and voided-purchase catch-up remain operational follow-ups.


### Later November 16 verification

Google RTDN test reception was confirmed in Render with the sanitized authenticated-test acceptance log. Reconciliation now has 40 HTTP-200 runs, all while the Google purchase ledger is empty. Both India-only Buy options are active at INR 50 and INR 2499 with multi-quantity disabled. Version 5 is saved in Publishing overview for production: no blocking validation errors, one missing-deobfuscation-file warning; not submitted yet. Hosted Admin bundle index-DA-FEKlX.js contains the Google total/currency fields and mapping editor, though exact Netlify deployment revision has not been checked.

Added a tester-only exception to the disabled checkout gate, using authenticated user IDs already configured in GOOGLE_PLAY_TESTER_USER_IDS. This allows controlled acceptance without exposing checkout to other users. Five Google tests and fresh TypeScript/build passed; prior 31-test suite results remain separately dated. User supplied a confirmed student account for acceptance. License-test setup and physical-device purchase/restore checks are in progress.


### Device acceptance handoff — 2026-11-16

Web/backend revision 1469d2b075a538060591f6d265752bb9f5610cfe is Live on Render, deployment dep-dbtke34i67rs7391pghg, with the tester identifier configured. Public GOOGLE_PLAY_BILLING_ENABLED was verified false; only the selected confirmed student account bypasses the rollout gate. Both exact batch/product mappings are enabled. Google Console saved the dedicated license-test list and added it to the existing active Internal v5 track. This is a no-charge acceptance step, not a change of the production release target. Install through https://play.google.com/apps/internaltest/4701625687672221084 using the configured Google account, then sign into the configured C50 student account. Use only the Google test payment method; do not make a real charge.

Production version 5 is saved in Publishing overview, awaiting submission. Submission and global checkout activation remain outstanding until device purchase/restore and website/Admin access evidence is recorded. No new Android build, real purchase, payout change or manual enrollment was made. Normal Render build command was restored. Latest source tests: five Google tests, Web TypeScript/build passed; previous 31-test suite passed before the tester-gate edit. Main Brain updates after the final hosted verification are local documentation records, not a further deployed application revision.
