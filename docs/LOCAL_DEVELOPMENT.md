# Local Development — Agent Fanni

## Prerequisites

- Node.js 22+
- A Supabase project (ref: cyxdevcjycmffhmwxojh for production, or your own for dev)
- (Optional) ElevenLabs API key + voice ID for TTS
- (Optional) Fal API key for STT

## Setup

```bash
# Clone and install
git clone https://github.com/executiveusa/agent-fanni-kupuri-.git
cd agent-fanni-kupuri-
npm install

# Copy environment template
cp .env.example .env.local
# Fill in the values — see .env.example for all variables
```

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Supabase anon/publishable key |
| `VITE_FANNI_API_BASE_URL` | Frontend | Runtime server URL (e.g. `http://localhost:3001`) |
| `SUPABASE_URL` | Server | Same as VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | **Never commit.** Supabase service role key |
| `ELEVENLABS_API_KEY` | Server | ElevenLabs for TTS/STT |
| `ELEVENLABS_VOICE_ID` | Server | Voice ID for Fanni |
| `FAL_KEY` | Server | Fal for Wizper STT and TTS fallback |
| `PORT` | Server | Default 3001 |

`VITE_` prefix variables are bundled into the browser — only use publishable/anonymous values.

## Supabase migrations

Run migrations against your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually via Supabase SQL editor
# Files in supabase/migrations/ ordered by timestamp
```

## Running locally

```bash
# Terminal 1: start frontend
npm run dev

# Terminal 2: start runtime server
npm run server

# Browser: http://localhost:5173
```

The frontend runs on Vite dev server (port 5173 by default).
The runtime server runs on port 3001 by default.

## Validation and tests

```bash
npm run security:scan       # check no secrets in tracked files
npm run lint                # ESLint (0 warnings enforced)
npm run typecheck           # TypeScript checkJs
npm run validate:production # production config checks
npm run validate:migrations # migration file structure check
npm test                    # 19 unit tests
npm run build               # production build
npm run check               # all of the above in sequence
```

## E2E testing

E2E tests require a live Supabase instance and deployed runtime. Set the env vars and run:

```bash
# Not yet automated — test manually:
# 1. Register/sign in via #/auth
# 2. Send a message in #/app and verify workflow executes
# 3. Click Operator drawer and verify checkpoints appear
# 4. Test voice input (requires microphone permission)
# 5. Test rollback to a previous checkpoint
```

## Avatar images

Place portrait images at:
- `public/avatars/fanni-a.png`
- `public/avatars/fanni-b.png`
- `public/avatars/fanni-c.png`

Set `VITE_FANNI_AVATAR_VARIANT=a` (or b/c) to select the default.
If images are absent, an SVG fallback renders automatically.

## Common issues

**"Supabase not configured"** — check `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in `.env.local`.

**"API not configured"** — set `VITE_FANNI_API_BASE_URL=http://localhost:3001` so the frontend can reach the runtime.

**"Microphone access denied"** — voice input requires HTTPS in production. Locally, allow microphone on `localhost`.

**Voice synthesis returns 404** — runtime server is not running. Start it with `npm run server`.
