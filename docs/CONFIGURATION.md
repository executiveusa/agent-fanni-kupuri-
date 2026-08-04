# Agent Fanny Configuration Wiring

## Configuration layers

Agent Fanny separates configuration into four classes:

1. **Public build configuration** — safe browser values prefixed with `VITE_`.
2. **Server secrets** — available only to the Hostinger runtime or server functions.
3. **Workspace policy** — stored in the isolated `fanny` Supabase schema.
4. **Local runtime configuration** — QVAC, SpeakFlow, Space Agent, models, and device permissions.

Never expose service-role keys, provider secrets, publishing tokens, or signing secrets through `VITE_*` variables.

## Vercel frontend

Required public variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FANNY_API_BASE_URL=
VITE_FANNY_ENV=preview
VITE_EXTERNAL_WRITES_ENABLED=false
VITE_REAL_CLIENT_DATA_ENABLED=false
```

Vercel hosts only the presentation and authenticated control plane. It must not receive QVAC model files or local captures.

## Hostinger runtime

Server-only variables:

```env
NODE_ENV=production
PORT=7744
FANNY_PUBLIC_ORIGIN=
FANNY_DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FANNY_JWT_SIGNING_SECRET=
FANNY_WEBHOOK_SIGNING_SECRET=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
POSTIZ_API_URL=
POSTIZ_API_KEY=
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
QVAC_BASE_URL=http://127.0.0.1:8080/v1
SPACE_AGENT_BASE_URL=http://127.0.0.1:7860
SPEAKFLOW_MCP_URL=http://127.0.0.1:8765
EXTERNAL_WRITES_ENABLED=false
REAL_CLIENT_DATA_ENABLED=false
```

The runtime should bind privately and be exposed through Caddy only at an approved API hostname. Provider adapters must refuse writes unless both the environment flag and workspace database policy are enabled.

## Supabase isolation

The migration creates a dedicated `fanny` schema containing:

- organizations;
- memberships;
- workspaces;
- workflow runs;
- signals;
- approvals;
- audit events.

Every operational table includes `organization_id`; workspace data includes `workspace_id`. RLS checks membership and role. Do not query Botanic Memories application tables from Agent Fanny.

Recommended initial records:

- organization: `kupuri-media`;
- workspace: `agent-fanny-demo`;
- data class: `synthetic`;
- external writes: `false`.

## Local runtime

Local services communicate over loopback only:

```text
SpeakFlow MCP -> Fanny Orchestrator -> QVAC local inference
                              |-> Space Agent computer-use adapter
                              |-> encrypted local evidence store
                              |-> Hostinger control API for approved metadata only
```

Raw screenshots, recordings, credentials, and confidential source content remain local. The cloud control plane receives only approved redacted manifests, status, metrics, and reports.

## Secret installation order

1. Deploy synthetic frontend with all write flags false.
2. Apply and test the Supabase migration.
3. Configure Supabase public URL and anon key in Vercel.
4. Deploy Hostinger runtime with no provider tokens.
5. Set signing secrets and validate frontend-to-runtime authentication.
6. Connect local QVAC, SpeakFlow, and Space Agent endpoints.
7. Add ElevenLabs only after the voice adapter works with a placeholder.
8. Add Postiz/Facebook/Meta credentials one provider at a time.
9. Run read-only tests.
10. Enable a single bounded external-write policy after independent review.

## Required verification

- Vercel build succeeds.
- No server secret appears in frontend assets.
- Cross-organization queries return no rows.
- Non-members receive no workspace data.
- External write requests fail while either gate is false.
- Audit events are generated for every workflow transition.
- Local inference works with internet disconnected.
- Rollback returns the workflow to its prior stage.
