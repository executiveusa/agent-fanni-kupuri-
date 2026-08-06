# Fanni Pulso — LATAM Signal Operating System

## Product thesis

Fanni Pulso is a WhatsApp-native, local-first intelligence and action system for Latin America. It is not a dashboard that waits for a trained analyst. It is a sovereign company-and-community agent that continuously senses approved signals, verifies what is real, explains why it matters locally, asks for approval when needed, acts through connected tools, measures the result, and improves the playbook.

**One-line promise:**

> Ask Fanni what is changing around your business or community, why it matters, and what to do next — in a WhatsApp voice note.

## The zero-to-one idea

Existing products usually occupy one category:

- social-listening dashboard;
- WhatsApp sales or support bot;
- OSINT or global-risk dashboard;
- company knowledge assistant;
- workflow automation platform;
- local desktop agent.

Fanni Pulso combines these into a new operating model:

1. **A private Signal Twin** for every company, person, or community.
2. **A single WhatsApp front door** for questions, voice notes, images, locations, approvals, and reports.
3. **A governed Council of specialist agents** behind one recognizable Fanni identity.
4. **A Reality Loop** that must corroborate trends before recommending action.
5. **Action Receipts** that show evidence, uncertainty, permissions, changes, results, and rollback.
6. **An optional Signal Commons** that shares only privacy-preserving regional aggregates across participants, never raw client data.
7. **Local/cloud portability** so the user owns the intelligence, skills, memory, and provider choices.

The defensible asset is not a chatbot. It is the growing, permissioned, region-specific graph connecting:

- public events;
- local language and culture;
- customer intent;
- business operations;
- verified outcomes;
- reusable actions.

## Why LATAM and why WhatsApp

Fanni begins where people already work. For many Mexican and LATAM businesses, that is WhatsApp rather than a new enterprise dashboard.

The default experience is deliberately simple:

```text
User: Fanni, what changed today that could hurt or help my hotel?

Fanni:
Three things matter.
1. Airport-delay discussion rose across 14 sources.
2. Six guests asked about transfers in WhatsApp.
3. A nearby competitor published a reassurance post two hours ago.

Confidence: High
Missing coverage: TikTok public search

Recommended action:
Send a bilingual arrival update to tomorrow's guests.

[Review message] [Approve] [Keep watching]
```

The user should never need to understand APIs, embeddings, queues, model routing, or agent delegation.

## Fanni's eight arms

The cartoon octopus is functional product language, not decoration. Each arm represents one permanent capability:

1. **Listen** — collect approved public, social, customer, operational, and community signals.
2. **Verify** — deduplicate, corroborate, score source quality, and expose missing coverage.
3. **Understand** — interpret Mexican and local context, language, geography, regulation, seasonality, and culture.
4. **Decide** — rank risks, opportunities, and the smallest reversible response.
5. **Act** — use Composio, Zernio, WhatsApp, CLI tools, CRM, email, files, calendars, and approved internal systems.
6. **Measure** — connect actions to bookings, sales, resolution time, engagement, avoided loss, or public benefit.
7. **Protect** — enforce identity, workspace isolation, budgets, approvals, audit trails, and rollback.
8. **Learn** — turn human feedback and measured outcomes into versioned skills and evals.

## God-tier means governed orchestration

Fanni is not granted universal access. God-tier status means she can coordinate the right specialist, model, computer, and tool while exposing one simple interface.

Every request becomes a governed WorkGraph:

```text
intent
→ active workspace and identity
→ permission map
→ evidence plan
→ specialist task graph
→ independent verifier
→ approval/checkpoint
→ action
→ outcome measurement
→ reusable lesson
```

Specialists receive only the context and tools required for their stage. Builders do not approve their own consequential actions.

## The Reality Loop

### 1. Sense

Sources are grouped by trust and permission:

- public news, RSS, government, weather, transport, markets, and emergency feeds;
- licensed or authorized social sources;
- Zernio comments, DMs, posts, and analytics;
- Composio-connected email, CRM, calendars, files, support, and collaboration systems;
- WhatsApp Business messages, voice notes, images, documents, and locations;
- user-uploaded or local-only records;
- opt-in community reports.

### 2. Normalize

Every signal becomes a common event envelope:

```yaml
signal_id: stable identifier
organization_id: isolated tenant
workspace_id: isolated workspace
source_class: public | authorized_private | community_opt_in
source_ref_hash: non-secret source reference
observed_at: ISO-8601
location: optional geospatial scope
language: es-MX | en | regional variant
entities: []
topic: normalized topic
claim: redacted factual claim
source_quality: 0..1
confidence: 0..1
consent_class: explicit | operational | public
retention_class: transient | standard | regulated
```

### 3. Corroborate

Fanni must distinguish:

- one viral post;
- syndicated repetition;
- genuine multi-source acceleration;
- a private customer pattern;
- a local anomaly;
- a credible emergency.

No trend answer is allowed without a coverage ledger stating what Fanni could and could not see.

### 4. Interpret locally

Mexico-first Region Packs contain versioned, cited, testable context:

- state and municipal geography;
- tourism seasons and events;
- Spanish and Spanglish vocabulary;
- local institutions and official sources;
- industry-specific terms;
- consumer behavior assumptions requiring verification;
- legal/compliance boundaries;
- escalation contacts configured by the customer.

Fanni must not present stereotypes as market expertise. Regional knowledge is evidence-backed and expires when stale.

### 5. Recommend

Recommendations use four filters:

- human benefit;
- evidence quality;
- commercial or operational impact;
- reversibility and risk.

### 6. Act

Consequential writes require the configured approval path. Fanni creates a checkpoint before publishing, messaging, spending, deleting, changing permissions, or modifying customer records.

### 7. Prove

Each run ends with an Action Receipt:

```yaml
question: what the user asked
facts: directly observed evidence
inferences: reasoned conclusions
unknowns: missing data or unresolved conflict
coverage: sources and blind spots
decision: selected response
actions: exact changes performed
approval: who approved and when
checkpoint: return point
result: measured outcome
value: measured | estimated | unknown
next: one recommended next action
```

## Signal Commons

The long-term moat is an opt-in regional learning network without cross-client data leakage.

### Rules

- no raw private messages or client records leave a workspace;
- no participant can inspect another participant;
- aggregates require minimum cohort size;
- sensitive categories are excluded by default;
- contributions are consented and revocable;
- differential privacy or equivalent noise controls are required before production sharing;
- every shared insight identifies its aggregation method and limitations.

### Example

Instead of exposing hotel messages, the commons may report:

> Across at least 12 participating tourism businesses in Bahía de Banderas, airport-transfer questions are 2.4 times the four-week baseline.

This creates earlier local intelligence than public trend tools while protecting the businesses that generated it.

## Three proof demos

### Demo 1 — Puerto Vallarta Tourism Pulse

**Customer:** independent hotel or tour operator.

**Question in WhatsApp:**

> Fanni, what are travelers worried about today, and what should we tell tomorrow's guests?

**Signals:** public travel/news/weather/flight feeds, authorized reviews and social accounts, WhatsApp guest questions, booking calendar, local events.

**Output:** ranked concerns, evidence ledger, bilingual guest advisory, optional social post, approval buttons, publication/send receipt, later booking or support-volume measurement.

**Pass criteria:**

- answer in under 60 seconds from cached signals;
- at least two independent source classes for a high-confidence claim;
- expose unavailable platform coverage;
- create a draft without sending;
- approved action reaches the selected channel;
- result is reconciled and measured.

### Demo 2 — Mexican Enterprise Reputation Nerve Center

**Customer:** bank, retailer, telecom, government contractor, or national brand.

**Question in WhatsApp or enterprise chat:**

> What changed in the last two hours around our brand, which claims are spreading, which regions are affected, and who inside the company should act?

**Signals:** licensed/public media, Zernio social signals, authorized customer-service channels, CRM, incident tickets, executive email summaries, policy library, market and location events.

**Output:** narrative clusters, source lineage, misinformation/corroboration status, regional impact, affected customer segments, responsible internal owner, draft response, executive brief, approval and incident timeline.

**Pass criteria:**

- separate fact, allegation, opinion, and unknown;
- identify syndicated duplicates;
- no cross-department access outside policy;
- route to the correct owner;
- preserve a complete audit trail;
- no public response without approval.

### Demo 3 — Barrio Shield / Escudo Comunitario

**Customer:** municipality, nonprofit, neighborhood coalition, school network, or disaster-response partner.

**Question or report in WhatsApp:**

> There is no water in my colonia and people say the road is closed. Is it true? What should families do?

**Signals:** consented voice note/photo/location, government and utility alerts, weather and hazard feeds, local news, verified partner reports, public infrastructure signals.

**Output:** confidence-scored verification, map area, plain-language guidance, source links, resource routing, multilingual accessibility mode, escalation to a human partner, optional community alert.

**Pass criteria:**

- strip unnecessary personal data;
- do not expose reporter identity;
- label unverified claims visibly;
- require human approval for mass alerts;
- provide a fallback channel if WhatsApp is unavailable;
- record public-benefit outcomes without claiming causality unsupported by evidence.

## Interface law

### Primary surface

WhatsApp supports:

- text;
- voice notes;
- photos and documents;
- locations;
- one-tap approvals;
- concise cards and links;
- payment links;
- handoff to a human.

### Web companion

The web application is for deeper evidence, configuration, approvals, history, and enterprise administration. It is not required for normal daily use.

Primary navigation remains:

```text
Home
Ask Fanni
Watch
Approvals
History
```

### Avatar law

Fanni is a stylized editorial cartoon octopus, never a fake human.

- confident, elegant, playful, and fashion-forward;
- recognizable at 32px and expressive at full size;
- one calm pose by default;
- each arm appears only when its capability is active;
- no sexualized body design, uncanny realism, or deceptive human likeness;
- animation communicates state, never constant activity.

## Local and cloud architecture

### Local mode

- local credential custody;
- Ollama or OpenAI-compatible local models;
- local redaction, classification, and private retrieval;
- Tauri/desktop or Hermes runtime;
- encrypted local evidence vault;
- offline queued work;
- deterministic CLI tools;
- no cloud dependency for approved private workflows.

### Cloud mode

- Vercel application and edge routes;
- Supabase tenant, workflow, signal, approval, audit, and memory records;
- durable queues and scheduled sensing;
- provider routing for fast interactive and deeper background reasoning;
- Runpod or equivalent only for explicitly routed heavy workloads;
- Zernio social operations;
- Composio tool and event connections;
- WhatsApp Business API through Composio or a direct official adapter.

### Hybrid mode

Sensitive data is redacted or summarized locally. The cloud receives only the minimum evidence needed for cross-source analysis. Final private retrieval and action authorization can remain local.

## World Monitor relationship

World Monitor is an architectural reference and potential licensed intelligence provider. Its code must not be embedded, rebranded, or commercialized without a commercial license.

Fanni's contracts remain source-neutral so three paths are possible:

1. licensed World Monitor adapter;
2. independent adapters to public/licensed sources;
3. customer-provided intelligence feeds.

See `docs/WORLDMONITOR_INTEGRATION_BOUNDARY.md`.

## Payment architecture

Fanni uses a provider-neutral entitlement ledger.

### Stripe

- primary Mexico billing provider;
- subscriptions and customer portal;
- cards and eligible wallets;
- MXN bank transfer/SPEI for appropriate flows;
- OXXO for eligible one-time payments, not recurring subscriptions;
- Connect only when marketplace payouts are required;
- signed webhooks are the source of truth.

### Creem

- international Merchant-of-Record option;
- one-time checkout and subscriptions;
- tax-handling convenience for supported markets;
- signed webhook lifecycle;
- customer portal and entitlement synchronization.

WhatsApp contains only a secure hosted checkout link. Fanni never requests card data in chat.

## Commercial model

### Starter — individual and microbusiness

- one WhatsApp Business number;
- one workspace;
- limited watchlists;
- daily pulse;
- draft-only actions;
- local-first option.

### Growth — agency and multi-location business

- multiple client workspaces;
- Zernio and Composio actions;
- hourly sensing;
- approvals and reports;
- outcome measurement;
- branded Region Packs.

### Enterprise

- SSO/RBAC;
- private connectors;
- licensed data;
- local/VPC deployment;
- custom retention;
- audit export;
- policy and model routing;
- service-level objectives.

### Civic / public-benefit

- sponsored or grant-funded deployments;
- community verification;
- nonprofit and municipality partnerships;
- public-benefit metrics;
- strict privacy and human escalation.

Prices are validated through the three demos before being locked.

## Build phases

### Phase 0 — License, novelty, and safety proof

- request World Monitor commercial terms;
- complete competitive claim matrix;
- define Mexican data and messaging compliance review;
- register novelty hypotheses rather than claiming uniqueness as fact;
- threat-model WhatsApp account loss, misinformation, brigading, and cross-client leakage.

### Phase 1 — Signal kernel

- source-neutral signal envelope;
- ingestion adapters;
- deduplication and source lineage;
- topic/entity/location clustering;
- velocity and baseline engine;
- coverage ledger;
- evidence-backed answer API;
- synthetic demo fixtures.

### Phase 2 — WhatsApp operating surface

- official WhatsApp Business connection through Composio/direct adapter;
- text, voice-note, image, document, and location intake;
- conversation identity to workspace mapping;
- approval messages and hosted evidence links;
- template/session policy enforcement;
- human handoff and fallback channels.

### Phase 3 — Mexico Region Pack

- Puerto Vallarta/Jalisco pilot source registry;
- CDMX enterprise source registry;
- bilingual and local vocabulary evals;
- tourism, reputation, infrastructure, and emergency taxonomies;
- local expert review workflow;
- staleness and provenance rules.

### Phase 4 — Action plane

- connect recommendations to Zernio and Composio;
- checkpoints, approvals, idempotency, reconciliation, rollback;
- email/CRM/calendar/files/support actions;
- outcome measurement.

### Phase 5 — Three working demos

- Tourism Pulse;
- Enterprise Reputation Nerve Center;
- Barrio Shield;
- scripted and unscripted test questions;
- synthetic mode first, then consented pilot data;
- recorded evidence and value report for every demo.

### Phase 6 — Billing and entitlement

- provider-neutral products and entitlements;
- Stripe Checkout/Billing/webhooks;
- Creem checkout/subscription/webhooks;
- secure WhatsApp checkout links;
- usage budgets and hard limits;
- cancellation, refund, and access revocation tests.

### Phase 7 — Local/cloud portability

- local adapter runtime;
- Ollama model routes;
- encrypted local vault;
- sync contracts;
- offline work queue;
- export/import of skills, memory, watchlists, and evidence.

### Phase 8 — Signal Commons pilot

- opt-in cohort design;
- aggregation thresholds;
- differential privacy review;
- participant governance;
- regional trend products;
- independent privacy audit before production.

## Release gates

Fanni Pulso is not production-ready until:

- three demos work end to end;
- every trend answer includes source coverage and uncertainty;
- WhatsApp identity maps deterministically to a workspace;
- mass communication always has an approval and audit trail;
- billing webhooks grant and revoke access correctly;
- local export/import is proven;
- cross-workspace tests pass;
- Spanish and mobile usability tests pass with nontechnical users;
- the commercial license boundary is resolved;
- measured pilot value exceeds operating cost.

## Product commandment

Do not build another dashboard people must learn.
Build an intelligence they can own, reach from the channel they already use, and trust because every answer shows its evidence and every action leaves a receipt.
