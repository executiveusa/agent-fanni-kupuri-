import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createElevenLabsTTSAdapter, createElevenLabsSTTAdapter } from './adapters/elevenlabs.js';
import { createFalSTTAdapter, createFalTTSAdapter } from './adapters/fal.js';
import { requireAuth, resolveWorkspace } from './middleware/supabaseAuth.js';
import { healthRouter } from './routes/health.js';
import { voiceRouter } from './routes/voice.js';
import { workflowRouter } from './routes/workflow.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const startedAt = new Date().toISOString();

let version = '0.3.0';
try {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  version = pkg.version;
} catch { /* noop */ }

// ── Provider adapters (fail closed when credentials absent) ──────────────
function buildAdapters() {
  const sttAdapters = {};
  const ttsAdapters = {};

  if (process.env.FAL_KEY) {
    sttAdapters.fal = createFalSTTAdapter({ apiKey: process.env.FAL_KEY });
    ttsAdapters.fal = createFalTTSAdapter({ apiKey: process.env.FAL_KEY });
  }
  if (process.env.ELEVENLABS_API_KEY) {
    sttAdapters.elevenlabs = createElevenLabsSTTAdapter({ apiKey: process.env.ELEVENLABS_API_KEY });
    if (process.env.ELEVENLABS_VOICE_ID) {
      ttsAdapters.elevenlabs = createElevenLabsTTSAdapter({
        apiKey: process.env.ELEVENLABS_API_KEY,
        voiceId: process.env.ELEVENLABS_VOICE_ID,
        stability: parseFloat(process.env.FANNI_TTS_STABILITY || '0.5'),
        similarityBoost: parseFloat(process.env.FANNI_TTS_SIMILARITY_BOOST || '0.75'),
        style: parseFloat(process.env.FANNI_TTS_STYLE || '0.15'),
        speed: parseFloat(process.env.FANNI_TTS_SPEED || '0.96')
      });
    }
  }

  const sttRoute = {
    primary: { provider: process.env.FAL_KEY ? 'fal' : 'elevenlabs' },
    fallbacks: process.env.FAL_KEY && process.env.ELEVENLABS_API_KEY ? [{ provider: 'elevenlabs' }] : [],
    timeout_ms: parseInt(process.env.FANNI_PROVIDER_TIMEOUT_MS || '30000', 10),
    max_retries: parseInt(process.env.FANNI_MAX_PROVIDER_RETRIES || '2', 10)
  };

  const ttsPrimary = process.env.ELEVENLABS_VOICE_ID ? 'elevenlabs' : process.env.FAL_KEY ? 'fal' : null;
  const ttsRoute = {
    primary: { provider: ttsPrimary || 'fal' },
    fallbacks: ttsPrimary === 'elevenlabs' && process.env.FAL_KEY ? [{ provider: 'fal' }] : [],
    timeout_ms: parseInt(process.env.FANNI_PROVIDER_TIMEOUT_MS || '30000', 10),
    max_retries: parseInt(process.env.FANNI_MAX_PROVIDER_RETRIES || '2', 10)
  };

  return { sttAdapters, ttsAdapters, sttRoute, ttsRoute };
}

const { sttAdapters, ttsAdapters, sttRoute, ttsRoute } = buildAdapters();

// ── Minimal request router ───────────────────────────────────────────────
class Router {
  constructor() {
    this._routes = [];
  }

  get(path, ...handlers) { this._routes.push({ method: 'GET', path, handlers }); }
  post(path, ...handlers) { this._routes.push({ method: 'POST', path, handlers }); }

  handle(req, res) {
    const url = new URL(req.url, `http://localhost`);
    const route = this._routes.find(r => r.method === req.method && url.pathname === r.path);
    if (!route) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    let i = 0;
    const next = (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
        return;
      }
      const handler = route.handlers[i++];
      if (handler) handler(req, res, next);
    };
    next();
  }
}

// ── Build request body parser ────────────────────────────────────────────
/** @param {import('http').IncomingMessage & { body?: any }} req */
function withBody(req) {
  return new Promise(/** @type {(resolve: (v?: any) => void, reject: (e: any) => void) => void} */ ((resolve, reject) => {
    const chunks = /** @type {Buffer[]} */ ([]);
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        req.body = raw ? JSON.parse(raw) : {};
        resolve();
      } catch {
        req.body = {};
        resolve();
      }
    });
    req.on('error', reject);
  }));
}

// ── Assemble server ──────────────────────────────────────────────────────
const router = new Router();

healthRouter(router, { startedAt, version });
voiceRouter(router, { requireAuth, resolveWorkspace, sttAdapters, ttsAdapters, sttRoute, ttsRoute });
workflowRouter(router, { requireAuth, resolveWorkspace });

const server = createServer(async (req, res) => {
  const extReq = /** @type {import('http').IncomingMessage & { body?: any }} */ (req);
  res.setHeader('Access-Control-Allow-Origin', process.env.FANNI_CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Fanni-Workspace, X-Fanni-Language');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const contentType = req.headers['content-type'] || '';
  const isJsonBody = req.method === 'POST' && contentType.includes('application/json');

  if (isJsonBody) await withBody(extReq);
  else extReq.body = {};

  router.handle(extReq, res);
});

server.listen(PORT, () => {
  console.log(`[fanni-server] Agent Fanni runtime · port ${PORT} · v${version}`);
  console.log(`[fanni-server] Supabase: ${process.env.SUPABASE_URL ? 'configured' : 'NOT configured (server cannot authenticate)'}`);
  console.log(`[fanni-server] External writes: ${process.env.FANNI_ALLOW_EXTERNAL_WRITES === 'true' ? 'ENABLED' : 'blocked'}`);
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
