import test from 'node:test';
import assert from 'node:assert/strict';
import { composioUserId, createComposioClient } from '../server/integrations/composio.js';

test('Composio user IDs are stable and workspace-scoped', () => {
  const a = composioUserId({ organizationId: 'org-1', workspaceId: 'workspace-a' });
  const b = composioUserId({ organizationId: 'org-1', workspaceId: 'workspace-b' });
  assert.equal(a, 'fanni_org-1_workspace-a');
  assert.notEqual(a, b);
});

test('Composio session enables explicit account selection', async () => {
  let request;
  const client = createComposioClient({
    apiKey: 'test-key',
    fetchImpl: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return { ok: true, json: async () => ({ session_id: 'session-1' }) };
    }
  });

  await client.createSession({ userId: 'fanni_org_workspace', toolkits: ['gmail'] });
  assert.equal(request.options.headers['x-api-key'], 'test-key');
  assert.deepEqual(request.body.toolkits, { enable: ['gmail'] });
  assert.equal(request.body.multi_account.require_explicit_selection, true);
});

test('Composio execution forwards account and idempotency key', async () => {
  let request;
  const client = createComposioClient({
    apiKey: 'test-key',
    fetchImpl: async (_url, options) => {
      request = { options, body: JSON.parse(options.body) };
      return { ok: true, json: async () => ({ ok: true }) };
    }
  });

  await client.execute({
    sessionId: 'session-1',
    tool: 'GMAIL_GET_PROFILE',
    account: 'work-gmail',
    idempotencyKey: 'job-123'
  });
  assert.equal(request.options.headers['x-request-id'], 'job-123');
  assert.equal(request.body.account, 'work-gmail');
});
