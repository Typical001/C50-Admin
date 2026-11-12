# Roadmap — Admin CMS

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
