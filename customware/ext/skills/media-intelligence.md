# Skill: Kupuri Media Intelligence Pipeline & Heartbeat Controls

## Capabilities
1. **8-Stage Pipeline Execution**:
   - `ingest`: Gather raw media mentions from social/news channels
   - `dedupe`: Fingerprint and eliminate exact duplicate records
   - `classify`: Categorize topic, sentiment, risk tier, and confidence score
   - `route`: Direct low-confidence items to review queue and clean items to synthesis
   - `synthesize`: Generate executive digest and metrics breakdown
   - `persist`: Save audit logs and run manifests to Supabase
   - `notify`: Format notification payloads for workspace stakeholders
   - `measure`: Calculate time saved and automation percentage

2. **Heartbeat Inspection**:
   - Query `POST http://localhost:3001/api/workflow/run` for automated 8-stage execution.
   - Query `GET http://localhost:3001/api/health` for provider status and safety gates.
