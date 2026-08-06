/**
 * Security scan: ensures no secrets are tracked in git.
 * Run via: npm run security:scan
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const FORBIDDEN_FILES = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.staging',
  '.env.development',
];

const SECRET_PATTERNS = [
  { name: 'OpenAI API key', pattern: /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/ },
  { name: 'Supabase service role key', pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: 'ElevenLabs API key', pattern: /(?:ELEVENLABS_API_KEY|xi-api-key)[^\n]*[:=]\s*[A-Za-z0-9_-]{20,}/ },
  { name: 'Fal API key', pattern: /FAL_KEY[^\n]*[:=]\s*[A-Za-z0-9_:-]{20,}/ },
  { name: 'Generic private key block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Generic secret assignment', pattern: /(?:SECRET|PASSWORD|PASSWD|PRIVATE_KEY)[ \t]*=[ \t]*['"]?[A-Za-z0-9+/=_-]{16,}/ },
  { name: 'JWT signing secret', pattern: /JWT_SECRET[^\n]*[:=][ \t]*[A-Za-z0-9+/=_-]{16,}/ },
  { name: 'Database URL with credentials', pattern: /postgresql:\/\/[^:]+:[^@]+@/ },
  { name: 'Webhook secret', pattern: /WEBHOOK_SECRET[^\n]*[:=][ \t]*[A-Za-z0-9+/=_-]{16,}/ },
];

// Files/patterns to skip during content scan
const SKIP_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'package-lock.json',
  'scripts/security-scan.mjs', // this file itself contains the patterns as strings
];

let failures = 0;

// 1. Check forbidden files are not tracked by git
console.log('Checking for forbidden tracked files…');
let trackedFiles;
try {
  trackedFiles = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch {
  console.error('Could not run git ls-files — not a git repo or git not available.');
  process.exit(1);
}

for (const forbidden of FORBIDDEN_FILES) {
  if (trackedFiles.includes(forbidden)) {
    console.error(`FAIL: Forbidden file tracked by git: ${forbidden}`);
    failures++;
  }
}

// 2. Scan tracked file content for secret patterns
console.log('Scanning tracked files for secret patterns…');

for (const trackedPath of trackedFiles) {
  if (SKIP_PATHS.some((skip) => trackedPath.startsWith(skip))) continue;

  let content;
  try {
    content = await fs.readFile(path.join(root, trackedPath), 'utf8');
  } catch {
    continue; // binary or unreadable
  }

  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`FAIL: ${name} pattern found in: ${trackedPath}`);
      failures++;
    }
  }
}

// 3. Check VITE_ prefix is not used for server-only secrets
console.log('Checking VITE_ prefix discipline…');
const SERVER_ONLY_NAMES = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'ELEVENLABS_API_KEY',
  'FAL_KEY',
  'JWT_SECRET',
  'WEBHOOK_SECRET',
];

for (const trackedPath of trackedFiles) {
  if (SKIP_PATHS.some((skip) => trackedPath.startsWith(skip))) continue;
  if (!trackedPath.endsWith('.js') && !trackedPath.endsWith('.jsx') && !trackedPath.endsWith('.ts') && !trackedPath.endsWith('.mjs')) continue;

  let content;
  try {
    content = await fs.readFile(path.join(root, trackedPath), 'utf8');
  } catch {
    continue;
  }

  for (const name of SERVER_ONLY_NAMES) {
    if (content.includes(`VITE_${name}`)) {
      console.error(`FAIL: Server-only secret ${name} exposed with VITE_ prefix in: ${trackedPath}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\nSecurity scan failed with ${failures} violation(s).`);
  process.exit(1);
}

console.log('Security scan passed — no secrets detected in tracked files.');
