import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultAppPromotion, validateAppPromotion, validStoreUrl } from '../src/lib/appPromotion.ts';
test('Admin promotion validation and save/reload serialization', () => {
  const p = defaultAppPromotion(); p.visible = false; p.google_play = { status: 'available', url: 'https://play.google.com/store/apps/details?id=com.example.app' };
  assert.equal(validateAppPromotion(p), null);
  assert.deepEqual(JSON.parse(JSON.stringify(p)), p);
  p.google_play.url = ''; assert.ok(validateAppPromotion(p));
  assert.equal(validStoreUrl('https://a:b@apps.apple.com/app/id123', 'app_store'), false);
});
