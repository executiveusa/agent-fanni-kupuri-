# Media Intelligence Weekly — Workflow Context

## Outcome
Transform approved synthetic or authorized media records into classified evidence, a review queue, an executive report, measurable savings, and a complete audit trail.

## Inputs
- workspace-scoped media records;
- approved taxonomy and risk rules;
- workspace policy;
- current Beads work item;
- current checkpoint reference.

## Outputs
- normalized and deduplicated records;
- classifications with evidence;
- review queue;
- executive report;
- measurement record;
- heartbeat update;
- final checkpoint and rollback reference.

## Stage order
`ingest -> normalize -> deduplicate -> classify -> verify -> synthesize -> report -> measure`

## Invariants
- Do not load another workspace's context.
- Do not use real-client data in demo mode.
- Do not publish or mutate external systems.
- Every stage emits an artifact.
- Every consequential transition creates or references a checkpoint.
- The Beads item must identify dependencies, proof, rollback, and next action.
