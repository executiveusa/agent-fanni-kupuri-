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
  'production/social-media-policy.yaml',
  'production/models.yaml',
  'production/memory-policy.yaml',
  'production/personas/fanni.yaml',
  'src/integrations/zernioClient.js',
  'src/runtime/socialMediaWorkflow.js',
  'supabase/functions/fanni-zernio-webhook/index.ts'
];

for (const file of requiredFiles) {
  await fs.access(path.join(root, file));
}

const manifest = JSON.parse(await fs.readFile(path.join(root, 'production/agent-manifest.json'), 'utf8'));
if (manifest.agent.id !== 'fanni') throw new Error('production agent id must be fanni');
if (!manifest.agent.lifecycle.includes('create_checkpoint')) throw new Error('checkpoint lifecycle stage missing');
if (!manifest.agent.outputContract.rollbackReferenceRequired) throw new Error('rollback reference must be required');

for (const cogPath of ['production/cogs/media-intelligence-weekly.yaml', 'production/cogs/social-media-operations.yaml']) {
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

const models = YAML.parse(await fs.readFile(path.join(root, 'production/models.yaml'), 'utf8'));
for (const route of ['classification', 'synthesis', 'report', 'speech_to_text', 'text_to_speech']) {
  if (!models.routes?.[route]?.primary) throw new Error(`missing model route ${route}`);
}

const memory = YAML.parse(await fs.readFile(path.join(root, 'production/memory-policy.yaml'), 'utf8'));
if (!memory.memory_policy?.deny_cross_workspace_reads || !memory.memory_policy?.deny_cross_workspace_writes) {
  throw new Error('cross-workspace memory must be denied');
}

console.log('Production configuration validated.');
