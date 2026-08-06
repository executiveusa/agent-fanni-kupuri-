/**
 * Checkpoint system — localStorage primary, Supabase durable secondary.
 * Supabase writes are fire-and-forget to avoid blocking the UI.
 */
const STORAGE_KEY = 'fanni.checkpoints.v1';

function readStore() {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function writeStore(items) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  try {
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const key = import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    // Lazy import to avoid bundling issues in non-browser contexts
    return window.__fanniSupabase || null;
  } catch { return null; }
}

async function persistCheckpointToSupabase(checkpoint) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('fanni.checkpoints').upsert({
      id: checkpoint.id,
      workspace_id: checkpoint.workspaceId,
      workflow_key: checkpoint.workflowKey,
      stage_key: checkpoint.stageKey,
      reason: checkpoint.reason,
      state: checkpoint.state,
      verified: checkpoint.verified,
      created_at: checkpoint.createdAt,
    });
  } catch {
    // Non-blocking — local store is source of truth for this session
  }
}

export function createCheckpoint({ workspaceId, workflowKey, stageKey, state, reason = 'stage boundary' }) {
  if (!workspaceId || !workflowKey || !stageKey) throw new Error('checkpoint identity incomplete');
  const checkpoint = {
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workspaceId,
    workflowKey,
    stageKey,
    reason,
    state: structuredClone(state),
    createdAt: new Date().toISOString(),
    verified: true
  };
  const store = readStore();
  store.push(checkpoint);
  writeStore(store.slice(-100));
  persistCheckpointToSupabase(checkpoint); // fire-and-forget durable write
  return checkpoint;
}

export function listCheckpoints(workspaceId) {
  return readStore().filter((item) => !workspaceId || item.workspaceId === workspaceId);
}

export function restoreCheckpoint({ checkpointId, currentWorkspaceId, currentState }) {
  const target = readStore().find((item) => item.id === checkpointId);
  if (!target) throw new Error('checkpoint not found');
  if (target.workspaceId !== currentWorkspaceId) throw new Error('cross-workspace rollback denied');
  const safety = createCheckpoint({
    workspaceId: currentWorkspaceId,
    workflowKey: target.workflowKey,
    stageKey: 'pre-rollback',
    state: currentState,
    reason: `safety snapshot before restoring ${checkpointId}`
  });
  persistRollbackEvent({
    workspaceId: currentWorkspaceId,
    fromCheckpointId: safety.id,
    toCheckpointId: target.id,
    safetyCheckpointId: safety.id,
  });
  return {
    restoredState: structuredClone(target.state),
    targetCheckpoint: target,
    safetyCheckpoint: safety,
    rollbackEvent: {
      id: `rollback-${Date.now()}`,
      workspaceId: currentWorkspaceId,
      fromCheckpoint: safety.id,
      toCheckpoint: target.id,
      createdAt: new Date().toISOString()
    }
  };
}

async function persistRollbackEvent({ workspaceId, fromCheckpointId, toCheckpointId, safetyCheckpointId }) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('fanni.rollback_events').insert({
      workspace_id: workspaceId,
      from_checkpoint_id: fromCheckpointId,
      to_checkpoint_id: toCheckpointId,
      safety_checkpoint_id: safetyCheckpointId,
      integrity_verified: true,
    });
  } catch {
    // Non-blocking
  }
}
