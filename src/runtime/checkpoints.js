const STORAGE_KEY = 'fanni.checkpoints.v1';

function readStore() {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function writeStore(items) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
