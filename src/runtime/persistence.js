import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const workspaceSlug = import.meta.env.VITE_FANNI_WORKSPACE_SLUG || 'agent-fanni-demo';

export const persistenceConfigured = Boolean(url && key);

const client = persistenceConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

async function resolveContext() {
  if (!client) return { enabled: false, reason: 'Supabase public configuration is missing.' };

  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData?.user) return { enabled: false, reason: 'Authenticated Supabase user is required.' };

  const schema = client.schema('fanni');
  const { data: workspace, error: workspaceError } = await schema
    .from('workspaces')
    .select('id, organization_id, slug')
    .eq('slug', workspaceSlug)
    .maybeSingle();

  if (workspaceError) throw workspaceError;
  if (!workspace) return { enabled: false, reason: `Workspace ${workspaceSlug} is not available to this user.` };

  return { enabled: true, schema, user: authData.user, workspace };
}

export async function persistWorkflowRun(run) {
  const context = await resolveContext();
  if (!context.enabled) return context;

  const { schema, user, workspace } = context;
  const { data: storedRun, error: runError } = await schema
    .from('workflow_runs')
    .insert({
      organization_id: workspace.organization_id,
      workspace_id: workspace.id,
      workflow_key: run.workflowKey,
      stage_key: 'measure',
      status: run.reviewQueue.length ? 'awaiting_review' : 'complete',
      input_manifest: { source: 'synthetic-browser-demo', count: run.report.totalInput },
      output_manifest: { report: run.report, metrics: run.metrics },
      evidence: run.artifacts,
      started_by: user.id,
      started_at: run.startedAt,
      completed_at: run.completedAt
    })
    .select('id')
    .single();

  if (runError) throw runError;

  const signalRows = run.records.map((record) => ({
    organization_id: workspace.organization_id,
    workspace_id: workspace.id,
    run_id: storedRun.id,
    source_type: record.source,
    source_ref_hash: record.id,
    title: record.source,
    body_redacted: record.text,
    language: record.language || 'es',
    topic: record.topic,
    dimension: 'media-intelligence',
    sentiment: record.sentiment,
    risk: record.risk,
    confidence: record.confidence,
    requires_review: record.requiresReview,
    classification_evidence: record.evidence
  }));

  const { error: signalsError } = await schema.from('signals').insert(signalRows);
  if (signalsError) throw signalsError;

  const { error: auditError } = await schema.from('audit_events').insert({
    organization_id: workspace.organization_id,
    workspace_id: workspace.id,
    actor_user_id: user.id,
    actor_type: 'agent',
    event_type: 'workflow.completed',
    object_type: 'workflow_run',
    object_id: storedRun.id,
    payload_redacted: {
      workflow_key: run.workflowKey,
      records: run.records.length,
      review_required: run.reviewQueue.length,
      estimated_minutes_saved: run.metrics.estimatedMinutesSaved
    }
  });
  if (auditError) throw auditError;

  return { enabled: true, runId: storedRun.id, workspaceId: workspace.id };
}

export async function persistHeartbeat(heartbeat) {
  const context = await resolveContext();
  if (!context.enabled) return context;

  const { schema, user, workspace } = context;
  const { data, error } = await schema
    .from('heartbeat_events')
    .insert({
      organization_id: workspace.organization_id,
      workspace_id: workspace.id,
      actor_user_id: user.id,
      heartbeat_id: heartbeat.heartbeatId,
      system_status: heartbeat.systemStatus,
      active_runs: heartbeat.activeRuns,
      stalled_runs: heartbeat.stalledRuns,
      failed_runs: heartbeat.failedRuns,
      external_writes_enabled: heartbeat.externalWrites === 'enabled',
      real_client_data_enabled: heartbeat.realClientData === 'enabled',
      facts: heartbeat.facts,
      inferences: heartbeat.inferences,
      unknowns: heartbeat.unknowns,
      actions_taken: heartbeat.actionsTaken,
      proof: heartbeat.proof,
      commercial_impact: heartbeat.commercialImpact,
      risks: heartbeat.risks,
      next_action: heartbeat.nextAction,
      human_attention_required: heartbeat.humanAttentionRequired
    })
    .select('id')
    .single();

  if (error) throw error;
  return { enabled: true, heartbeatEventId: data.id, workspaceId: workspace.id };
}
