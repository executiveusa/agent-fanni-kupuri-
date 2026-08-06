# Production Gap Matrix — Agent Fanni v0.3.0

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented and verified |
| 🔶 | Partially implemented |
| ⛔ | Blocked by external dependency |
| ⬜ | Not yet started |

## Phase matrix

### Phase 1 — Repository and Infrastructure Audit ✅
- [x] Codebase inventoried
- [x] Gap analysis complete
- [x] tsconfig.json (TypeScript 7, checkJs)
- [x] eslint.config.js (ESLint v10 flat config)
- [x] Security scan script
- [x] .env.example fully documented

### Phase 2 — Space Agent Integration ✅
- [x] space-agent added as git submodule at `space-agent/`
- [x] Fanni registered as named persona in space-agent (agents/fanni.yaml, prompts/agent-fanni-system.md, avatar-config.js)
- [x] Customware layer created (`customware/`) — skills, memory, ext/js hooks
- [x] `npm run space:dev` launches space-agent with CUSTOMWARE_PATH=./customware
- [x] Server-side sidecar (port 3001) remains for voice + workflow API

### Phase 3 — Supabase Auth and Tenant Isolation ✅
- [x] Supabase client in useAuth.js (publishable key only)
- [x] signIn, signInWithMagicLink, signOut
- [x] bootstrapWorkspace() → bootstrap_fanni_workspace() RPC
- [x] Auth page (password + magic link modes)
- [x] RLS migrations (4 migration files)
- [x] is_member(), has_role() SECURITY DEFINER functions
- [x] Cross-workspace reads blocked at database layer

### Phase 4 — Space Agent Session Runtime ✅
- [x] fanniRuntime.js (runFanniDemo, timeTravelFanni) — kept in server/runtime/ for sidecar
- [x] ICM runtime (createContextManifest, validateContextManifest)
- [x] Mounted in Space Agent shell via persona registration + customware ext hooks

### Phase 5 — Provider Adapters and Model Routing ✅
- [x] OpenAI adapter (classification, synthesis, report)
- [x] ElevenLabs adapter (TTS + STT)
- [x] Fal adapter (Wizper STT + TTS)
- [x] routeProvider() with timeout, retry, fallback chain
- [x] Voice API routes (/api/voice/transcribe, /api/voice/synthesize)
- [x] models.yaml routing config

### Phase 6 — Real Workflow Execution ✅ (synthetic)
- [x] Declarative cog engine (validateCog, runCog, full state machine)
- [x] media-intelligence-weekly.yaml cog (8 stages)
- [x] Context manifest validated before each workflow run
- [x] Supabase workflow_run records created and updated
- [x] Audit events written per run
- [x] Real client data gate (FANNI_ALLOW_REAL_CLIENT_DATA)

### Phase 7 — Checkpoint, Rollback, and Beads ✅
- [x] createCheckpoint / listCheckpoints / restoreCheckpoint
- [x] Cross-workspace rollback denied
- [x] Safety snapshot before restore
- [x] Beads ledger (createWorkItem, updateWorkItem, getReadyWork)
- [x] Dependency graph promotion
- [x] Durable writes (Supabase fire-and-forget secondary)
- [x] DB migration: fanni.checkpoints, fanni.work_items, fanni.rollback_events

### Phase 8 — Voice Input and Speech Output ✅
- [x] MediaRecorder capture (webm/ogg fallback)
- [x] 2-minute max duration, 10 MB limit
- [x] Transcript fetched from /api/voice/transcribe
- [x] TTS playback from /api/voice/synthesize
- [x] Language header (X-Fanni-Language) passed with request
- [x] Auth token passed (Bearer JWT)

### Phase 9 — Final Fanni Application UI/UX ✅
- [x] ChatApp.jsx (full chat interface)
- [x] Avatar.jsx (11 states, ring colors, waveform)
- [x] VoiceInput.jsx
- [x] OperatorDrawer.jsx (work item, provider, checkpoints, evidence, heartbeat)
- [x] Rollback confirmation dialog
- [x] EN/ES suggested prompts
- [x] Safe markdown rendering

### Phase 10 — Landing Page ✅
- [x] All locked copy present
- [x] Hero: "Your business finally has someone watching everything."
- [x] Trust strip (Bilingual by design / Private by default / Every consequential action has a return point)
- [x] Sovereignty block (Your context. / Your workflows. / Your data. / Your agent.)
- [x] Capability marquee
- [x] How it works (4 stages)
- [x] Time travel / checkpoint timeline
- [x] Use cases grid
- [x] Final CTA, footer, privacy + status links
- [x] EN/ES language toggle

### Phase A — Full Environment Configuration ✅
- [x] Provider routing contract expanded for DeepSeek, Groq, Cohere, ElevenLabs, OpenAI, Supabase
- [x] `/api/health` endpoint verifies configured provider matrix
- [x] Safety gates default fail-closed

### Phase B — Avatar Character Design ✅
- [x] Stylized 3D Mexican female avatar asset generated (`public/avatars/fanni-a.png`)
- [x] Orbital ring state animations (idle, listening, thinking, speaking, working)
- [x] Preserved UI avatar container with smooth fallback rendering

### Phase C — Voice & Lip Sync Integration ✅
- [x] ElevenLabs voice audio synthesis route `/api/voice/synthesize`
- [x] Audio waveform spectrum visualization bound to avatar speaking state
- [x] Viseme timing hooks integrated

### Phase D — Automated Deployment Setup ✅
- [x] Deployment specification doc (`docs/DEPLOYMENT_SPEC.md`)
- [x] Vercel frontend build target (`dist/`)
- [x] Hostinger VPS process manager configuration

### Phase E — Production Acceptance ✅
- [x] Security scan passed (`npm run security:scan`)
- [x] 19/19 runtime tests passing (`npm test`)
- [x] Production build validation passed (`npm run validate:production`)
