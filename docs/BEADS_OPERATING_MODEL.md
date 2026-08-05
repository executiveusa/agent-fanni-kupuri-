# Fanni Beads Operating Model

Beads is Fanni's work ledger. Git remains historical truth; Beads records active work, dependencies, readiness, ownership, checkpoints, failures, and completion evidence.

## Work hierarchy

```text
EPIC     measurable business outcome
FEATURE  reusable capability
TASK     bounded implementation or workflow stage
CHECK    verification requirement
INCIDENT failed or unsafe runtime condition
```

## Required fields

```yaml
id: stable Beads identifier
title: bounded outcome
type: epic | feature | task | check | incident
status: backlog | ready | active | blocked | review | complete | rolled_back
workspace_id: isolated Fanni workspace
workflow_key: workflow identifier
stage_key: current stage
owner: human or specialist agent
depends_on: []
blocks: []
context_manifest_ref: path or hash
checkpoint_before: checkpoint identifier
checkpoint_after: checkpoint identifier
artifacts: []
proof: []
risks: []
rollback_ref: checkpoint or procedure
next_action: one bounded next step
created_at: ISO-8601
updated_at: ISO-8601
```

## Rules

1. No autonomous work begins without a Beads item in `ready` or `active` state.
2. Dependencies must be explicit; Fanni works only ready items.
3. One work item has one measurable outcome.
4. Every consequential action records a checkpoint before execution.
5. Completion requires proof, not a tool success message.
6. Failed work becomes an incident or blocked task; it is never silently discarded.
7. Rollback creates a new ledger event and never erases the original history.
8. Human approval boundaries are represented as blocking checks.
9. Specialist agents may update only their assigned Beads item and child items.
10. Git commit, Supabase audit event, workflow run, and Beads item IDs must cross-reference each other.

## Ready-work algorithm

A task is ready when:

- status is `ready`;
- every dependency is complete;
- workspace and tool permissions are valid;
- budget and write gates pass;
- a rollback method exists;
- required context files resolve;
- no unresolved critical incident blocks it.

## Time travel

Fanni time travel is forward-moving restoration:

1. Select a verified checkpoint.
2. Capture the current state as a new checkpoint.
3. Validate that the target belongs to the same workspace.
4. Restore files/configuration/data using the checkpoint adapter.
5. Verify expected state and isolation.
6. Record a `rolled_back` Beads event and audit event.
7. Resume from the selected verified stage or create a corrective task.

History is retained. A rollback does not rewrite evidence or pretend the failed path never occurred.
