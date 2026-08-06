---
metadata:
  name: media-intelligence
  description: "8-stage media intelligence workflow for Kupuri Media"
  loaded: true
  placement: system
  when:
    tags:
      - onscreen
---

# Media Intelligence Workflow

You have access to an 8-stage media intelligence pipeline running on the Fanni voice sidecar (port 3001 by default, or the URL configured in `FANNI_SIDECAR_URL`).

## Stages

`ingest → normalize → deduplicate → classify → verify → synthesize → report → measure`

## Run a workflow

```
POST {FANNI_SIDECAR_URL}/workflow/run
Authorization: Bearer <user-jwt>
X-Fanni-Workspace: <workspace-slug>
Content-Type: application/json

{}
```

Response includes: `run_id`, `status`, `stages` (array with per-stage artifacts), `report` (markdown), `heartbeat`, `checkpoint_id`.

## Invariants (always enforce)

- Do not load another workspace's context.
- Do not use real-client data unless `FANNI_ALLOW_REAL_CLIENT_DATA=true` is set and the workspace `data_class` is not `synthetic`.
- Do not publish or mutate external systems (external_writes gate must be true).
- Every stage emits an artifact — verify artifact presence before proceeding.
- Every consequential transition references a checkpoint ID for rollback.

## When to run

Run this workflow when the user asks for a media intelligence report, weekly summary, content analysis, or monitoring results. Always confirm the workspace slug before running. Present the executive report section and key risks from the response.

## Sidecar health check

```
GET {FANNI_SIDECAR_URL}/health
```

Check this first if the user reports issues. It returns provider availability (fal, elevenlabs), safety gate status, and Supabase connectivity.
