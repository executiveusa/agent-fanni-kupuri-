import test from 'node:test';
import assert from 'node:assert/strict';

// Simulate browser localStorage for Node.js test environment
const store = {};
global.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
};

// Simulate import.meta.env (not available in plain Node)
if (!global.import) {
  // Patch is handled by import.meta being undefined in test context;
  // getSupabaseClient() returns null gracefully when window is undefined
}

// Clear between tests
function clearStore() {
  Object.keys(store).forEach((k) => delete store[k]);
}

const { createCheckpoint, listCheckpoints, restoreCheckpoint } =
  await import('../src/runtime/checkpoints.js');

test('creates a checkpoint with required fields', () => {
  clearStore();
  const cp = createCheckpoint({
    workspaceId: 'ws-test',
    workflowKey: 'media-intelligence-weekly',
    stageKey: 'ingest',
    state: { records: 42 },
  });
  assert.match(cp.id, /^cp-\d+-[a-z0-9]+$/);
  assert.equal(cp.workspaceId, 'ws-test');
  assert.equal(cp.workflowKey, 'media-intelligence-weekly');
  assert.equal(cp.stageKey, 'ingest');
  assert.equal(cp.state.records, 42);
  assert.equal(cp.verified, true);
  assert.ok(cp.createdAt);
});

test('rejects checkpoint with incomplete identity', () => {
  clearStore();
  assert.throws(
    () => createCheckpoint({ workspaceId: 'ws-test', workflowKey: 'wf', stageKey: '' }),
    /checkpoint identity incomplete/
  );
  assert.throws(
    () => createCheckpoint({ workspaceId: '', workflowKey: 'wf', stageKey: 'stage' }),
    /checkpoint identity incomplete/
  );
});

test('lists checkpoints scoped to workspace', () => {
  clearStore();
  createCheckpoint({ workspaceId: 'ws-a', workflowKey: 'wf', stageKey: 's1', state: {} });
  createCheckpoint({ workspaceId: 'ws-b', workflowKey: 'wf', stageKey: 's1', state: {} });
  createCheckpoint({ workspaceId: 'ws-a', workflowKey: 'wf', stageKey: 's2', state: {} });

  const forA = listCheckpoints('ws-a');
  assert.equal(forA.length, 2);
  assert.ok(forA.every((cp) => cp.workspaceId === 'ws-a'));

  const forB = listCheckpoints('ws-b');
  assert.equal(forB.length, 1);
});

test('restores checkpoint and creates safety snapshot', () => {
  clearStore();
  const original = createCheckpoint({
    workspaceId: 'ws-test',
    workflowKey: 'wf',
    stageKey: 'classify',
    state: { signals: 10 },
  });
  const currentState = { signals: 25 };
  const result = restoreCheckpoint({
    checkpointId: original.id,
    currentWorkspaceId: 'ws-test',
    currentState,
  });

  assert.deepEqual(result.restoredState, { signals: 10 });
  assert.equal(result.targetCheckpoint.id, original.id);
  assert.match(result.safetyCheckpoint.id, /^cp-/);
  assert.equal(result.safetyCheckpoint.stageKey, 'pre-rollback');
  assert.deepEqual(result.safetyCheckpoint.state, currentState);
  assert.match(result.rollbackEvent.id, /^rollback-/);
});

test('denies cross-workspace rollback', () => {
  clearStore();
  const cp = createCheckpoint({
    workspaceId: 'ws-owner',
    workflowKey: 'wf',
    stageKey: 'stage',
    state: {},
  });
  assert.throws(
    () => restoreCheckpoint({ checkpointId: cp.id, currentWorkspaceId: 'ws-attacker', currentState: {} }),
    /cross-workspace rollback denied/
  );
});

test('throws when checkpoint not found', () => {
  clearStore();
  assert.throws(
    () => restoreCheckpoint({ checkpointId: 'cp-nonexistent', currentWorkspaceId: 'ws-a', currentState: {} }),
    /checkpoint not found/
  );
});

test('state is deep-cloned, not shared by reference', () => {
  clearStore();
  const state = { arr: [1, 2, 3] };
  const cp = createCheckpoint({ workspaceId: 'ws-test', workflowKey: 'wf', stageKey: 'stage', state });
  state.arr.push(4); // mutate original
  assert.equal(cp.state.arr.length, 3); // checkpoint state should be unaffected

  const restored = restoreCheckpoint({ checkpointId: cp.id, currentWorkspaceId: 'ws-test', currentState: {} });
  restored.restoredState.arr.push(99);
  const cpAgain = listCheckpoints('ws-test').find((c) => c.id === cp.id);
  assert.equal(cpAgain.state.arr.length, 3); // ledger state unaffected by restored mutation
});
