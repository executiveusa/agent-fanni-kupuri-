const LEDGER_KEY = 'fanni.beads.v1';

function readLedger() {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]'); } catch { return []; }
}

function writeLedger(items) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(LEDGER_KEY, JSON.stringify(items));
}

export function createWorkItem({ title, type = 'task', workspaceId, workflowKey, stageKey, dependsOn = [], owner = 'agent-fanni', rollbackRef = null }) {
  if (!title || !workspaceId) throw new Error('title and workspaceId are required');
  const item = {
    id: `bd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    type,
    status: dependsOn.length ? 'blocked' : 'ready',
    workspaceId,
    workflowKey,
    stageKey,
    owner,
    dependsOn,
    blocks: [],
    contextManifestRef: null,
    checkpointBefore: null,
    checkpointAfter: null,
    artifacts: [],
    proof: [],
    risks: [],
    rollbackRef,
    nextAction: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const ledger = readLedger();
  ledger.push(item);
  writeLedger(ledger);
  return item;
}

export function updateWorkItem(id, patch) {
  const ledger = readLedger();
  const index = ledger.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('work item not found');
  ledger[index] = { ...ledger[index], ...patch, id, updatedAt: new Date().toISOString() };
  writeLedger(ledger);
  return ledger[index];
}

export function getReadyWork(workspaceId) {
  const ledger = readLedger();
  const complete = new Set(ledger.filter((item) => item.status === 'complete').map((item) => item.id));
  return ledger.filter((item) => item.workspaceId === workspaceId && ['ready', 'blocked'].includes(item.status) && item.dependsOn.every((id) => complete.has(id))).map((item) => ({ ...item, status: 'ready' }));
}

export function listWorkItems(workspaceId) {
  return readLedger().filter((item) => !workspaceId || item.workspaceId === workspaceId);
}
