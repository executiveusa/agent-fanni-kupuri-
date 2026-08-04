# Agent Fanni — Kupuri Media

Agent Fanni is a local-first, workflow-driven media intelligence and social operations agent.

## Current prototype scope

- Voice-first operator surface derived from Oracle SpeakFlow patterns
- Space Agent-inspired conversational workspace and control plane
- Interpretable Context Methodology (ICM) folder architecture
- End-to-end workflows for discovery, planning, production, review, publishing, analytics, optimization, and reporting
- Supabase tenant isolation with project/workspace/user boundaries and row-level security
- Synthetic demonstration mode; no real Banorte or employer data is committed
- Secrets are referenced through environment variables only

## Deployment targets

- Frontend: Vercel
- Agent runtime: Hostinger VPS
- Data plane: Supabase project `botanic memories`, isolated schema and RLS
- Local voice: Oracle SpeakFlow/local Whisper adapter

## Status

Architecture scaffold. Not yet production verified. See `STATUS.md` and `docs/BUILD_PLAN.md`.
