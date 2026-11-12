# Decisions — Admin CMS

Last consolidated: 2026-11-09. Source/configuration reviewed locally; test/build/hosted evidence is historical unless explicitly stated. No live service inspection or application test rerun occurred in this documentation task.

| Decision | Reason / consequence |
| --- | --- |
| Retain standalone CMS and existing shared database | No new admin backend or duplicate content store |
| Verify server identity/profile/current token before CMS | Prevent stale or client-forged authorization; RLS remains authoritative |
| Immediate tab lock with local-scope logout | UI closes promptly; global revocation remains separate |
| Structured overview JSONB | Editable mobile content without arbitrary executable content |
| Safe unique upload paths, retain prior/shared images | Avoid overwrites and broken references; orphan cleanup is explicit future work |
| Picker-side file limits | Shared bucket settings were not changed for unrelated upload flows |
| Static payment button is isolated and development-only | It cannot bind a secure user/batch entitlement |

Source/evidence: [architecture](ARCHITECTURE.md), [current state](CURRENT-STATE.md), [shared history](../../C50-Project/main-brain/archive/root-memory-2026-11-09.md).

## Test Series decisions — 2026-11-12

User selected catalog synchronization only and removal that preserves existing access. Reuse one Supabase batch row per series rather than creating competing catalogs. Keep exam category independent from the reserved Test Series tag; recognize historical category/custom-tag markers. Use a separate listed-for-sale flag, not `is_active`, because the latter gates learning access. New series start as drafts until the Admin explicitly publishes them. All new enrollments go through the existing authenticated server API; browser/mobile clients cannot insert enrollment rows directly. Existing course purchase restrictions in Play remain unchanged.
