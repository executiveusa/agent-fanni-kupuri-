import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FANNI_PULSO_DEMOS, runAllFanniPulsoDemos, runFanniPulsoDemo } from '../src/runtime/fanniPulsoDemo.js';

const POLICY = fs.readFileSync(new URL('../production/signal-os-policy.yaml', import.meta.url), 'utf8');
const COG = fs.readFileSync(new URL('../production/cogs/latam-signal-os.yaml', import.meta.url), 'utf8');
const SKILL = fs.readFileSync(new URL('../customware/ext/skills/fanni-pulso/SKILL.md', import.meta.url), 'utf8');
const LICENSE_BOUNDARY = fs.readFileSync(new URL('../docs/WORLDMONITOR_INTEGRATION_BOUNDARY.md', import.meta.url), 'utf8');

test('Fanni Pulso defines three distinct synthetic proof demos', () => {
  assert.equal(FANNI_PULSO_DEMOS.length, 3);
  assert.deepEqual(
    FANNI_PULSO_DEMOS.map(demo => demo.id),
    [
      'tourism-pulse-puerto-vallarta',
      'enterprise-reputation-mexico',
      'barrio-shield-water-outage'
    ]
  );
});

test('all Fanni Pulso demos produce evidence-aware action receipts without external writes', () => {
  const results = runAllFanniPulsoDemos();

  for (const result of results) {
    assert.equal(result.synthetic, true);
    assert.ok(result.leadingTopic);
    assert.ok(result.actionReceipt.coverage.lastRefreshedAt);
    assert.equal(result.actionReceipt.coverage.synthetic, true);
    assert.equal(result.actionReceipt.externalWritePerformed, false);
    assert.ok(['high', 'medium', 'low'].includes(result.actionReceipt.confidence));
    assert.ok(result.actionReceipt.recommendation.length > 20);
  }
});

test('consequential demo actions wait for approval and create a checkpoint', () => {
  const results = runAllFanniPulsoDemos();

  for (const result of results) {
    assert.equal(result.actionReceipt.approval.required, true);
    assert.equal(result.actionReceipt.approval.status, 'awaiting_approval');
    assert.equal(result.actionReceipt.checkpointCreated, true);
  }
});

test('Barrio Shield keeps an unverified road claim out of the leading verified cluster', () => {
  const fixture = FANNI_PULSO_DEMOS.find(demo => demo.id === 'barrio-shield-water-outage');
  const result = runFanniPulsoDemo(fixture);

  assert.equal(result.leadingTopic.topic, 'water-service-interruption');
  assert.notEqual(result.leadingTopic.topic, 'road-closure-rumor');
  assert.match(result.actionReceipt.recommendation, /unverified/i);
});

test('signal policy enforces workspace identity, coverage, approvals, and provider neutrality', () => {
  assert.match(POLICY, /whatsapp_sender_must_map_to_workspace: true/);
  assert.match(POLICY, /require_coverage_ledger: true/);
  assert.match(POLICY, /require_checkpoint: true/);
  assert.match(POLICY, /provider_neutral_entitlements: true/);
  assert.match(POLICY, /commercial_code_use_without_license: false/);
});

test('orchestrator includes verifier, approval, reconciliation, measurement, and learning stages', () => {
  for (const stage of ['independent_verifier', 'approval_gate', 'reconcile', 'measure', 'propose_learning']) {
    assert.match(COG, new RegExp(`- id: ${stage}`));
  }
});

test('skill forbids omniscient social claims and requires a coverage ledger', () => {
  assert.match(SKILL, /Coverage ledger/);
  assert.match(SKILL, /Never say “everyone is saying”/);
});

test('World Monitor remains behind a commercial licensing boundary', () => {
  assert.match(LICENSE_BOUNDARY, /must not copy, embed, rebrand, distribute, or operate World Monitor code/i);
  assert.match(LICENSE_BOUNDARY, /Licensed World Monitor adapter/);
  assert.match(LICENSE_BOUNDARY, /Independent intelligence mesh/);
});
