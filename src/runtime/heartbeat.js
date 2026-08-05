export function runHeartbeat({ workflowRun = null } = {}) {
  const facts = [
    'Frontend runtime loaded.',
    'Workspace is agent-fanni-demo.',
    'Synthetic data mode is active.',
    'External writes are disabled.',
    'Real client data is disabled.'
  ];

  const unknowns = [];
  const risks = [];

  if (!import.meta.env.VITE_SUPABASE_URL) unknowns.push('Supabase URL is not configured.');
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) unknowns.push('Supabase anonymous key is not configured.');
  if (!import.meta.env.VITE_FANNI_API_BASE_URL) unknowns.push('Hostinger runtime API is not configured.');

  const externalWritesEnabled = import.meta.env.VITE_EXTERNAL_WRITES_ENABLED === 'true';
  const realClientDataEnabled = import.meta.env.VITE_REAL_CLIENT_DATA_ENABLED === 'true';

  if (externalWritesEnabled) risks.push('Frontend indicates external writes are enabled; server and workspace gates must still be verified.');
  if (realClientDataEnabled) risks.push('Frontend indicates real client data is enabled; production authorization must be verified.');

  if (workflowRun?.status === 'complete') {
    facts.push(`Workflow ${workflowRun.runId} completed with ${workflowRun.records.length} classified records.`);
    facts.push(`${workflowRun.reviewQueue.length} record(s) require review.`);
  } else {
    unknowns.push('No completed synthetic workflow run is currently attached to this heartbeat.');
  }

  const systemStatus = risks.length > 0 ? 'critical' : unknowns.length > 0 ? 'blocked' : 'healthy';

  return {
    heartbeatId: `heartbeat-${Date.now()}`,
    workspaceId: 'agent-fanni-demo',
    timestamp: new Date().toISOString(),
    systemStatus,
    activeRuns: workflowRun?.status === 'running' ? 1 : 0,
    stalledRuns: 0,
    failedRuns: workflowRun?.status === 'failed' ? 1 : 0,
    externalWrites: externalWritesEnabled ? 'enabled' : 'disabled',
    realClientData: realClientDataEnabled ? 'enabled' : 'disabled',
    facts,
    inferences: workflowRun?.status === 'complete'
      ? ['The deterministic workflow path is operational in the browser prototype.']
      : ['The interface is available, but workflow proof is incomplete.'],
    unknowns,
    actionsTaken: ['Checked configuration gates.', 'Checked current workflow state.', 'Prepared next-action recommendation.'],
    proof: workflowRun?.artifacts || [],
    commercialImpact: workflowRun ? [
      `Estimated ${workflowRun.metrics.estimatedMinutesSaved} minutes saved in this synthetic run.`,
      `${workflowRun.metrics.automationRate}% of unique records cleared deterministic review thresholds.`
    ] : [],
    risks,
    nextAction: workflowRun
      ? 'Configure Supabase and persist workflow, audit, and heartbeat records.'
      : 'Run the synthetic media-intelligence workflow.',
    humanAttentionRequired: systemStatus !== 'healthy'
  };
}
