import test from 'node:test';
import assert from 'node:assert/strict';
import { ZernioClient } from '../src/integrations/zernioClient.js';
import { SocialMediaWorkflow } from '../src/runtime/socialMediaWorkflow.js';

test('Zernio client sends bearer auth and stable idempotency key', async () => {
  let received;
  const client = new ZernioClient({
    apiKey: 'sk_test',
    fetchImpl: async (url, options) => {
      received = { url: String(url), options };
      return new Response(JSON.stringify({ post: { _id: 'post_1' } }), { status: 201, headers: { 'content-type': 'application/json' } });
    },
  });

  const result = await client.createPost({ content: 'Hello', platforms: [{ platform: 'linkedin', accountId: 'acc_1' }] }, { requestId: 'job-123' });
  assert.equal(received.options.headers.Authorization, 'Bearer sk_test');
  assert.equal(received.options.headers['x-request-id'], 'job-123');
  assert.equal(result.data.post._id, 'post_1');
});

test('publishing requires approval, external writes, and workspace-owned accounts', async () => {
  const calls = [];
  const repository = {
    getSocialJob: async () => ({
      id: 'job-1', organizationId: 'org-1', workspaceId: 'ws-1', content: 'Approved copy',
      platforms: [{ platform: 'instagram', accountId: 'acc-1' }], idempotencyKey: 'idem-1', timezone: 'UTC', publishNow: false,
    }),
    assertWorkspaceAccess: async (args) => calls.push(['access', args]),
    assertExternalWritesEnabled: async (workspaceId) => calls.push(['writes', workspaceId]),
    assertJobApproved: async (jobId) => calls.push(['approval', jobId]),
    assertAccountsBelongToWorkspace: async (args) => calls.push(['accounts', args]),
    createCheckpoint: async () => ({ id: 'checkpoint-1' }),
    markSocialJobSubmitted: async (value) => value,
    markSocialJobFailed: async () => {},
  };
  const zernio = { createPost: async () => ({ data: { post: { _id: 'post-1' } } }) };
  const workflow = new SocialMediaWorkflow({ zernio, repository });
  const result = await workflow.publishApprovedCampaign({ jobId: 'job-1', actorUserId: 'user-1' });

  assert.deepEqual(calls.map(([name]) => name), ['access', 'writes', 'approval', 'accounts']);
  assert.equal(result.checkpointId, 'checkpoint-1');
  assert.equal(result.externalPostId, 'post-1');
  assert.equal(result.status, 'scheduled');
});

test('cross-workspace account validation blocks before Zernio is called', async () => {
  let providerCalled = false;
  const repository = {
    getSocialJob: async () => ({
      id: 'job-2', organizationId: 'org-1', workspaceId: 'ws-a', content: 'Copy',
      platforms: [{ platform: 'facebook', accountId: 'acc-other-client' }], idempotencyKey: 'idem-2', timezone: 'UTC',
    }),
    assertWorkspaceAccess: async () => {},
    assertExternalWritesEnabled: async () => {},
    assertJobApproved: async () => {},
    assertAccountsBelongToWorkspace: async () => { throw new Error('Cross-workspace social account denied'); },
  };
  const zernio = { createPost: async () => { providerCalled = true; } };
  const workflow = new SocialMediaWorkflow({ zernio, repository });

  await assert.rejects(() => workflow.publishApprovedCampaign({ jobId: 'job-2', actorUserId: 'user-1' }), /Cross-workspace/);
  assert.equal(providerCalled, false);
});

test('client onboarding creates exactly one Zernio profile per workspace', async () => {
  let created = 0;
  const repository = {
    assertWorkspaceAccess: async () => {},
    getClientIntegration: async () => null,
    saveClientIntegration: async (value) => value,
  };
  const zernio = { createProfile: async () => { created += 1; return { data: { profile: { _id: 'profile-1', name: 'Client One' } } }; } };
  const workflow = new SocialMediaWorkflow({ zernio, repository });
  const integration = await workflow.onboardClient({ organizationId: 'org-1', workspaceId: 'ws-1', clientName: 'Client One', actorUserId: 'owner-1' });
  assert.equal(created, 1);
  assert.equal(integration.externalProfileId, 'profile-1');
  assert.equal(integration.workspaceId, 'ws-1');
});
