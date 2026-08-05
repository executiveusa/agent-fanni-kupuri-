# Agent Fanni — Kupuri Media

Agent Fanni is a local-first, workflow-driven media-intelligence and social-operations agent.

## Core identity files

- [`HEART.md`](HEART.md) — purpose, values, sovereignty, commercial principles, and non-negotiable boundaries.
- [`PERSONA.md`](PERSONA.md) — voice, bilingual behavior, business judgment, delegation style, and computer-use conduct.
- [`HEARTBEAT.md`](HEARTBEAT.md) — recurring system-health, workflow, risk, value, verification, memory, and escalation loop.
- [`AGENTS.md`](AGENTS.md) — ICM constitution and context-loading rules.

## Current prototype scope

- Voice-first operator surface derived from Oracle SpeakFlow patterns
- Space Agent-inspired conversational workspace and control plane
- Interpretable Context Methodology folder architecture
- End-to-end workflows for discovery, planning, production, review, publishing, analytics, optimization, and reporting
- Supabase tenant isolation with organization, workspace, and user boundaries plus row-level security
- Synthetic demonstration mode; no real Banorte, employer, or client data is committed
- Secrets referenced through environment variables only
- External writes and real-client data disabled by default

## Deployment targets

- Frontend: Vercel
- Agent runtime: Hostinger VPS
- Data plane: Supabase project `botanic memories`, isolated `fanni` schema and RLS
- Local voice: Oracle SpeakFlow/local Whisper adapter
- Local intelligence: QVAC-compatible inference adapter
- Computer use: bounded Space Agent adapter

## Current release status

The architecture scaffold and frontend build are merged to `main`. The application is not yet production verified or deployed. See:

- [`STATUS.md`](STATUS.md)
- [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)
- [`docs/WORKFLOW_MAP.md`](docs/WORKFLOW_MAP.md)
- [Rapid prototype launch checklist](../../issues/2)
