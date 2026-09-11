import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createVerificationGate } from '../src/lib/adminSession.ts';
test('logout invalidates an in-flight administrator result', async () => {
  const gate = createVerificationGate();
  const ticket = gate.invalidate();
  const result = Promise.resolve().then(() => gate.isCurrent(ticket));
  gate.invalidate();
  assert.equal(await result, false);
});
test('new login and unmount invalidate older checks', () => {
  const gate = createVerificationGate();
  const first = gate.invalidate(), second = gate.invalidate();
  assert.equal(gate.isCurrent(first), false);
  assert.equal(gate.isCurrent(second), true);
  gate.invalidate();
  assert.equal(gate.isCurrent(second), false);
});
test('CMS requires server user, admin role and matching current token', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(source, /getUser\(session.access_token\)/);
  assert.match(source, /profile\?\.role !== 'admin'/);
  assert.match(source, /latest.data.session\?\.access_token !== session.access_token/);
  assert.match(source, /setTimeout\(\(\) => \{ void verify/);
  assert.match(source, /lock\(\); setSessionUser\(null\)/);
  assert.match(source, /scope: 'local'/);
  assert.match(source, /abortSignal\(abort.signal\)/);
});
test('login has no embedded credentials or direct CMS authorization', () => {
  const source = readFileSync(new URL('../src/components/Login.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /admin123|admin@carrier50|Demo credentials|onLoginSuccess|console.error/);
  assert.match(source, /setPassword\(''\)/);
  assert.match(source, /submitting.current/);
  assert.match(source, /autoComplete="current-password"/);
});
