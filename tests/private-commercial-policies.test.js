import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const migration = await fs.readFile(
  new URL('../supabase/migrations/20260807013000_fanni_private_table_deny_policies.sql', import.meta.url),
  'utf8'
);

for (const table of [
  'lead_diagnostics',
  'billing_checkout_requests',
  'billing_events',
  'billing_entitlements'
]) {
  test(`browser roles are explicitly denied on fanni.${table}`, () => {
    const policyName = `deny_browser_${table}`;
    assert.match(migration, new RegExp(`create policy ${policyName}`));
    assert.match(migration, new RegExp(`on fanni\\.${table}`));
    assert.match(migration, /to anon, authenticated/);
    assert.match(migration, /using \(false\)/);
    assert.match(migration, /with check \(false\)/);
  });
}
