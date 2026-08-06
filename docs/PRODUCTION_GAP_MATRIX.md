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

### Phase 2 — Space Agent Integration ⛔
- [ ] space-agent runtime mount — **BLOCKED: repo not accessible in session**
- [ ] Fanni session inside Space Agent shell — **BLOCKED**
- [x] Server-side adapters designed for Space Agent handoff interface

### Phase 3 — Supabase Auth and Tenant Isolation ✅
- [x] Supabase client in useAuth.js (publishable key only)
- [x] signIn, signInWithMagicLink, signOut
- [x] bootstrapWorkspace() → bootstrap_fanni_workspace() RPC
- [x] Auth page (password + magic link modes)
- [x] RLS migrations (4 migration files)
- [x] is_member(), has_role() SECURITY DEFINER functions
- [x] Cross-workspace reads blocked at database layer

### Phase 4 — Space Agent Session Runtime ⛔
- [x] fanniRuntime.js (runFanniDemo, timeTravelFanni)
- [x] ICM runtime (createContextManifest, validateContextManifest)
- [ ] Mounted in Space Agent shell — **BLOCKED**

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

### Phase 11 — Deployment, Operations, and Security ⛔
- [x] CI verify workflow (lint, typecheck, security scan, validate, test, build)
- [ ] Vercel frontend deployment — **BLOCKED: no credentials**
- [ ] Hostinger VPS runtime deployment — **BLOCKED: no SSH credentials**
- [ ] Custom domain / DNS — **BLOCKED**

### Phase 12 — Production Acceptance ⛔
- [x] Security scan passes
- [x] All tests pass (19/19)
- [x] Build succeeds
- [x] Production validation passes
- [ ] Live auth roundtrip — **BLOCKED: no live Supabase secrets configured**
- [ ] Live voice test — **BLOCKED: no provider API keys configured**
- [ ] Live workflow with real data — **BLOCKED: REAL_CLIENT_DATA_ENABLED=false by policy**
- [ ] Deployed URL accessible — **BLOCKED: Phase 11 blocked**
