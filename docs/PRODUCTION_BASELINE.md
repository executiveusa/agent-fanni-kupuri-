# Production Baseline — Agent Fanni v0.3.0

## Completion status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Hash-based routing (#/, #/auth, #/app, #/privacy, #/status) | ✅ Complete | src/main.jsx |
| Supabase auth (password + magic link) | ✅ Complete | src/hooks/useAuth.js |
| RLS tenant isolation | ✅ Complete | 4 migration files |
| Bilingual EN/ES interface | ✅ Complete | src/i18n/en.js, es.js |
| Avatar component (11 states) | ✅ Complete | src/components/Avatar.jsx |
| Voice input (STT via API) | ✅ Complete | src/components/VoiceInput.jsx |
| Voice output (TTS via API) | ✅ Complete | server/routes/voice.js |
| Declarative cog execution | ✅ Complete | src/runtime/cogEngine.js |
| Checkpoint + rollback | ✅ Complete | src/runtime/checkpoints.js |
| Beads observability | ✅ Complete | src/runtime/beadsLedger.js |
| ICM enforcement | ✅ Complete | src/runtime/icmRuntime.js |
| Provider routing + failover | ✅ Complete | src/runtime/providerRouter.js |
| Memory guard (cross-workspace + injection) | ✅ Complete | src/runtime/memoryGuard.js |
| Landing page (all 10 sections) | ✅ Complete | src/pages/Landing.jsx |
| Production build (Vite) | ✅ Complete | dist/ |
| CI verify workflow | ✅ Complete | .github/workflows/verify.yml |
| Security scan | ✅ Complete | scripts/security-scan.mjs |
| Migration validation | ✅ Complete | scripts/validate-migrations.mjs |
| 19 tests passing | ✅ Complete | tests/ |
| Lint (0 warnings) | ✅ Complete | eslint.config.js |
| Typecheck (0 errors) | ✅ Complete | tsconfig.json |
| Space Agent runtime integration | ⛔ Blocked | space-agent repo not accessible in this session |
| Vercel deployment | ⛔ Blocked | No Vercel credentials provided |
| Hostinger VPS deployment | ⛔ Blocked | No SSH credentials provided |
| Avatar image files | ⛔ Blocked | fal.media returned 403; SVG fallback active |

## External blockers (hard stops)

These require out-of-band action by a workspace owner or Kupuri Media admin:

1. **Space Agent repo access** — `executiveusa/space-agent` must be enabled for this session to install the Fanni runtime into the Space Agent shell.
2. **Vercel credentials** — `VERCEL_TOKEN` and project link required to deploy the frontend.
3. **Hostinger VPS credentials** — SSH access required to deploy `server/index.js`.
4. **Avatar images** — `/avatars/fanni-{a,b,c}.png` must be manually uploaded to `public/avatars/`. SVG fallback renders in the meantime.
5. **Live Supabase secrets** — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `FAL_KEY` must be set in the deployment environment. No values are committed.

## Design system verification

All 15 locked CSS tokens are present in `src/styles.css`:
- `--fanni-obsidian: #0B0A0C` ✅
- `--fanni-black: #121014` ✅
- `--fanni-ivory: #F3EEE6` ✅
- `--fanni-paper: #E7DED3` ✅
- `--fanni-merlot: #4C1027` ✅
- `--fanni-wine: #741C43` ✅
- `--fanni-rose: #C58A9E` ✅
- `--fanni-orchid: #B84DFF` ✅
- `--fanni-orchid-soft: #D5A4FF` ✅
- `--fanni-chartreuse: #D7FF3F` ✅
- `--fanni-smoke: #777078` ✅
- `--fanni-border: rgba(243, 238, 230, 0.16)` ✅
- `--fanni-success: #64D98B` ✅
- `--fanni-warning: #FFBE55` ✅
- `--fanni-danger: #FF6B72` ✅

Locked hero copy present in `src/i18n/en.js` ✅
Sovereignty lines present in `src/i18n/en.js` ✅
Canonical name: "Fanni" (never Fanny/Fannie/Franny) ✅
Canonical org: "Kupuri Media" (never KupuriMedia/Kupuri Digital) ✅

## Security gate verification

- No `.env` files tracked by git ✅
- No OpenAI, ElevenLabs, or Fal keys in tracked files ✅
- No `VITE_` prefix on server-only secrets ✅
- `EXTERNAL_WRITES_ENABLED=false` default ✅
- `REAL_CLIENT_DATA_ENABLED=false` default ✅
- RLS enabled on all fanni schema tables ✅
- `fanni.is_member()` / `fanni.has_role()` are SECURITY DEFINER ✅
