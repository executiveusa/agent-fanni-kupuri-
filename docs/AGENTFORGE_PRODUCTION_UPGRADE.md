# Agent Fanni Production Upgrade Report

## Benchmark used

This upgrade uses `DataBassGit/AgentForge` as a checklist and workflow reference, not as a direct dependency. AgentForge's relevant production concepts are:

1. Agents have a standard lifecycle that loads configuration, persona, context, prompts, models, storage, output parsing, and post-processing.
2. Cogs are declarative workflow graphs with named agents, shared memory, state, branches, fallbacks, loop guards, and explicit termination.
3. Memory is declared in the workflow and queried before or updated after specific agents.
4. Personas are editable configuration rather than hard-coded behavior.
5. Model selection can vary by agent or workflow.
6. Execution trails are inspectable for testing and debugging.

Fanni already had capabilities that AgentForge does not supply by itself: ICM context manifests, workspace isolation, Supabase RLS, Beads-style work tracking, immutable evidence, checkpoints, rollback, and Space Agent as the interactive shell. The goal was therefore to add AgentForge's strongest orchestration patterns without replacing Fanni's sovereign architecture.

## Changes made

### 1. Production agent lifecycle manifest

**Added:** `production/agent-manifest.json`

The manifest turns Fanni's runtime into an explicit lifecycle:

`load configuration -> resolve workspace -> build context manifest -> enforce memory policy -> resolve model route -> create checkpoint -> execute Cog -> validate output -> persist evidence -> emit heartbeat`

**Why:** Previously these responsibilities existed across separate files but were not defined as one production contract.

**What it does for Fanni:**
- Gives every runtime implementation the same required sequence.
- Prevents skipping workspace resolution, memory policy, checkpoints, or output validation.
- Makes production-readiness machine-checkable.

### 2. Declarative Cog workflow

**Added:** `production/cogs/media-intelligence-weekly.yaml`

The media workflow is now declared as a graph rather than only embedded in JavaScript. It defines agents, stage contracts, memory query/update points, transitions, review branches, fallback behavior, visit limits, retries, timeouts, checkpoints, and required outputs.

**Why:** AgentForge demonstrates that workflow structure is easier to inspect, edit, test, and reuse when orchestration is declarative.

**What it does for Fanni:**
- Makes the workflow visible to operators and agents.
- Allows stages and model routes to change without rewriting the UI.
- Adds explicit review, rejection, and rollback paths.
- Prevents infinite loops with visit guards.
- Makes future workflows repeatable.

### 3. Cog runtime engine

**Added:** `src/runtime/cogEngine.js`

The engine validates Cog graphs, executes handlers, maintains state, evaluates decision branches, enforces visit limits, records a full execution trail, and returns the final output.

**Why:** A YAML file alone is documentation. Fanni needed executable orchestration.

**What it does for Fanni:**
- Provides a reusable multi-stage workflow engine.
- Gives observability into which stage ran, how often, and what it returned.
- Fails early on invalid agent or transition references.
- Supports deterministic, policy, and model-backed stages through adapters.

### 4. Provider routing and failover

**Added:** `production/models.yaml`

**Added:** `src/runtime/providerRouter.js`

Routes now define primary and fallback providers for classification, synthesis, reports, speech-to-text, and text-to-speech. The runtime supports retries, timeouts, exponential backoff, failure trails, and final fail-closed behavior.

**Why:** Production agents should not depend on one model endpoint. AgentForge supports model overrides; Fanni extends that concept into explicit failover.

**What it does for Fanni:**
- Allows OpenAI-backed work to fall back to local QVAC models.
- Allows voice transcription to fall back between Fal-hosted Whisper and ElevenLabs Scribe.
- Allows speech generation to fall back between ElevenLabs and MiniMax.
- Preserves provider failure evidence rather than hiding it.
- Supports cost limits and workspace-level model choices.

### 5. Bounded memory governance

**Added:** `production/memory-policy.yaml`

**Added:** `src/runtime/memoryGuard.js`

Memory now has declared scopes, retrieval limits, similarity thresholds, retention rules, redaction rules, approval requirements, and prompt-injection defenses.

**Why:** AgentForge's memory nodes show the value of querying and updating memory at specific workflow points. Fanni needed stronger privacy and injection controls because her use case includes real business data.

**What it does for Fanni:**
- Denies cross-workspace memory access.
- Marks retrieved memory as untrusted.
- Detects common embedded prompt-injection patterns.
- Redacts likely API keys.
- Limits semantic retrieval volume.
- Separates persona, workflow, and workspace memory.
- Prevents automatic long-term persona changes without owner approval.

### 6. Editable production persona

**Added:** `production/personas/fanni.yaml`

This configuration exposes Fanni's language, communication, behavior, prohibitions, and voice profile while keeping `HEART.md`, `PERSONA.md`, and `HEARTBEAT.md` authoritative.

**Why:** AgentForge treats personas as reusable configuration. Fanni's personality should be versionable and editable without changing runtime code.

**What it does for Fanni:**
- Makes personality tuning safer.
- Keeps bilingual behavior explicit.
- Prevents false completion claims and silent publishing.
- Preserves her rollback and evidence-first character.
- Gives the future avatar and voice layer a stable style contract.

### 7. Automated production validation

**Added:** `scripts/validate-production.mjs`

The validator checks required identity files, agent lifecycle stages, rollback requirements, Cog graph validity, required model routes, and cross-workspace memory denial.

**Why:** Production configuration should fail during CI rather than at runtime.

**What it does for Fanni:**
- Detects missing or malformed operational configuration before merge.
- Prevents a deployment with missing model routes or weakened isolation.
- Makes architecture rules executable.

### 8. Runtime test suite

**Added:** `tests/production-runtime.test.js`

Tests cover:
- declarative Cog execution and trails;
- provider fallback after primary failure;
- cross-workspace memory denial;
- prompt-injection detection.

**Why:** The previous repository verified only that the frontend built.

**What it does for Fanni:**
- Proves the orchestration and safety behaviors independently of the UI.
- Protects against regressions.
- Creates the foundation for workflow evaluation suites.

### 9. Stronger CI gate

**Updated:** `.github/workflows/verify.yml`

CI now runs:
1. production configuration validation;
2. runtime tests;
3. frontend build;
4. expanded secret scanning;
5. build artifact upload.

**Why:** A successful Vite build is not evidence that an agent is production-ready.

**What it does for Fanni:**
- Blocks invalid workflow graphs.
- Blocks failing safety tests.
- Blocks common secret patterns.
- Produces a verified deployable artifact.

### 10. Production environment contract

**Updated:** `.env.example`

Added server-only OpenAI, Fal, model-route, retry, timeout, cost, and memory-governance configuration.

**Why:** Provider routing and production limits must be configurable without code changes.

**What it does for Fanni:**
- Supports secure provider configuration.
- Prevents browser exposure of provider secrets.
- Makes operating limits explicit.
- Supports local and hosted models through the same contract.

### 11. Durable provider observability

**Added and applied:** `fanni.provider_attempts`

Records route, provider, model, attempt, outcome, latency, token usage, estimated cost, and redacted errors.

**Why:** Provider failover is not observable if attempts exist only in transient logs.

**What it does for Fanni:**
- Shows why a provider was selected or skipped.
- Supports cost and reliability analysis.
- Allows incident review and model comparison.
- Keeps all records organization- and workspace-scoped with RLS.

### 12. Governed memory storage

**Added and applied:** `fanni.memory_entries`

Stores redacted memory, scope, source hash, injection signals, approval state, expiration, and workspace ownership.

**Why:** Production memory requires provenance, retention, approval, and isolation.

**What it does for Fanni:**
- Makes memory inspectable and exportable.
- Supports retention and deletion policies.
- Records whether a memory item is safe for prompt use.
- Prevents cross-tenant spillover through RLS.

### 13. Evaluation history

**Added and applied:** `fanni.evaluation_runs`

Stores evaluation suite, workflow, status, score, metrics, failures, evidence, commit SHA, and timestamps.

**Why:** A production agent needs repeatable quality measurement, not subjective demonstrations.

**What it does for Fanni:**
- Links quality results to exact code versions.
- Allows release gates based on evaluation results.
- Tracks regressions over time.
- Supports future bilingual, safety, tool-use, and rollback eval suites.

## Database security

The three new tables have RLS enabled. Access requires existing Fanni organization membership and role checks:

- Provider attempts: members can read; owners, admins, and operators can insert.
- Memory entries: members can read; owners, admins, and operators can manage.
- Evaluation runs: members can read; owners, admins, operators, and reviewers can manage.

No anonymous access was granted. No service-role key is required in the browser.

## What was deliberately not copied

AgentForge is Python-based and uses its own storage and configuration conventions. Fanni remains a JavaScript/React/Space Agent/Supabase system. The following were not adopted directly:

- AgentForge as a runtime dependency;
- ChromaDB as a second database;
- deprecated AgentForge tools/actions;
- unrestricted automatic chat memory;
- direct Python subclassing patterns.

These would duplicate Fanni's existing architecture or weaken her current isolation model.

## Remaining production work

This upgrade establishes the framework, but the following still require implementation or live configuration:

1. Bind the Cog engine to the Space Agent tool/skill surface.
2. Persist Cog execution trails into `workflow_runs`, `provider_attempts`, and `audit_events`.
3. Add real provider adapters for OpenAI, QVAC, and Fal.
4. Add evaluation fixtures for English, Spanish, adversarial memory, model failover, and rollback.
5. Create the Fanni Vercel project; none currently exists in the connected Vercel team.
6. Deploy the Space Agent runtime to Hostinger.
7. Select the final ElevenLabs voice and avatar.
8. Run load, latency, cost, and recovery tests.

## Result

Fanni moved from a well-structured prototype with strong identity and safety concepts to a testable production architecture with:

- declarative orchestration;
- explicit lifecycle control;
- provider failover;
- governed memory;
- machine-validated configuration;
- automated runtime tests;
- stricter CI;
- durable provider observability;
- durable evaluation history;
- RLS-protected memory storage.

The upgrade keeps Fanni's strongest differentiators—ICM, Beads, evidence, checkpoints, rollback, workspace sovereignty, and Space Agent integration—while adding the operational discipline demonstrated by AgentForge.
