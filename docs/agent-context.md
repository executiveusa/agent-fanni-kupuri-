# Agent Fanni Kupuri — Agent Context Memory

## Repository Purpose
Sovereign AI media intelligence & operations agent platform for Kupuri Media. Integrates multi-provider LLMs, native Mexican Spanish voice synthesis (ElevenLabs), 3D Mexican female lip-sync avatar, Supabase RLS isolation, and 8-stage media intelligence pipelines.

## Tech Stack
- **Frontend**: React 19 + Vite (port 5173 / 4173), Lucide icons, native WebAudio & canvas lip-sync waveforms.
- **Backend / Sidecar**: Node.js custom HTTP router (port 3001), multi-provider LLM failover router, ElevenLabs & Fal STT/TTS adapters.
- **Agent Shell Submodule**: `space-agent` (`caec19a9` checked out at `space-agent/`).
- **Database**: Supabase PostgreSQL (`fanni` schema) with RLS policies, audit logs, and workspace isolation.

## Configured API Providers (Vault Key Matrix)
- **OpenAI**: `sk-proj-...` (`OPENAI_API_KEY`, `gpt-4o`, `gpt-4o-mini`)
- **DeepSeek**: `sk-4ed09af1...` (`DEEPSEEK_API_KEY`, `deepseek-chat`) — Primary LLM
- **Groq**: `gsk_2FDF1V3x...` (`GROQ_API_KEY`, `llama-3.3-70b-versatile`)
- **Cohere / Command Code**: `user_3TtvqWd...` (`COHERE_API_KEY`, `COMMAND_R_API_KEY`, `COMMAND_CODE_API`, `command-r-plus`)
- **Anthropic**: `sk-ant-api03-...` (`ANTHROPIC_API_KEY`, `claude-3-5-sonnet`)
- **OpenRouter**: `sk-or-v1-...` (`OPEN_ROUTER_API`, `OPENROUTER_API_KEY`)
- **ElevenLabs**: `sk_255591c8...` (`ELEVENLABS_API_KEY`, Voice ID `21m00Tcm4TlvDq8ikWAM`, `eleven_multilingual_v2`)
- **Fal AI**: `9f7a5a93...` (`FAL_KEY`)
- **Supabase**: `https://kbphngxqozmpfrbdzgca.supabase.co` (`SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY`)

## Key Endpoints Tested & Verified
- `GET /health` & `GET /api/health` — Returns `status: ok`, `supabaseConfigured: true`, and all 8 provider statuses (`openai`, `deepseek`, `groq`, `cohere`, `anthropic`, `openrouter`, `elevenlabs`, `fal`).
- `POST /api/chat` — Live LLM chat completion routed to DeepSeek in native Mexican Spanish.
- `POST /api/voice/synthesize` — Live ElevenLabs speech synthesis returning 24,898 bytes MP3 audio.
- `POST /api/workflow/run` — 8-stage media intelligence pipeline execution returning report, metrics, and heartbeat.

## Commands
- Dev Server: `npm run dev`
- Sidecar Server: `node server/index.js`
- Full Validation: `npm run check`
- Unit Tests: `npm test`
- Build: `npm run build`
