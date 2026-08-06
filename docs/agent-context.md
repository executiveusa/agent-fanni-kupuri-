# Agent Fanni — System Context Memory

## Repository Purpose
Agent Fanni (Kupuri Media) is a sovereign media-intelligence AI agent web app featuring deterministic workflow execution, an executable heartbeat, multi-provider API integrations, and Spanish (Mexican Spanish primary) / English i18n support.

## Stack
- **Frontend**: React + Vite, Vanilla CSS design system
- **Backend/Sidecar**: Node.js / Express API (`/server`), Supabase client (`/src/runtime/persistence.ts` / `persistence.js`)
- **Indexing & Tools**: jCodeMunch MCP registered and active
- **i18n**: Native Mexican Spanish (es-MX) default + English (en) context and translations

## API Connections & Adapters
1. **OpenAI**: Classification (`gpt-4o-mini`), Synthesis & Reports (`gpt-4o`)
2. **DeepSeek**: Reasoner & Chat (`deepseek-chat`)
3. **Groq**: Llama 3.3 70B Versatile fast inference (`llama-3.3-70b-versatile`)
4. **Command R / Cohere**: Structured retrieval and grounded generation (`command-r-plus`)
5. **ElevenLabs**: TTS Voice pipeline (`eleven_multilingual_v2`, voice synthesis)
6. **Supabase**: Persistent evidence and heartbeat logging (`cyxdevcjycmffhmwxojh`)
7. **QVAC / FAL**: Local/external media generation fallback hooks

## 3D Lip-Sync Female Avatar Pipeline
- **Recommended 3D Model**: Sexy Spanish Female Avatar supporting Viseme Lip-Sync (WebGL / Ready Player Me / Three.js canvas setup).
- **Audio-Driven Lipsync**: Viseme morph target mapping for ElevenLabs real-time audio streams.
- **Current State**: UI avatar container preserved using stylized visual card until live 3D GLTF canvas container is activated in the next step.

## Recent Changes & Squash Merge Verification
- All commits from PR #10 have been squashed into a single clean commit on `main`: `7527e40` (`feat: consolidate PR #10 persistence, heartbeat, multi-provider APIs and runtime state updates`).
- Verified zero test regressions (`npm test` — 19/19 passing).

## Verification Commands
- `npm test`
- `npm run build`
- `git status`
