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
  'production/models.yaml',
  'production/memory-policy.yaml',
  'production/personas/fanni.yaml'
];

for (const file of requiredFiles) {
  await fs.access(path.join(root, file));
}

const manifest = JSON.parse(await fs.readFile(path.join(root, 'production/agent-manifest.json'), 'utf8'));
if (manifest.agent.id !== 'fanni') throw new Error('production agent id must be fanni');
if (!manifest.agent.lifecycle.includes('create_checkpoint')) throw new Error('checkpoint lifecycle stage missing');
if (!manifest.agent.outputContract.rollbackReferenceRequired) throw new Error('rollback reference must be required');

const cog = YAML.parse(await fs.readFile(path.join(root, 'production/cogs/media-intelligence-weekly.yaml'), 'utf8'));
const validation = validateCog(cog);
if (!validation.valid) throw new Error(`invalid cog: ${validation.errors.join('; ')}`);

const models = YAML.parse(await fs.readFile(path.join(root, 'production/models.yaml'), 'utf8'));
for (const route of ['classification', 'synthesis', 'report', 'speech_to_text', 'text_to_speech']) {
  if (!models.routes?.[route]?.primary) throw new Error(`missing model route ${route}`);
}

const memory = YAML.parse(await fs.readFile(path.join(root, 'production/memory-policy.yaml'), 'utf8'));
if (!memory.memory_policy?.deny_cross_workspace_reads || !memory.memory_policy?.deny_cross_workspace_writes) {
  throw new Error('cross-workspace memory must be denied');
}

console.log('Production configuration validated.');
