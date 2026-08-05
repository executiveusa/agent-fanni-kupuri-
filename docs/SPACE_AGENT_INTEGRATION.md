# Agent Fanni on Space Agent

## Decision

Agent Fanni uses Space Agent as the interactive shell and computer-use foundation. We do not rebuild Space Agent inside this repository.

- Upstream product: `agent0ai/space-agent`
- User-controlled mirror: `executiveusa/space-agent`
- Fanni repository: `executiveusa/agent-fanni-kupuri-`

Space Agent supplies the browser-resident interface, conversation surface, modular skills, hierarchical users/groups, persistent admin plane, Git-backed history, and rollback mechanics. Fanni supplies the identity, ICM contracts, workflows, data model, business rules, adapters, and branded avatar.

## Runtime boundary

```text
Space Agent UI and session runtime
  -> Fanni persona/ICM loader
  -> Fanni workflow registry
  -> checkpoint + rollback service
  -> Beads work ledger
  -> Supabase fanni schema
  -> bounded adapters: QVAC, SpeakFlow, Postiz, computer use
```

Space Agent is not the source of Fanni's business identity. `HEART.md`, `PERSONA.md`, `HEARTBEAT.md`, and `AGENTS.md` remain authoritative.

## Required Space Agent customization

1. Create a Fanni group and user layer.
2. Mount this repository as Fanni customware or synchronized configuration.
3. Load the Fanni identity bundle at session start.
4. Register Fanni workflows as skills/tools.
5. Replace Space Agent display name and visual assets with Fanni branding.
6. Keep admin mode available under a separate operator role.
7. Map every consequential mutation to a checkpoint.
8. Record every work item and dependency in Beads.
9. Keep external writes disabled until workspace policy permits them.

## Avatar rule

The final avatar is deliberately deferred. The initial demo uses a neutral Fanni placeholder while all identity, speech, workflow, observability, and rollback behavior remains functional.

## Deployment target

- Space Agent/Fanni runtime: Hostinger VPS
- Public demonstration/control plane: Vercel where useful
- Operational data: Supabase `fanni` schema
- Local/private inference: QVAC
- Voice input: SpeakFlow/local Whisper

## Acceptance criteria

- A user can speak or type to Fanni from the Space Agent surface.
- Fanni loads only the current ICM context bundle.
- Every run creates a Beads work item and immutable checkpoint metadata.
- The operator can inspect facts, artifacts, dependencies, failures, and next work.
- A failed or undesirable run can restore the previous verified checkpoint.
- Cross-workspace data and credentials never enter another context bundle.
