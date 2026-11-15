# Roadmap — Admin CMS

## Google Play Billing rollout — 2026-11-15

Implemented locally: Android native Play checkout/restore with store prices; backend account-bound Google verification and post-commit acknowledgement; shared cross-provider access; Admin immutable product mapping and provider-labelled ledger; Web ledger provider display. Razorpay remains the website/direct-APK provider.

Applied: Supabase migrations 20261115062543 and 20261115062749. Google tokens/account bindings are server-only; current two paid-batch mappings remain disabled. Tested: Web TypeScript/build, 21 payment + 6 session regressions, 2 Google/isolated SQL tests; Admin lint (existing warnings) and build; Android TypeScript + 44 tests.

Not complete: Google Cloud/Play credentials, RTDN/scheduler configuration, product activation, verified AAB upload/Internal release, physical-device acceptance, Google financial totals/refund catch-up and production release. Build cda43959-bd39-4a2b-abf2-88fc12678c27 (version code 5) requested; outcome pending. No real charge or production Play release. See [shared runbook](../../C50-Project/docs/google-play-billing.md).


Last consolidated: 2026-11-09. Source/configuration reviewed locally; test/build/hosted evidence is historical unless explicitly stated. No live service inspection or application test rerun occurred in this documentation task.

| Priority | Work | Acceptance evidence |
| --- | --- | --- |
| P0 shared | Rotate exposed admin password/revoke sessions | Old credentials/sessions denied; intended admin works; no secrets recorded |
| P1 | Deploy current CMS | Confirm actual host/revision and required origin settings |
| P1 | Real authorization E2E | Admin allowed; student denied; logout/refresh/account changes do not restore stale CMS |
| P1 | Upload and content synchronization | Valid image saves/displays Web/Android; invalid files rejected; approved overview edits refresh on phone |
| P1 shared | Payment support/reconciliation | Confirm current ledger UI coverage and define operator workflow before implementing missing controls |
| P2 | Storage lifecycle | Decide reviewed orphan cleanup retaining all referenced/shared assets |

[Shared roadmap](../../C50-Project/main-brain/ROADMAP.md) owns paid media, external payment validation and credential retirement. Admin UI completion is not proof of hosted deployment or actual file upload success.

## Test Series acceptance — 2026-11-12

- Implemented and locally verified: dedicated management, free/paid catalog display, refreshed shared records, removal preserving student access and transaction history.
- Supabase applied and tested: visibility/validation/write guards and role policies; test transactions rolled back.
- Pending release: updated web/backend and standalone Admin deployment, new Android APK, device/browser admin-create/edit/publish/remove journeys and actual Razorpay/provider E2E. Interactive tests/timers/results are outside this catalog task.

## Razorpay acceptance update — 2026-11-12

- Implemented locally: existing Standard Checkout completed with minimum 100 paise, shared payment persistence and standalone Admin payment ledger; no duplicate checkout subsystem.
- Checks passed as recorded in CURRENT-STATE. No new hosted deployment or Android build.
- Remaining: deploy backend/Web and Admin, configure matching server-only Razorpay credentials and webhook secret, confirm automatic capture and webhook delivery, rebuild direct APK and verify success/cancellation/failure/restart/account-switch end to end. Confirm exactly one purchase/enrollment after repeated callback/webhook, cross-client access and Admin pagination/filter behavior. Keep test and live records distinguishable. Complete dependency-advisory triage before rollout.

## Drive notes acceptance — 2026-11-12

Local implementation/builds, link-contract tests and browser fixture edit/save/reload/open-link checks complete. Pending: deploy Web/Admin, rebuild Android, verify a real per-lecture PDF with student Drive permissions and device handler, and exercise live authorized Admin add/save/reload. No database migration required. Public-link redistribution remains outside enrollment protection.

## Session privacy — 2026-11-13

Implemented: Admin retains authoritative Auth/profile/role verification. Logout persists across reloads and same-origin tabs, clears CMS state and invalidates delayed checks. New login waits for prior sign-out; only a successful password response proceeds to independent authorization.

Local evidence: Admin TypeScript/production build passed. All 6 existing login/upload tests passed. Local Edge fixtures passed verified login, cross-tab offline logout, failed re-login followed by reload, and account isolation. Actual hosted authorization remains a release check.

Pending acceptance: coordinated release, real confirmed-account login/recovery, offline logout/restart, account-switch and Android device checks. Supabase working confirmation/catalog settings were left unchanged; user reported these working before this change.


## Homepage app promotion — 2026-11-14

Completed locally: app promotion editing/rendering, store validation, section hiding, load-failure save protection and hidden subscription form. Supabase migration and rollback-only authorization/save/reload checks passed. Local builds, 11 Web homepage/session tests, 21 payment tests and 1 Admin promotion test passed. Completed hosted: Web/Admin release and authenticated Admin unchanged-save/reload. Remaining: actual store URLs when available. No Android build required.


### Hosted release evidence — 2026-11-14

Verified live November 14, 2026: Web revision cc5e8d4991e7065d2c1338f38f5c562361f7057c (feature commit fd824c4e821ec4ccaabec9923f813a4d220953b5), Render deploy dep-dbsabanf3r2c73e6i3ng; Admin revision 27aee7ed18845a86845d776362ba4bb54ef1b608, Netlify deploy 6af8a55f2655a2dd680a6336. Supabase migration version 20261114071849 is applied and matches the local migration filename. Public /health and /api/homepage returned 200; homepage GET has no-store and safe Coming Soon defaults, and unauthenticated PUT returned 401. Hosted Admin displayed the new controls, saved unchanged settings successfully and reloaded them; the database content fingerprint excluding updated_at was unchanged. Public page inspection confirmed promotion content and no subscription form. Real store listing URLs remain unset; no sample links or content were published. No Android change/build required.
