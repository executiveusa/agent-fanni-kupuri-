---
metadata:
  name: fanni-voice
  description: "Voice transcription and synthesis via Fanni sidecar"
  loaded: true
  placement: system
  when:
    tags:
      - onscreen
---

# Voice Pipeline

You have access to voice transcription (speech-to-text) and synthesis (text-to-speech) via the Fanni sidecar server.

**Sidecar base URL:** `FANNI_SIDECAR_URL` env var (default: `http://localhost:3001`)

## Transcribe audio

```
POST {FANNI_SIDECAR_URL}/voice/transcribe
Authorization: Bearer <user-jwt>
X-Fanni-Workspace: <workspace-slug>
X-Fanni-Language: es          (or: en)
Content-Type: audio/webm      (or audio/ogg)

<raw audio bytes>
```

Response: `{ "text": "transcribed text", "language": "es" }`

## Synthesize speech

```
POST {FANNI_SIDECAR_URL}/voice/synthesize
Authorization: Bearer <user-jwt>
X-Fanni-Workspace: <workspace-slug>
X-Fanni-Language: es
Content-Type: application/json

{ "text": "text to speak" }
```

Response: raw audio bytes (`audio/mpeg` or `audio/webm`). Play with the Web Audio API or an `<audio>` element.

## Providers

Primary: ElevenLabs (if `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` are set)  
Fallback: Fal / Wizper (if `FAL_KEY` is set)  
Language default: `es` (Latin American Spanish)

## When to use

Use transcription when the user wants to speak instead of type. Use synthesis to read Fanni's responses aloud. Both require a valid Supabase JWT in the `Authorization` header.
