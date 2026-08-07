# Agent Fanni — Kupuri Media

Agent Fanni is a Mexico-first, WhatsApp-oriented, local-and-cloud operations and signal-intelligence agent.

She combines a simple public business interface, a Space Agent operating workspace, governed specialist agents, permissioned application connections, social operations, evidence-led listening, approvals, checkpoints, rollback, measurement, and bilingual communication.

## Product surfaces

### Public editorial site

The public website explains Fanni through business programs, active assignments, evidence-led project pages, Signal Lab research, paid offers, and build-in-public updates.

- Full-body stylized cartoon Fanni
- COLLINS-inspired editorial hierarchy without copied COLLINS assets
- Fanni Demand, Fanni Reputation, and Fanni Operations programs
- Active assignment, pilot, lab, internal, private, and case-study publication states
- Space Agent hover/focus/click/touch overlay
- Stripe and Creem hosted checkout contracts
- Approval-controlled Supabase publication layer
- Eight-loop public site gauntlet

See [`docs/FANNI_PUBLIC_SITE.md`](docs/FANNI_PUBLIC_SITE.md).

### Space Agent workspace

The authenticated workspace provides:

- Focus-first home
- Conversational work surface
- App connections
- Approvals
- History and return points
- Voice and model routing
- Client and workspace isolation

### Fanni Pulso

Fanni Pulso is the LATAM Signal Operating System architecture:

- Public and authorized signal listening
- Coverage ledgers
- Corroboration and regional context
- Independent verification
- Approved action
- Reconciliation and measurement
- Local, cloud, or hybrid execution
- World Monitor commercial-license boundary

See [`docs/FANNI_PULSO_LATAM_SIGNAL_OS.md`](docs/FANNI_PULSO_LATAM_SIGNAL_OS.md).

## Core identity files

- [`HEART.md`](HEART.md) — purpose, values, sovereignty, commercial principles, and non-negotiable boundaries
- [`PERSONA.md`](PERSONA.md) — voice, bilingual behavior, business judgment, delegation style, and computer-use conduct
- [`HEARTBEAT.md`](HEARTBEAT.md) — recurring sensing, prioritization, action, verification, memory, and escalation
- [`AGENTS.md`](AGENTS.md) — ICM constitution and context-loading rules

## Production architecture

- Frontend: Vercel
- Agent/API runtime: Node sidecar, targeted to Hostinger VPS or another controlled runtime
- Data plane: Supabase project `botanic-creations`, isolated `fanni` schema with RLS
- Social operations: Zernio contract with Postiz fallback path
- App connections: Composio workspace-scoped sessions
- Voice: ElevenLabs/Fal/local adapters
- Local intelligence: QVAC/OpenAI-compatible adapter
- Computer use: bounded Space Agent adapter
- Payments: Stripe for primary Mexico/MXN routing; Creem for international Merchant-of-Record routing

## Safety defaults

- External writes disabled by default
- Real client data disabled by default
- Workspace identity required
- Cross-workspace memory denied
- Consequential actions require policy and, where configured, human approval
- Checkpoint before approved external action
- Completion requires external-state verification where possible
- Payment redirect never grants access
- Billing entitlement changes require a verified signed provider webhook
- Public case studies require permission and evidence

## Verification

Run the complete release gate:

```bash
npm run check
```

It executes:

1. secret and security scan;
2. production configuration validation;
3. Fanni public site gauntlet;
4. automated test suite;
5. Vite production build.

Useful commands:

```bash
npm run gauntlet:site
npm run test
npm run build
npm run pulso:demo
npm run zernio:check
```

## Current release status

The application is deployed on Vercel and the `fanni` Supabase schema is active.

Implemented foundations include:

- focus-first application shell;
- Composio connection architecture;
- Zernio social-operations contracts;
- Fanni Pulso orchestration and three deterministic proof demos;
- public editorial site and full-body character;
- governed public-project and Signal Lab schema;
- hosted Stripe/Creem checkout code and signed webhook processing;
- automated public-site gauntlet.

Credential-dependent capabilities are not falsely marked complete. Live WhatsApp Business, live World Monitor data, Stripe products, Creem products, Zernio accounts, Composio accounts, and licensed enterprise sources require account authorization, secrets, webhook configuration, and runtime deployment.

## Documentation

- [`docs/FANNI_PUBLIC_SITE.md`](docs/FANNI_PUBLIC_SITE.md)
- [`docs/FANNI_PULSO_LATAM_SIGNAL_OS.md`](docs/FANNI_PULSO_LATAM_SIGNAL_OS.md)
- [`docs/WORLDMONITOR_INTEGRATION_BOUNDARY.md`](docs/WORLDMONITOR_INTEGRATION_BOUNDARY.md)
- [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)
- [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md)
- [`docs/WORKFLOW_MAP.md`](docs/WORKFLOW_MAP.md)
- [`STATUS.md`](STATUS.md)
