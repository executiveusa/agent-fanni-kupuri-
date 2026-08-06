import { runMediaIntelligenceWorkflow } from '../../src/runtime/workflowEngine.js';
import { runHeartbeat } from '../../src/runtime/heartbeat.js';
import { createContextManifest, validateContextManifest } from '../../src/runtime/icmRuntime.js';

export function workflowRouter(router, { requireAuth, resolveWorkspace }) {
  router.post('/workflow/run', requireAuth, resolveWorkspace, async (req, res) => {
    const { workflowKey = 'media-intelligence-weekly', records } = req.body || {};

    if (req.workspace?.data_class !== 'synthetic' && !req.workspace?.external_writes_enabled) {
      const externalAllowed = process.env.FANNI_ALLOW_REAL_CLIENT_DATA === 'true';
      if (!externalAllowed) {
        return res.status(403).json({ error: 'Real client data requires explicit authorization. FANNI_ALLOW_REAL_CLIENT_DATA must be true and workspace must have external_writes_enabled.' });
      }
    }

    if (req.membership && !['owner', 'admin', 'operator'].includes(req.membership.role)) {
      return res.status(403).json({ error: 'Workflow execution requires operator role or above' });
    }

    try {
      let runRecordId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      
      if (req.supabase) {
        try {
          const { data: runRecord, error: runInsertError } = await req.supabase
            .schema('fanni')
            .from('workflow_runs')
            .insert({
              organization_id: req.workspace?.organization_id || 'demo-org',
              workspace_id: req.workspace?.id || 'demo-ws',
              workflow_key: workflowKey,
              stage_key: 'ingest',
              status: 'running',
              input_manifest: { source: records ? 'user-provided' : 'synthetic', count: records?.length ?? 0 },
              output_manifest: {},
              evidence: [],
              started_by: req.user?.id || 'dev-user-0000'
            })
            .select('id')
            .single();

          if (!runInsertError && runRecord) {
            runRecordId = runRecord.id;
          }
        } catch { /* DB secondary fail-safe */ }
      }

      const manifest = createContextManifest({
        workspaceId: req.workspace?.slug || 'agent-fanni-demo',
        workflowKey,
        stageKey: 'ingest',
        authorizedTools: ['deterministic-classifier', 'local-report-export'],
        excludedContext: ['other workspaces', 'real client records', 'provider credentials']
      });
      const validation = validateContextManifest(manifest);

      if (!validation.valid) {
        return res.status(422).json({ error: 'Context manifest invalid', details: validation.errors });
      }

      const inputRecords = records || (await import('../../src/runtime/syntheticMentions.js')).syntheticMentions;
      const run = runMediaIntelligenceWorkflow(inputRecords);
      const heartbeat = runHeartbeat({ workflowRun: run });

      if (req.supabase) {
        try {
          await req.supabase
            .schema('fanni')
            .from('workflow_runs')
            .update({
              stage_key: 'measure',
              status: run.reviewQueue.length ? 'awaiting_review' : 'complete',
              output_manifest: { report: run.report, metrics: run.metrics },
              evidence: run.artifacts,
              completed_at: run.completedAt
            })
            .eq('id', runRecordId);

          await req.supabase.schema('fanni').from('audit_events').insert({
            organization_id: req.workspace?.organization_id || 'demo-org',
            workspace_id: req.workspace?.id || 'demo-ws',
            actor_user_id: req.user?.id || 'dev-user-0000',
            actor_type: 'agent',
            event_type: 'workflow.completed',
            object_type: 'workflow_run',
            object_id: runRecordId,
            payload_redacted: {
              workflow_key: workflowKey,
              records: inputRecords.length,
              review_required: run.reviewQueue.length
            }
          });
        } catch { /* DB secondary fail-safe */ }
      }

      res.json({
        runId: runRecordId,
        workspaceId: req.workspace?.id || 'demo-ws',
        workflowKey,
        status: run.reviewQueue.length ? 'awaiting_review' : 'complete',
        report: run.report,
        metrics: run.metrics,
        artifacts: run.artifacts,
        heartbeat,
        reviewRequired: run.reviewQueue.length > 0
      });

    } catch (error) {
      console.error('[workflow/run]', error.message);
      res.status(500).json({ error: 'Workflow execution failed', detail: error.message });
    }
  });

  router.get('/workflow/runs', requireAuth, resolveWorkspace, async (req, res) => {
    if (!req.supabase) return res.json({ runs: [] });
    try {
      const { data, error } = await req.supabase
        .schema('fanni')
        .from('workflow_runs')
        .select('id, workflow_key, stage_key, status, started_at, completed_at, output_manifest')
        .eq('workspace_id', req.workspace?.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) return res.json({ runs: [] });
      res.json({ runs: data || [] });
    } catch {
      res.json({ runs: [] });
    }
  });

  return router;
}
