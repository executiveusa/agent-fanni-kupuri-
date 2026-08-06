/**
 * Beads observability ledger — localStorage primary, Supabase durable secondary.
 * Tracks work items (beads) through their lifecycle with dependency graph.
 */
const LEDGER_KEY = 'fanni.beads.v1';

function readLedger() {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]'); } catch { return []; }
}

function writeLedger(items) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(LEDGER_KEY, JSON.stringify(items));
}

function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  try {
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const key = import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    return window.__fanniSupabase || null;
  } catch { return null; }
}

async function persistWorkItemToSupabase(item) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('fanni.work_items').upsert({
      id: item.id,
      workspace_id: item.workspaceId,
      title: item.title,
      type: item.type,
      status: item.status,
      workflow_key: item.workflowKey,
      stage_key: item.stageKey,
      owner: item.owner,
      depends_on: item.dependsOn,
      blocks: item.blocks,
      context_manifest_ref: item.contextManifestRef,
      checkpoint_before: item.checkpointBefore,
      checkpoint_after: item.checkpointAfter,
      artifacts: item.artifacts,
      proof: item.proof,
      risks: item.risks,
      rollback_ref: item.rollbackRef,
      next_action: item.nextAction,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    });
  } catch {
    // Non-blocking — local store is source of truth for this session
  }
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
  persistWorkItemToSupabase(item); // fire-and-forget durable write
  return item;
}

export function updateWorkItem(id, patch) {
  const ledger = readLedger();
  const index = ledger.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('work item not found');
  ledger[index] = { ...ledger[index], ...patch, id, updatedAt: new Date().toISOString() };
  writeLedger(ledger);
  persistWorkItemToSupabase(ledger[index]); // fire-and-forget durable sync
  return ledger[index];
}

export function getReadyWork(workspaceId) {
  const ledger = readLedger();
  const complete = new Set(ledger.filter((item) => item.status === 'complete').map((item) => item.id));
  return ledger
    .filter((item) =>
      item.workspaceId === workspaceId &&
      ['ready', 'blocked'].includes(item.status) &&
      item.dependsOn.every((id) => complete.has(id))
    )
    .map((item) => ({ ...item, status: 'ready' }));
}

export function listWorkItems(workspaceId) {
  return readLedger().filter((item) => !workspaceId || item.workspaceId === workspaceId);
}
