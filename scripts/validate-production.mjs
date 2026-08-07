import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { validateCog } from '../src/runtime/cogEngine.js';

const root = process.cwd();
const requiredFiles = [
  'AGENTS.md',
  'HEART.md',
  'PERSONA.md',
  'HEARTBEAT.md',
  'production/agent-manifest.json',
  'production/cogs/media-intelligence-weekly.yaml',
  'production/cogs/social-media-operations.yaml',
  'production/cogs/latam-signal-os.yaml',
  'production/social-media-policy.yaml',
  'production/signal-os-policy.yaml',
  'production/models.yaml',
  'production/memory-policy.yaml',
  'production/personas/fanni.yaml',
  'customware/ext/skills/fanni-pulso/SKILL.md',
  'customware/ext/skills/fanni-site-gauntlet/SKILL.md',
  'docs/FANNI_PULSO_LATAM_SIGNAL_OS.md',
  'docs/WORLDMONITOR_INTEGRATION_BOUNDARY.md',
  'src/integrations/zernioClient.js',
  'src/runtime/socialMediaWorkflow.js',
  'src/runtime/fanniPulsoDemo.js',
  'src/content/publicSite.js',
  'src/components/FanniCharacter.jsx',
  'src/components/FanniDesk.jsx',
  'src/pages/Landing.jsx',
  'src/pages/ProgramPage.jsx',
  'src/pages/ProjectPage.jsx',
  'src/pages/SignalPage.jsx',
  'src/pages/Checkout.jsx',
  'src/public-site.css',
  'src/public-accessibility.css',
  'server/integrations/billing.js',
  'server/routes/billing.js',
  'scripts/site-gauntlet.mjs',
  'supabase/migrations/20260807010000_fanni_public_site_and_billing.sql',
  'supabase/functions/fanni-zernio-webhook/index.ts'
];

for (const file of requiredFiles) {
  await fs.access(path.join(root, file));
}

const manifest = JSON.parse(await fs.readFile(path.join(root, 'production/agent-manifest.json'), 'utf8'));
if (manifest.agent.id !== 'fanni') throw new Error('production agent id must be fanni');
if (!manifest.agent.lifecycle.includes('create_checkpoint')) throw new Error('checkpoint lifecycle stage missing');
if (!manifest.agent.outputContract.rollbackReferenceRequired) throw new Error('rollback reference must be required');

for (const cogPath of [
  'production/cogs/media-intelligence-weekly.yaml',
  'production/cogs/social-media-operations.yaml',
  'production/cogs/latam-signal-os.yaml'
]) {
  const cog = YAML.parse(await fs.readFile(path.join(root, cogPath), 'utf8'));
  const validation = validateCog(cog);
  if (!validation.valid) throw new Error(`invalid cog ${cogPath}: ${validation.errors.join('; ')}`);
}

const socialCog = YAML.parse(await fs.readFile(path.join(root, 'production/cogs/social-media-operations.yaml'), 'utf8'));
const socialAgentIds = new Set(socialCog.agents.map((agent) => agent.id));
for (const requiredAgent of ['resolve_client', 'policy_check', 'approval_gate', 'checkpoint', 'publish', 'reconcile', 'measure', 'inbox_triage', 'rollback']) {
  if (!socialAgentIds.has(requiredAgent)) throw new Error(`social cog missing ${requiredAgent}`);
}
if (socialCog.flow.transitions.publish?.fallback !== 'rollback') throw new Error('social publishing must fail closed to rollback');
if (socialCog.flow.transitions.approval_gate?.choices?.approved !== 'checkpoint') throw new Error('approved social writes must checkpoint before publishing');

const socialPolicy = YAML.parse(await fs.readFile(path.join(root, 'production/social-media-policy.yaml'), 'utf8'));
if (socialPolicy.policy?.tenant_boundary !== 'one_zernio_profile_per_fanni_workspace') throw new Error('Zernio tenant boundary must be profile-per-workspace');
if (socialPolicy.policy?.external_writes_default !== false) throw new Error('social external writes must default to false');
if (socialPolicy.actions?.publish_now?.approval !== 'always') throw new Error('publish-now must always require approval');
if (!socialPolicy.client_isolation?.deny_cross_workspace_account_ids) throw new Error('cross-workspace social account IDs must be denied');
if (socialPolicy.client_isolation?.store_api_keys_in_database !== false) throw new Error('Zernio API keys must not be stored in tenant tables');

const signalCog = YAML.parse(await fs.readFile(path.join(root, 'production/cogs/latam-signal-os.yaml'), 'utf8'));
const signalAgentIds = new Set(signalCog.agents.map((agent) => agent.id));
for (const requiredAgent of ['resolve_identity', 'plan_evidence', 'corroborate', 'coverage_gate', 'independent_verifier', 'approval_gate', 'checkpoint', 'execute_action', 'reconcile', 'measure', 'propose_learning']) {
  if (!signalAgentIds.has(requiredAgent)) throw new Error(`signal cog missing ${requiredAgent}`);
}
if (signalCog.flow.transitions.approval_gate?.choices?.approved !== 'checkpoint') throw new Error('approved signal actions must checkpoint before execution');
if (signalCog.flow.transitions.execute_action?.fallback !== 'rollback') throw new Error('signal action execution must fail closed to rollback');

const signalPolicy = YAML.parse(await fs.readFile(path.join(root, 'production/signal-os-policy.yaml'), 'utf8'));
if (!signalPolicy.identity?.whatsapp_sender_must_map_to_workspace) throw new Error('WhatsApp sender must map to a workspace');
if (!signalPolicy.trend_answers?.require_coverage_ledger) throw new Error('trend answers require a coverage ledger');
if (signalPolicy.sources?.worldmonitor?.commercial_code_use_without_license !== false) throw new Error('World Monitor commercial code use must remain disabled without a license');
if (!signalPolicy.external_actions?.require_checkpoint) throw new Error('signal actions require checkpoints');
if (!signalPolicy.payments?.provider_neutral_entitlements) throw new Error('billing entitlements must remain provider-neutral');
if (signalPolicy.privacy?.signal_commons?.enabled_by_default !== false) throw new Error('Signal Commons cannot be enabled by default');

const models = YAML.parse(await fs.readFile(path.join(root, 'production/models.yaml'), 'utf8'));
for (const route of ['classification', 'synthesis', 'report', 'speech_to_text', 'text_to_speech']) {
  if (!models.routes?.[route]?.primary) throw new Error(`missing model route ${route}`);
}

const memory = YAML.parse(await fs.readFile(path.join(root, 'production/memory-policy.yaml'), 'utf8'));
if (!memory.memory_policy?.deny_cross_workspace_reads || !memory.memory_policy?.deny_cross_workspace_writes) {
  throw new Error('cross-workspace memory must be denied');
}

const publicContent = await fs.readFile(path.join(root, 'src/content/publicSite.js'), 'utf8');
for (const requiredProgram of ['Fanni Demand', 'Fanni Reputation', 'Fanni Operations']) {
  if (!publicContent.includes(requiredProgram)) throw new Error(`public site missing program ${requiredProgram}`);
}
for (const requiredOffer of ['problem_scan', 'demand_operator', 'business_operator', 'enterprise_consultation']) {
  if (!publicContent.includes(requiredOffer)) throw new Error(`public site missing offer ${requiredOffer}`);
}
if (/Banorte/i.test(publicContent)) throw new Error('public content must not imply an unapproved Banorte client relationship');

const billing = await fs.readFile(path.join(root, 'server/integrations/billing.js'), 'utf8');
if (!billing.includes('FANNI_BILLING_ALLOWED_ORIGINS')) throw new Error('billing return URL allowlist missing');
if (!billing.includes('timingSafeEqual')) throw new Error('billing webhook comparison must be timing-safe');
if (!billing.includes('verifyStripeWebhook') || !billing.includes('verifyCreemWebhook')) throw new Error('signed provider webhook verification missing');
if (!billing.includes('upsertEntitlement')) throw new Error('provider-neutral entitlement ledger missing');

const publicationMigration = await fs.readFile(path.join(root, 'supabase/migrations/20260807010000_fanni_public_site_and_billing.sql'), 'utf8');
if (!publicationMigration.includes('published_case_study_requires_permission')) throw new Error('case-study permission constraint missing');
if (!publicationMigration.includes('published_evidence_requires_verification')) throw new Error('public evidence verification constraint missing');
if (!publicationMigration.includes('revoke all on fanni.billing_entitlements from anon, authenticated')) throw new Error('billing entitlements must not be anonymously readable');

console.log('Production configuration validated.');
