const DEFAULT_BASE_URL = 'https://backend.composio.dev/api/v3.1';

export class ComposioError extends Error {
  constructor(message, { status = 500, code = 'COMPOSIO_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ComposioError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function safeId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function composioUserId({ organizationId, workspaceId }) {
  if (!organizationId || !workspaceId) throw new Error('organizationId and workspaceId are required');
  return `fanni_${safeId(organizationId)}_${safeId(workspaceId)}`;
}

export function createComposioClient({ apiKey, baseUrl = DEFAULT_BASE_URL, timeoutMs = 30000, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('COMPOSIO_API_KEY is required');

  async function request(path, { method = 'GET', body, idempotencyKey } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        signal: controller.signal,
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
          ...(idempotencyKey ? { 'x-request-id': idempotencyKey } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ComposioError(payload.message || `Composio request failed (${response.status})`, {
          status: response.status,
          code: payload.code || 'COMPOSIO_HTTP_ERROR',
          details: payload
        });
      }
      return payload;
    } catch (error) {
      if (error?.name === 'AbortError') throw new ComposioError('Composio request timed out', { status: 504, code: 'COMPOSIO_TIMEOUT' });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    async createSession({ userId, toolkits = [], connectedAccounts = {}, multiAccount = true }) {
      return request('/tool_router/session', {
        method: 'POST',
        body: {
          user_id: userId,
          toolkits: toolkits.length ? { enable: toolkits } : undefined,
          connected_accounts: connectedAccounts,
          manage_connections: true,
          multi_account: {
            enable: multiAccount,
            max_accounts_per_toolkit: 5,
            require_explicit_selection: true
          }
        }
      });
    },
    async execute({ sessionId, tool, arguments: args = {}, account, idempotencyKey }) {
      return request(`/tool_router/session/${encodeURIComponent(sessionId)}/execute`, {
        method: 'POST',
        idempotencyKey,
        body: { tool, arguments: args, ...(account ? { account } : {}) }
      });
    },
    async getSession(sessionId) {
      return request(`/tool_router/session/${encodeURIComponent(sessionId)}`);
    }
  };
}

export const DEFAULT_FANNI_TOOLKITS = [
  'gmail', 'googlecalendar', 'googledrive', 'slack', 'notion', 'airtable',
  'hubspot', 'github', 'dropbox', 'canva', 'instagram', 'linkedin', 'facebook'
];
