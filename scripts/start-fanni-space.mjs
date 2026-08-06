import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===========================================================');
console.log('  Agent Fanni · Sovereign Space Agent Unified Launcher');
console.log('===========================================================');

const env = {
  ...process.env,
  CUSTOMWARE_PATH: './customware',
  PORT: process.env.PORT || '3001',
  SPACE_AGENT_PORT: process.env.SPACE_AGENT_PORT || '3000'
};

// 1. Start Fanni Sidecar Server (Port 3001)
console.log('[launcher] Starting Fanni Sidecar Server (port 3001)...');
const sidecar = spawn('node', ['server/index.js'], {
  cwd: rootDir,
  env,
  stdio: 'inherit'
});

// 2. Start Space Agent Server (Port 3000)
console.log('[launcher] Starting Space Agent Workspace Server (port 3000)...');
const spaceAgent = spawn('node', ['space-agent/space.js', 'serve'], {
  cwd: rootDir,
  env,
  stdio: 'inherit'
});

function cleanup() {
  console.log('\n[launcher] Shutting down Fanni Sidecar and Space Agent...');
  sidecar.kill('SIGTERM');
  spaceAgent.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

sidecar.on('exit', (code) => {
  console.error(`[launcher] Sidecar server exited with code ${code}`);
});

spaceAgent.on('exit', (code) => {
  console.error(`[launcher] Space Agent server exited with code ${code}`);
});
