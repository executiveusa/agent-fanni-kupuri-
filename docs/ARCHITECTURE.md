# Agent Fanni — Architecture

## System overview

Agent Fanni is a bilingual (EN/ES) AI workspace agent deployed as a Vite + React 19 frontend with a pure Node.js HTTP runtime backend. It runs in isolation per organization and workspace, enforcing tenant boundaries at the database layer via Supabase RLS.

## Deployment topology

```
Browser (Vite SPA)          Runtime (Node.js)         Supabase (Postgres + Auth)
  src/pages/                  server/index.js            fanni schema
  src/components/       →     server/routes/       →     RLS policies
  src/runtime/ (client)       server/adapters/           is_member()
                              server/middleware/          has_role()
```

- **Frontend**: Deployed to Vercel. Hash-based routing (`#/`, `#/auth`, `#/app`, `#/privacy`, `#/status`).
- **Runtime**: Deployed to Hostinger VPS. Exposes `/api/health`, `/api/voice/transcribe`, `/api/voice/synthesize`, `/api/workflow/run`, `/api/workflow/runs`.
- **Database**: Supabase project `botanic-creations` (ref: cyxdevcjycmffhmwxojh), `fanni` schema.

## Frontend modules

| Path | Purpose |
|------|---------|
| `src/main.jsx` | App root, hash router, context providers |
| `src/pages/Landing.jsx` | Public landing page |
| `src/pages/Auth.jsx` | Sign-in (password + magic link) |
| `src/pages/ChatApp.jsx` | Main agent interface |
| `src/components/Avatar.jsx` | State-aware avatar (11 states) |
| `src/components/VoiceInput.jsx` | MediaRecorder → STT → transcript |
| `src/components/OperatorDrawer.jsx` | Work item, provider, checkpoint panel |
| `src/hooks/useAuth.js` | Supabase auth session management |
| `src/hooks/useLanguage.js` | EN/ES language context |
| `src/i18n/en.js`, `es.js` | Translation strings |

## Runtime modules

| Path | Purpose |
|------|---------|
| `src/runtime/cogEngine.js` | Declarative workflow state machine |
| `src/runtime/providerRouter.js` | Provider failover with timeout/retry |
| `src/runtime/icmRuntime.js` | Identity Context Manifest (ICM) |
| `src/runtime/checkpoints.js` | Checkpoint create/restore (localStorage + Supabase) |
| `src/runtime/beadsLedger.js` | Work item lifecycle (localStorage + Supabase) |
| `src/runtime/memoryGuard.js` | Cross-workspace denial + injection detection |
| `src/runtime/fanniRuntime.js` | runFanniDemo orchestration |
| `src/runtime/workflowEngine.js` | Media intelligence workflow |
| `src/runtime/heartbeat.js` | Heartbeat signal |
| `src/runtime/persistence.js` | Supabase write helpers |

## Database schema (`fanni`)

Tables: `organizations`, `memberships`, `workspaces`, `workflow_runs`, `signals`, `approvals`, `audit_events`, `heartbeat_events`, `provider_attempts`, `memory_entries`, `evaluation_runs`, `context_manifests`, `work_items`, `checkpoints`, `rollback_events`, `persona_versions`.

Key security functions:
- `fanni.is_member(workspace_id)` — SECURITY DEFINER, checks membership
- `fanni.has_role(workspace_id, role)` — SECURITY DEFINER, checks role
- `fanni.bootstrap_fanni_workspace(...)` — SECURITY DEFINER, onboarding

All tables have RLS enabled. Cross-workspace reads fail at the database layer.

## Provider routing

```
Route config (production/models.yaml)
  ↓
providerRouter.js → routeProvider()
  ├── Primary adapter (FAL / ElevenLabs / OpenAI)
  ├── Timeout + retry with exponential backoff
  └── Fallback chain on failure
```

Voice pipeline:
- STT primary: Fal Wizper (`fal-ai/wizper`)
- STT fallback: ElevenLabs Scribe V2
- TTS primary: ElevenLabs Turbo v2.5
- TTS fallback: Fal TTS

## ICM and checkpoint invariants

- Every workflow stage creates a `createCheckpoint` before execution
- Rollback creates a safety snapshot of current state before restoring target
- Cross-workspace rollback throws immediately
- `memoryGuard.selectMemory` excludes cross-workspace records and flags injection signals

## Safety gates

- `EXTERNAL_WRITES_ENABLED=false` by default
- `REAL_CLIENT_DATA_ENABLED=false` by default
- Service-role keys stay server-side only (never `VITE_` prefix)
- Browser only receives publishable/anonymous Supabase key
