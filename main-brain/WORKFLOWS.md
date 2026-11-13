# Workflows — Admin CMS

Last consolidated: 2026-11-09. Source/configuration reviewed locally; test/build/hosted evidence is historical unless explicitly stated. No live service inspection or application test rerun occurred in this documentation task.

## Develop and verify

From admin-panel: npm ci; configure ignored public values using [.env.example](../.env.example); npm run dev (normally port 5173), npm run lint, npm run build. Existing tests use Node's test runner: node --experimental-strip-types --test tests/login-security.test.mjs tests/image-upload.test.mjs on a compatible Node runtime. There is no npm test script. Lint historically had HomepageCMS/SyllabusCMS warnings; do not claim a fresh pass without running it.

## Content operations

Login as authorized admin → select batch → edit metadata/overview or Content → subject → chapter → lecture. Validate draft, save, then refetch on Web/Android. Homepage CMS manages faculty/images and visibility sections. Batch title/banner/thumbnail/overview changes should be checked on a small phone with large text. Use truthful display stats. See [editing details](../../c50-mobile/docs/batch-overview-cms.md).

Images: choose HTTPS URL or valid JPG/PNG/WebP file; wait for upload before saving/closing. Confirm saved-image display in both clients. Cancellation can leave uploaded objects; do not bulk-delete old objects without reference checks. Lecture/PDF uploads are separate from the batch-image picker.

## Payment metadata

Configure paid/free, effective positive price and payment_enabled deliberately. Optional button ID is an administrative reference. The development-only static test button does not grant access. Verify its mode/amount in the provider dashboard before testing. Real purchase follows [shared payment workflow](../../C50-Project/docs/payments.md). Never accept a UI toggle as proof of successful payment validation.

## Release and access checks

Build the static site and deploy to the existing intended host after confirming its URL/settings; exact host not established in current records. Where Express requests are used, ensure that host's exact origin is configured. Record deployed revision/date and check real admin login/logout/refresh, student denial, stale in-flight auth rejection, file upload/save, and cross-client display. Local-scope logout does not replace global credential/session remediation.

Routine CMS edits can affect shared live content. Use approved content and controlled tests; do not publish sample changes merely to verify documentation.

## Test Series workflow — 2026-11-12

1. In standalone Admin open Test Series → Add Test Series. Enter metadata/images and free or paid settings. New series start unlisted; use Preview to inspect metadata. Save keeps a stable row ID.
2. Use Content to configure existing subjects/chapters/lectures/attachments. Publish with the catalog checkbox when ready. For paid series, set a positive price and explicitly enable payments. Do not use public files for confidential paid content without addressing the existing shared media-security gap.
3. Website desktop/mobile navigation and Android Test Series display the same records. Both customer catalogs refresh on entry/foreground/manual refresh and every 30 seconds while active (Android also requires focus). Verify free/paid filters and loading/error/empty states.
4. Remove from sale to hide a series and prevent new purchases. Existing students keep access in their learning dashboard; payment/enrollment records are preserved. Edit and recheck the catalog checkbox to republish. Do not delete database rows to remove a listing.
5. Test one free and one paid series with controlled accounts: student/Admin permissions, duplicate submits, withdrawn discovery, retained access and delayed capture. Supabase verification used rolled-back fixtures; actual user/payment/device E2E is still pending.
6. Deploy backend/web and Admin before expecting the UI to appear on hosted services. Build a fresh Android APK and test both themes; a Metro export is not an APK or a release.

## Payment verification — 2026-11-12

Follow the [updated checkout test/deployment procedure](../../C50-Project/docs/payments.md). Check the same student purchase on website, direct Android and Admin Payments; pending/cancelled payments cannot grant access. Local checks passed as recorded in CURRENT-STATE; hosted deployment and actual payment/webhook/device tests remain outstanding.

## Per-lecture Google Drive PDF notes — 2026-11-12

In Admin → Batch Content Manager, select batch, subject and chapter, then add/edit a lecture. Paste a Drive PDF file-sharing URL into Notes PDF URL / Drive Link, optionally set Notes Title, use Open link to confirm the file and viewing permissions, then save. Alternatively retain Upload Note to Supabase. Folder links and non-HTTPS/credential-bearing URLs cannot be saved through this form. A valid link is not proof of PDF content or student access.

Reopen the lecture to verify its saved link and PDF indicator. On the website open the lecture's Notes tab → PDF Notes; Drive opens in a new tab, while direct PDFs also retain the reader. On Android open the lecture → PDF Notes; entitlement is checked before opening the external handler. Drive may require a Google account with permission. Public sharing allows anyone with the link to view; do not treat that as private paid-content delivery. Publish/deploy updated applications and rebuild Android separately from saving content.

## Session privacy — 2026-11-13

Release Web and backend together: the new frontend needs GET /api/auth/me, and the backend rejects legacy tokens/endpoints. Verify fresh confirmed-user login, reload, account switch, offline sign-out then failed login/reload, cross-tab logout (Web/Admin), browser Back and Android foreground/back behavior. Check profiles, purchases and CMS drafts from account A never appear for B or on login. Browser-managed password autofill is outside app cache control. No deployment, Supabase configuration/schema/data change, or new APK was performed. Deploy Web/backend together, deploy Admin and rebuild Android separately. Existing custom-token website sessions must sign in again. Physical-device and real-account production checks remain pending.
