import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const [landing, content, character, desk, main, checkout, migration] = await Promise.all([
  fs.readFile(new URL('../src/pages/Landing.jsx', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/content/publicSite.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/components/FanniCharacter.jsx', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/components/FanniDesk.jsx', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  fs.readFile(new URL('../src/pages/Checkout.jsx', import.meta.url), 'utf8'),
  fs.readFile(new URL('../supabase/migrations/20260807010000_fanni_public_site_and_billing.sql', import.meta.url), 'utf8')
]);

test('homepage presents demand, reputation, and operations as paid business programs', () => {
  for (const name of ['Fanni Demand', 'Fanni Reputation', 'Fanni Operations']) {
    assert.match(content, new RegExp(name));
  }
  assert.match(landing, /Three problems worth solving|copy\.sections\.programs/);
});

test('work publishing distinguishes labs, internal work, pilots, and case studies', () => {
  for (const classification of ['case-study', 'pilot', 'lab', 'internal', 'private']) {
    assert.match(`${content}\n${migration}`, new RegExp(classification));
  }
  assert.match(migration, /client_permission_status = 'approved'/);
  assert.match(migration, /jsonb_array_length\(evidence_refs\) > 0/);
});

test('full-body Fanni is a stylized octopus with eight governed arms', () => {
  assert.match(character, /full-body editorial cartoon octopus/i);
  const arms = character.match(/fanni-character__arm--\d/g) || [];
  assert.equal(arms.length, 8);
  for (const label of ['Listen', 'Verify', 'Understand', 'Decide', 'Act', 'Measure', 'Protect', 'Learn']) {
    assert.match(character, new RegExp(label));
  }
});

test('Space Agent overlay works through click and keyboard rather than hover alone', () => {
  assert.match(desk, /onClick=\{\(\) => setOpen/);
  assert.match(desk, /onFocusCapture/);
  assert.match(desk, /aria-expanded=\{open\}/);
  assert.match(desk, /fanni_public_intent/);
  assert.match(desk, /\/app\/chat/);
});

test('editorial routes and checkout are lazy loaded', () => {
  for (const route of ['/programs/', '/work/', '/signals/', '/checkout/']) {
    assert.match(main, new RegExp(route.replaceAll('/', '\\/')));
  }
  assert.match(main, /const ProgramPage = lazy/);
  assert.match(main, /const ProjectPage = lazy/);
  assert.match(main, /const Checkout = lazy/);
});

test('checkout never collects card data or grants entitlement from redirect', () => {
  assert.doesNotMatch(checkout, /<input[^>]+(card|credit|cc-|number)/i);
  assert.doesNotMatch(checkout, /upsertEntitlement|grantAccess|activateEntitlement/);
  assert.match(checkout, /signed provider webhook/);
  assert.match(checkout, /Stripe/);
  assert.match(checkout, /Creem/);
});

test('public database policies expose only approved published content', () => {
  assert.match(migration, /publication_status = 'published'/);
  assert.match(migration, /published_case_study_requires_permission/);
  assert.match(migration, /published_evidence_requires_verification/);
  assert.match(migration, /revoke all on fanni\.billing_entitlements from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy public_read[^;]+billing_entitlements/s);
});
