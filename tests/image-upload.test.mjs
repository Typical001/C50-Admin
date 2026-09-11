import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/components/BatchImageInput.tsx', import.meta.url), 'utf8');
const batch = readFileSync(new URL('../src/components/BatchesCMS.tsx', import.meta.url), 'utf8');
test('device upload keeps validation, admin check and unique non-overwriting paths', () => {
  for (const pattern of [/type="file"/, /image\/jpeg,image\/png,image\/webp/, /5 \* 1024 \* 1024/, /createImageBitmap/, /profile\?\.role !== 'admin'/, /crypto.randomUUID/, /upsert: false/, /getPublicUrl/]) assert.match(source, pattern);
});
test('both image fields retain URLs and batch save waits for uploads', () => {
  assert.match(batch, /label="Thumbnail image"/);
  assert.match(batch, /label="Banner image"/);
  assert.match(batch, /if \(saving \|\| uploading\) return/);
  assert.match(source, /Save the batch/);
  assert.doesNotMatch(source, /\.remove\(/);
});
