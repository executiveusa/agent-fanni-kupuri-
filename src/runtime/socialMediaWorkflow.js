import crypto from 'node:crypto';
import { ZernioClient } from '../integrations/zernioClient.js';

export class SocialMediaWorkflow {
  constructor({ zernio = new ZernioClient(), repository, clock = () => new Date() } = {}) {
    if (!repository) throw new Error('A social repository adapter is required');
    this.zernio = zernio;
    this.repository = repository;
    this.clock = clock;
  }

  async onboardClient({ organizationId, workspaceId, clientName, description, color, actorUserId }) {
    assertRequired({ organizationId, workspaceId, clientName, actorUserId });
    await this.repository.assertWorkspaceAccess({ organizationId, workspaceId, actorUserId, minimumRole: 'admin' });

    const existing = await this.repository.getClientIntegration({ workspaceId, provider: 'zernio' });
    if (existing?.externalProfileId) return existing;

    const { data } = await this.zernio.createProfile({ name: clientName, description, color });
    const profile = data?.profile;
    if (!profile?._id) throw new Error('Zernio profile creation did not return profile._id');

    return this.repository.saveClientIntegration({
      organizationId,
      workspaceId,
      provider: 'zernio',
      externalProfileId: profile._id,
      externalProfileName: profile.name || clientName,
      status: 'pending_accounts',
      createdBy: actorUserId,
    });
  }

  async createAccountConnectUrl({ workspaceId, platform, redirectUrl, actorUserId }) {
    await this.repository.assertWorkspaceAccess({ workspaceId, actorUserId, minimumRole: 'admin' });
    const integration = await this.#integration(workspaceId);
    return this.zernio.getConnectUrl({ platform, profileId: integration.externalProfileId, redirectUrl });
  }

  async prepareCampaign({ organizationId, workspaceId, brief, platforms, scheduledFor, timezone = 'UTC', actorUserId }) {
    assertRequired({ organizationId, workspaceId, brief, platforms, actorUserId });
    await this.repository.assertWorkspaceAccess({ organizationId, workspaceId, actorUserId, minimumRole: 'operator' });
    const integration = await this.#integration(workspaceId);
    const workItemId = crypto.randomUUID();
    const idempotencyKey = `fanni-social-${workspaceId}-${workItemId}`;

    return this.repository.createSocialJob({
      id: workItemId,
      organizationId,
      workspaceId,
      externalProfileId: integration.externalProfileId,
      brief,
      platforms,
      scheduledFor,
      timezone,
      idempotencyKey,
      status: 'draft',
      externalWrite: true,
      requiresApproval: true,
      createdBy: actorUserId,
    });
  }

  async approveCampaign({ jobId, actorUserId, rationale }) {
    const job = await this.repository.getSocialJob(jobId);
    await this.repository.assertWorkspaceAccess({ workspaceId: job.workspaceId, actorUserId, minimumRole: 'reviewer' });
    return this.repository.recordApproval({
      organizationId: job.organizationId,
      workspaceId: job.workspaceId,
      jobId,
      actorUserId,
      decision: 'approved',
      rationale,
    });
  }

  async publishApprovedCampaign({ jobId, actorUserId }) {
    const job = await this.repository.getSocialJob(jobId);
    await this.repository.assertWorkspaceAccess({ workspaceId: job.workspaceId, actorUserId, minimumRole: 'operator' });
    await this.repository.assertExternalWritesEnabled(job.workspaceId);
    await this.repository.assertJobApproved(jobId);
    await this.repository.assertAccountsBelongToWorkspace({ workspaceId: job.workspaceId, accountIds: job.platforms.map((p) => p.accountId) });

    const checkpoint = await this.repository.createCheckpoint({
      organizationId: job.organizationId,
      workspaceId: job.workspaceId,
      objectType: 'social_job',
      objectId: job.id,
      state: job,
      createdBy: actorUserId,
    });

    const payload = {
      content: job.content,
      mediaItems: job.mediaItems || [],
      platforms: job.platforms,
      scheduledFor: job.scheduledFor || undefined,
      publishNow: job.publishNow === true,
      timezone: job.timezone || 'UTC',
      tags: job.tags || [],
    };

    try {
      const result = await this.zernio.createPost(payload, { requestId: job.idempotencyKey });
      return this.repository.markSocialJobSubmitted({
        jobId,
        checkpointId: checkpoint.id,
        providerResponse: redactProviderResponse(result.data),
        externalPostId: result.data?.post?._id || result.data?.id || result.data?.existingPost?._id,
        status: job.publishNow ? 'publishing' : 'scheduled',
        submittedAt: this.clock().toISOString(),
      });
    } catch (error) {
      await this.repository.markSocialJobFailed({ jobId, checkpointId: checkpoint.id, error: sanitizeError(error) });
      throw error;
    }
  }

  async syncInbox({ workspaceId, actorUserId, platform, since }) {
    await this.repository.assertWorkspaceAccess({ workspaceId, actorUserId, minimumRole: 'operator' });
    const integration = await this.#integration(workspaceId);
    const { data } = await this.zernio.listCommentedPosts({ profileId: integration.externalProfileId, platform, since });
    return this.repository.upsertInboxItems({ workspaceId, provider: 'zernio', items: data?.data || [] });
  }

  async prepareCommentReply({ workspaceId, postId, accountId, commentId, message, actorUserId }) {
    await this.repository.assertWorkspaceAccess({ workspaceId, actorUserId, minimumRole: 'operator' });
    await this.repository.assertAccountsBelongToWorkspace({ workspaceId, accountIds: [accountId] });
    return this.repository.createSocialAction({
      workspaceId,
      actionType: 'reply_comment',
      payload: { postId, accountId, commentId, message },
      requiresApproval: true,
      createdBy: actorUserId,
    });
  }

  async sendApprovedReply({ actionId, actorUserId }) {
    const action = await this.repository.getSocialAction(actionId);
    await this.repository.assertWorkspaceAccess({ workspaceId: action.workspaceId, actorUserId, minimumRole: 'operator' });
    await this.repository.assertExternalWritesEnabled(action.workspaceId);
    await this.repository.assertActionApproved(actionId);
    const result = await this.zernio.replyToComment(action.payload);
    return this.repository.completeSocialAction({ actionId, providerResponse: redactProviderResponse(result.data) });
  }

  async #integration(workspaceId) {
    const integration = await this.repository.getClientIntegration({ workspaceId, provider: 'zernio' });
    if (!integration?.externalProfileId) throw new Error('Workspace has not been onboarded to Zernio');
    return integration;
  }
}

function assertRequired(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      throw new Error(`${key} is required`);
    }
  }
}

function redactProviderResponse(value) {
  if (!value || typeof value !== 'object') return value;
  const clone = structuredClone(value);
  for (const key of ['accessToken', 'refreshToken', 'apiKey', 'secret']) if (key in clone) clone[key] = '[REDACTED]';
  return clone;
}

function sanitizeError(error) {
  return { name: error?.name, message: error?.message, code: error?.code, status: error?.status, retryable: Boolean(error?.retryable) };
}
