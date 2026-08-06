// After each completed assistant turn, fires a lightweight checkpoint notification
// so the Beads ledger and Supabase durable layer stay current.
// Only fires when the message phase is 'assistant-response' and the turn is complete.

export default async function fanniCheckpointHook(ctx) {
  if (ctx.phase !== 'assistant-response') return;

  const sidecarUrl = globalThis.__fanniSidecarUrl || 'http://localhost:3001';
  const jwt = globalThis.__fanniJwt;
  const workspace = globalThis.__fanniWorkspace;

  if (!jwt || !workspace?.slug) return;

  // Best-effort fire-and-forget — never block the UI
  try {
    await fetch(`${sidecarUrl}/workflow/checkpoint`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'X-Fanni-Workspace': workspace.slug,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'assistant-turn',
        turnIndex: ctx.history?.length ?? 0
      })
    });
  } catch {
    // silently ignore — checkpoint is observability only, never blocking
  }
}
