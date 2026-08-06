# Agent Fanni — Handoff Prompt for Credentialed Agent

## Mission

You are taking over a build that is partially complete. Your job is **not done** until Agent Fanni has:

1. Every environment variable in `.env.example` configured and working end-to-end
2. A real, animated, lip-syncing avatar character — attractive, female, stylized, recognizable — with idle animation, speaking animation (mouth moves with audio), and body movement, running inside the space-agent shell at `http://localhost:3000`
3. Voice input and output working end-to-end (speak → transcribe → Fanni responds → synthesizes audio → avatar lip-syncs)
4. Everything deployed live (Vercel for the landing page, Hostinger VPS for the sidecar)

Do not mark any phase complete without demonstrating the stated outcome.

---

## Repository

**Primary:** `executiveusa/agent-fanni-kupuri-` — branch `claude/fanni-production-contract-7p5wry`

**Submodule (the agent shell):** `executiveusa/space-agent` — cloned at `space-agent/` inside the primary repo

**Working directory:** `/home/user/agent-fanni-kupuri-`

---

## Current Architecture

```
agent-fanni-kupuri-/
├── space-agent/              ← git submodule: the full agent shell (Node server + browser UI)
│   ├── app/L0/_all/mod/_core/onscreen_agent/
│   │   ├── agents/fanni.yaml                    ← Fanni agent config
│   │   └── prompts/agent-fanni-system.md        ← Fanni system prompt
│   └── app/L0/_all/mod/_core/visual/
│       ├── avatar-config.js                     ← registry: 'fanni' entry added
│       └── res/chat/fanni/                      ← PLACEHOLDER images — replace these
│           ├── helmet_256.webp                  ← currently a copy of space-agent default
│           └── astronaut.webp                   ← currently a copy of space-agent default
├── customware/               ← CUSTOMWARE_PATH layer loaded by space-agent at runtime
│   ├── ext/skills/
│   │   ├── media-intelligence/SKILL.md          ← 8-stage workflow skill
│   │   └── fanni-voice/SKILL.md                 ← voice sidecar skill
│   ├── ext/js/_core/onscreen_agent/
│   │   ├── llm.js/.../fanni-icm-context.js      ← injects workspace context into system prompt
│   │   └── store.js/.../fanni-checkpoint.js     ← checkpoint hook after each turn
│   └── memory/
│       ├── behavior.system.include.md           ← safety gates always active
│       └── fanni-workspace.transient.include.md ← current workspace context
├── server/                   ← Fanni sidecar (port 3001) — voice + workflow API
│   ├── index.js              ← HTTP server, provider adapters, routing
│   ├── middleware/supabaseAuth.js
│   ├── routes/workflow.js    ← POST /workflow/run, GET /workflow/runs
│   ├── routes/voice.js       ← POST /voice/transcribe, POST /voice/synthesize
│   └── routes/health.js
├── src/                      ← Legacy Fanni React frontend (Vite/React 19)
│   ├── pages/Landing.jsx     ← Keep: standalone marketing page
│   ├── pages/ChatApp.jsx     ← Superseded by space-agent UI (can be deleted)
│   ├── pages/Auth.jsx        ← Superseded (can be deleted)
│   └── runtime/              ← Workflow engine, checkpoints, beads, memory guard
├── supabase/migrations/      ← 5 migration files, fanni schema, RLS, bootstrap function
├── scripts/                  ← security-scan.mjs, validate-migrations.mjs, validate-production.mjs
└── tests/                    ← 19 passing unit tests
```

**How to start locally:**
```bash
# Terminal 1 — space-agent shell with Fanni persona at http://localhost:3000
CUSTOMWARE_PATH=./customware node space-agent/space.js serve

# Terminal 2 — voice + workflow sidecar at http://localhost:3001
node server/index.js
```

---

## All Environment Variables — Configure Every Single One

Create `.env.local` from `.env.example` and fill in every value. Here is what each does:

### Space-Agent Runtime
```
CUSTOMWARE_PATH=./customware        # points space-agent at the Fanni customware layer
SINGLE_USER_APP=true                # bypass space-agent auth for local/single-tenant dev
SPACE_AGENT_PORT=3000               # space-agent UI port
FANNI_SIDECAR_URL=http://localhost:3001  # voice + workflow sidecar URL
```

Space-agent reads its LLM config from `~/conf/onscreen-agent.yaml` (the user home inside space-agent's data dir), NOT from .env. You must also write that file:
```yaml
provider: api
api_endpoint: https://openrouter.ai/api/v1/chat/completions
model: anthropic/claude-sonnet-4-6
api_key: <YOUR_OPENROUTER_OR_ANTHROPIC_KEY>
max_tokens: 120000
temperature: 0.2
```

### Supabase (frontend — browser-safe only)
```
VITE_SUPABASE_URL=https://cyxdevcjycmffhmwxojh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon/publishable key>
VITE_FANNI_WORKSPACE_SLUG=agent-fanni-demo
VITE_FANNI_ENV=preview
VITE_FANNI_API_BASE_URL=http://localhost:3001
VITE_FANNI_AVATAR_VARIANT=a
VITE_EXTERNAL_WRITES_ENABLED=false
VITE_REAL_CLIENT_DATA_ENABLED=false
```

### Supabase (sidecar — server-only, never VITE_ prefix)
```
SUPABASE_URL=https://cyxdevcjycmffhmwxojh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key — never expose to browser>
```

### Model Providers (sidecar)
```
OPENAI_API_KEY=<key>
OPENAI_CLASSIFICATION_MODEL=gpt-4o-mini
OPENAI_SYNTHESIS_MODEL=gpt-4o
OPENAI_REPORT_MODEL=gpt-4o

QVAC_BASE_URL=http://127.0.0.1:8000/v1      # local OpenAI-compatible endpoint, optional
QVAC_MODEL=                                  # leave blank if not using Qvac

FAL_KEY=<key>                                # Fal for Wizper STT and TTS fallback
```

### Voice (sidecar)
```
FANNI_TTS_PROVIDER=elevenlabs
FANNI_TTS_MODEL=turbo-v2.5
ELEVENLABS_API_KEY=<key>
ELEVENLABS_VOICE_ID=<Fanni's voice ID>
FANNI_TTS_STABILITY=0.5
FANNI_TTS_SIMILARITY_BOOST=0.75
FANNI_TTS_STYLE=0.15
FANNI_TTS_SPEED=0.96
```

### Social Publishing (disabled by default)
```
POSTIZ_API_URL=                              # only needed for social publishing phase
POSTIZ_API_KEY=                              # leave blank until external writes authorized
```

### Runtime Controls (sidecar)
```
PORT=3001
FANNI_PROVIDER_TIMEOUT_MS=60000
FANNI_MAX_PROVIDER_RETRIES=2
FANNI_DAILY_COST_LIMIT_USD=10
FANNI_MEMORY_MAX_RESULTS=12
FANNI_MEMORY_MINIMUM_SIMILARITY=0.72
FANNI_CORS_ORIGIN=http://localhost:3000      # set to production URL when deployed
```

### Safety Gates (both must remain false until explicitly authorized)
```
FANNI_ALLOW_EXTERNAL_WRITES=false
FANNI_ALLOW_REAL_CLIENT_DATA=false
FANNI_NETWORK_MODE=deny_by_default
```

---

## Remaining Phases — What You Must Complete

### Phase A — Full Environment Configuration
- Configure every variable above using credentials from your secrets store
- Verify: `node server/index.js` health check returns all providers as configured
- Verify: `GET http://localhost:3001/health` shows elevenlabs, fal, openai all green
- Verify: `CUSTOMWARE_PATH=./customware node space-agent/space.js serve` starts, Fanni persona loads, you can send a message and get a real LLM response
- Run Supabase migrations: `supabase db push` against project `cyxdevcjycmffhmwxojh`
- Verify bootstrap: call `bootstrap_fanni_workspace` RPC, get back org_id + workspace_id

### Phase B — Avatar Character Design
Build or source an animated avatar character for Fanni. Requirements:

- **Character:** attractive adult female, stylized but realistic, visually distinctive
- **Format:** either (a) a Rive animation file (.riv) with idle + talk states, or (b) a Live2D model, or (c) a Three.js/WebGL character with morph targets, or (d) integration with D-ID or HeyGen API for AI talking-head video
- **States required:**
  - `idle` — subtle breathing, eye blinks, slight body sway
  - `listening` — attentive posture, slight lean
  - `thinking` — neutral, possibly a subtle animation
  - `speaking` — mouth phoneme shapes matching audio (lip sync)
  - `alert` / `error` — visible state change
- **Colors:** orchid (#B84DFF), obsidian (#0B0A0C) — these are the locked brand tokens
- Replace `space-agent/app/L0/_all/mod/_core/visual/res/chat/fanni/helmet_256.webp` and `astronaut.webp` with real Fanni character images (or video/canvas rendered frames)

**Recommended implementation path:**
1. Use Rive (rive.app) — it runs natively in browser with no external CDN dependency, supports state machines for idle/speaking/listening, and is < 200KB for a character
2. Create a `FanniAvatar` web component in `customware/ext/` that wraps the Rive canvas, exposes `setState(state)` and `playAudio(audioBuffer)` methods
3. Wire it into the space-agent overlay via an ext/html hook

### Phase C — Lip Sync Integration
Wire ElevenLabs TTS audio output to the avatar's mouth animation:

1. When space-agent receives a TTS audio buffer from `/voice/synthesize`:
   - Feed raw PCM/audio to a lip-sync library (Rhubarb Lip Sync WASM, or a simple amplitude-based approach, or phoneme extraction via Web Audio API)
   - Map phonemes or amplitude envelope to the avatar's mouth morph targets / Rive state machine inputs
2. The avatar's mouth must visibly move in sync with Fanni's spoken responses
3. Verify: trigger a voice synthesis, watch the avatar mouth move with the audio playback

### Phase D — Deploy Live
- **Vercel:** deploy the Landing page (`src/pages/Landing.jsx`) as a standalone Vite build to Vercel. Environment: `VITE_FANNI_API_BASE_URL` pointing to the live sidecar URL.
- **Hostinger VPS (or equivalent):** deploy `server/index.js` sidecar. Set all server-only env vars. Configure a reverse proxy (nginx) on port 443 with TLS. Update `FANNI_CORS_ORIGIN` to the Vercel domain.
- **space-agent:** deploy to the same VPS or a separate host. Set `CUSTOMWARE_PATH` to the deployed customware directory. Configure `~/conf/onscreen-agent.yaml` with the production LLM API key.

### Phase E — Production Acceptance
You are not done until all of these pass:

- [ ] Navigate to `http://localhost:3000` (or production URL) — Fanni avatar loads, visible, animated
- [ ] Send a text message — Fanni responds in EN or ES with her identity voice
- [ ] Click the voice input button — speak a sentence — it transcribes — Fanni responds — avatar lip-syncs while speaking
- [ ] Run a workflow — `POST /workflow/run` returns a complete 8-stage report
- [ ] Open the Operator drawer / check observability — checkpoints are visible, rollback works
- [ ] `GET /health` shows all providers green
- [ ] Security scan passes: `npm run security:scan`
- [ ] All 19 tests pass: `npm test`
- [ ] No secrets appear in browser assets or console logs

---

## Security Rules — Never Violate

- **Never commit:** `.env`, `.env.local`, `.env.production`, service role keys, API keys, JWT secrets, database passwords, webhook secrets
- **Never use VITE_ prefix** for server-only values
- `FANNI_ALLOW_EXTERNAL_WRITES` and `FANNI_ALLOW_REAL_CLIENT_DATA` must stay `false` until the workspace operator explicitly authorizes them
- Cross-workspace reads and writes must fail at the database layer — do not bypass RLS
- Service role key stays server-side only, never in any browser bundle

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `space-agent/app/L0/_all/mod/_core/visual/avatar-config.js` | Avatar registry — fanni entry already added |
| `space-agent/app/L0/_all/mod/_core/onscreen_agent/agents/fanni.yaml` | Agent config — model, capabilities, safety gates |
| `space-agent/app/L0/_all/mod/_core/onscreen_agent/prompts/agent-fanni-system.md` | Fanni's full system prompt |
| `space-agent/app/L0/_all/mod/_core/onscreen_agent/view.js` | Loads avatar via `getAvatarConfig(window.__ONSCREEN_AGENT_AVATAR_ID)` |
| `customware/memory/behavior.system.include.md` | Safety rules injected every turn |
| `customware/memory/fanni-workspace.transient.include.md` | Current workspace — update when env changes |
| `server/routes/voice.js` | TTS/STT endpoints — already working |
| `server/routes/workflow.js` | 8-stage pipeline endpoint — already working |
| `supabase/migrations/` | 5 migration files — run `supabase db push` |
| `.env.example` | All variable names and descriptions |
| `docs/PRODUCTION_GAP_MATRIX.md` | Phase checklist — update as you complete work |

---

## Definition of Done

The build is complete when a real person can:

1. Open the Fanni interface in a browser
2. See an attractive, animated female avatar (not a placeholder helmet image)
3. Speak to Fanni — their voice is transcribed and Fanni responds
4. Watch Fanni's avatar lips move in sync with her spoken response
5. Ask Fanni to run a media intelligence report — she does so and presents it
6. All of the above works at a deployed production URL, not just localhost

Commit all work to `claude/fanni-production-contract-7p5wry`, push, and update PR #9 when each phase is complete.
