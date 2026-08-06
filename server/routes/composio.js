import { composioUserId, createComposioClient, DEFAULT_FANNI_TOOLKITS } from '../integrations/composio.js';

const READ_ONLY_TOOLS = new Set([
  'COMPOSIO_SEARCH_TOOLS',
  'COMPOSIO_GET_TOOL_SCHEMAS',
  'COMPOSIO_MANAGE_CONNECTIONS'
]);

function assertWorkspace(req) {
  const workspace = req.workspace;
  if (!workspace?.id || !workspace?.organization_id) throw new Error('Workspace context is required');
  return workspace;
}

export function composioRouter(router, { requireAuth, resolveWorkspace }) {
  const enabled = Boolean(process.env.COMPOSIO_API_KEY);
  const client = enabled ? createComposioClient({
    apiKey: process.env.COMPOSIO_API_KEY,
    baseUrl: process.env.COMPOSIO_BASE_URL || undefined,
    timeoutMs: Number(process.env.COMPOSIO_TIMEOUT_MS || 30000)
  }) : null;

  router.get('/composio/status', requireAuth, resolveWorkspace, async (req, res) => {
    const workspace = assertWorkspace(req);
    res.json({
      configured: enabled,
      workspaceId: workspace.id,
      userId: composioUserId({ organizationId: workspace.organization_id, workspaceId: workspace.id }),
      externalWritesEnabled: process.env.FANNI_ALLOW_EXTERNAL_WRITES === 'true',
      designMode: 'plain-language'
    });
  });

  router.post('/composio/session', requireAuth, resolveWorkspace, async (req, res) => {
    if (!client) return res.status(503).json({ error: 'Composio is not configured' });
    const workspace = assertWorkspace(req);
    const requested = Array.isArray(req.body?.toolkits) ? req.body.toolkits : DEFAULT_FANNI_TOOLKITS;
    const allowlist = String(process.env.COMPOSIO_ALLOWED_TOOLKITS || DEFAULT_FANNI_TOOLKITS.join(','))
      .split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
    const toolkits = requested.map(v => String(v).toLowerCase()).filter(v => allowlist.includes(v));
    const userId = composioUserId({ organizationId: workspace.organization_id, workspaceId: workspace.id });
    const session = await client.createSession({ userId, toolkits, multiAccount: true });
    res.json({
      sessionId: session.session_id || session.id,
      mcpUrl: session.mcp?.url || null,
      userId,
      toolkits,
      message: 'Your apps are ready to connect. Fanni will ask before taking consequential actions.'
    });
  });

  router.post('/composio/execute', requireAuth, resolveWorkspace, async (req, res) => {
    if (!client) return res.status(503).json({ error: 'Composio is not configured' });
    assertWorkspace(req);
    const { sessionId, tool, arguments: args, account, approvalId, checkpointId, idempotencyKey } = req.body || {};
    if (!sessionId || !tool) return res.status(400).json({ error: 'sessionId and tool are required' });

    const writesEnabled = process.env.FANNI_ALLOW_EXTERNAL_WRITES === 'true';
    const isReadOnlyMetaTool = READ_ONLY_TOOLS.has(tool);
    if (!isReadOnlyMetaTool && (!writesEnabled || !approvalId || !checkpointId)) {
      return res.status(403).json({
        error: 'Approval and checkpoint required before app actions',
        required: ['FANNI_ALLOW_EXTERNAL_WRITES=true', 'approvalId', 'checkpointId']
      });
    }

    const result = await client.execute({
      sessionId,
      tool,
      arguments: args || {},
      account,
      idempotencyKey: idempotencyKey || `fanni-${Date.now()}`
    });
    res.json({ ok: true, result });
  });
}
