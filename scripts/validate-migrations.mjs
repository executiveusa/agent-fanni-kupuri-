/**
 * Validate Supabase migration files for structural integrity.
 * Run via: npm run validate:migrations
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');

// Migration files must follow: YYYYMMDDHHMMSS_description.sql
const MIGRATION_FILENAME_RE = /^\d{14}_[a-z][a-z0-9_-]*\.sql$/;

// Each migration must contain these structural markers
const REQUIRED_SCHEMA = 'fanni';

// Patterns that should never appear in migrations (security)
const FORBIDDEN_PATTERNS = [
  { name: 'DROP TABLE without IF EXISTS', pattern: /DROP\s+TABLE\s+(?!IF\s+EXISTS)/i },
  { name: 'TRUNCATE without schema prefix', pattern: /TRUNCATE\s+(?!fanni\.)/i },
  { name: 'DISABLE ROW LEVEL SECURITY', pattern: /DISABLE\s+ROW\s+LEVEL\s+SECURITY/i },
  { name: 'Hardcoded UUID secret', pattern: /secret\s*=\s*'[0-9a-f-]{36}'/i },
];

let failures = 0;
let migrationCount = 0;

let entries;
try {
  entries = await fs.readdir(migrationsDir);
} catch {
  console.error(`FAIL: Cannot read migrations directory: ${migrationsDir}`);
  process.exit(1);
}

const sqlFiles = entries.filter((f) => f.endsWith('.sql')).sort();

if (sqlFiles.length === 0) {
  console.error('FAIL: No migration files found.');
  process.exit(1);
}

// Check for filename format compliance
console.log(`Validating ${sqlFiles.length} migration file(s)…`);

const timestamps = [];

for (const filename of sqlFiles) {
  const filePath = path.join(migrationsDir, filename);

  // Filename format
  if (!MIGRATION_FILENAME_RE.test(filename)) {
    console.error(`FAIL: Migration filename does not match YYYYMMDDHHMMSS_description.sql: ${filename}`);
    failures++;
  }

  const ts = filename.slice(0, 14);
  if (timestamps.includes(ts)) {
    console.error(`FAIL: Duplicate migration timestamp ${ts} in ${filename}`);
    failures++;
  }
  timestamps.push(ts);

  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    console.error(`FAIL: Cannot read migration file: ${filename}`);
    failures++;
    continue;
  }

  if (content.trim().length === 0) {
    console.error(`FAIL: Empty migration file: ${filename}`);
    failures++;
    continue;
  }

  // Must reference the fanni schema
  if (!content.includes(REQUIRED_SCHEMA)) {
    console.error(`FAIL: Migration does not reference '${REQUIRED_SCHEMA}' schema: ${filename}`);
    failures++;
  }

  // Forbidden patterns
  for (const { name, pattern } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`FAIL: ${name} found in migration: ${filename}`);
      failures++;
    }
  }

  migrationCount++;
}

// Verify timestamps are monotonically increasing
for (let i = 1; i < timestamps.length; i++) {
  if (timestamps[i] <= timestamps[i - 1]) {
    console.error(`FAIL: Migration timestamps not monotonically increasing: ${sqlFiles[i - 1]} → ${sqlFiles[i]}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\nMigration validation failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log(`Migration validation passed — ${migrationCount} migration(s) verified.`);
