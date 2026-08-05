import { syntheticMentions } from './syntheticMentions';
import { runMediaIntelligenceWorkflow } from './workflowEngine';
import { runHeartbeat } from './heartbeat';
import { createContextManifest, validateContextManifest } from './icmRuntime';
import { createCheckpoint, listCheckpoints, restoreCheckpoint } from './checkpoints';
import { createWorkItem, listWorkItems, updateWorkItem } from './beadsLedger';

const WORKSPACE_ID = 'agent-fanni-demo';
const WORKFLOW_KEY = 'media-intelligence-weekly';

export function runFanniDemo({ records = syntheticMentions } = {}) {
  const work = createWorkItem({
    title: 'Run synthetic weekly media intelligence',
    type: 'task',
    workspaceId: WORKSPACE_ID,
    workflowKey: WORKFLOW_KEY,
    stageKey: 'ingest'
  });

  const manifest = createContextManifest({
    workspaceId: WORKSPACE_ID,
    workflowKey: WORKFLOW_KEY,
    stageKey: 'ingest',
    references: ['references/media-taxonomy.json'],
    artifacts: ['synthetic input records'],
    authorizedTools: ['deterministic-classifier', 'local-report-export'],
    excludedContext: ['other workspaces', 'real client records', 'provider credentials']
  });
  const validation = validateContextManifest(manifest);
  if (!validation.valid) {
    updateWorkItem(work.id, { status: 'blocked', risks: validation.errors, nextAction: 'Repair context manifest' });
    throw new Error(validation.errors.join('; '));
  }

  const before = createCheckpoint({
    workspaceId: WORKSPACE_ID,
    workflowKey: WORKFLOW_KEY,
    stageKey: 'before-run',
    state: { records, run: null },
    reason: 'pre-workflow safety checkpoint'
  });

  updateWorkItem(work.id, {
    status: 'active',
    contextManifestRef: manifest,
    checkpointBefore: before.id
  });

  try {
    const run = runMediaIntelligenceWorkflow(records);
    const heartbeat = runHeartbeat({ workflowRun: run });
    const after = createCheckpoint({
      workspaceId: WORKSPACE_ID,
      workflowKey: WORKFLOW_KEY,
      stageKey: 'complete',
      state: { records, run, heartbeat },
      reason: 'verified workflow completion'
    });
    updateWorkItem(work.id, {
      status: 'complete',
      stageKey: 'measure',
      checkpointAfter: after.id,
      artifacts: run.artifacts,
      proof: [run.report, run.metrics, heartbeat],
      rollbackRef: before.id,
      nextAction: heartbeat.nextAction
    });
    return { workItemId: work.id, manifest, checkpointBefore: before, checkpointAfter: after, run, heartbeat };
  } catch (error) {
    updateWorkItem(work.id, {
      status: 'blocked',
      risks: [error.message],
      rollbackRef: before.id,
      nextAction: 'Restore the pre-workflow checkpoint and inspect the failure'
    });
    throw error;
  }
}

export function getFanniObservability() {
  return {
    workspaceId: WORKSPACE_ID,
    workItems: listWorkItems(WORKSPACE_ID),
    checkpoints: listCheckpoints(WORKSPACE_ID)
  };
}

export function timeTravelFanni({ checkpointId, currentState }) {
  return restoreCheckpoint({ checkpointId, currentWorkspaceId: WORKSPACE_ID, currentState });
}
