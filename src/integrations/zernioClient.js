import crypto from 'node:crypto';

const DEFAULT_BASE_URL = 'https://zernio.com/api/v1';

export class ZernioError extends Error {
  constructor(message, { status, code, details, retryable = false } = {}) {
    super(message);
    this.name = 'ZernioError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

export class ZernioClient {
  constructor({
    apiKey = process.env.ZERNIO_API_KEY,
    baseUrl = process.env.ZERNIO_BASE_URL || DEFAULT_BASE_URL,
    timeoutMs = Number(process.env.ZERNIO_TIMEOUT_MS || 30000),
    fetchImpl = globalThis.fetch,
  } = {}) {
    if (!apiKey) throw new Error('ZERNIO_API_KEY is required');
    if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async request(path, { method = 'GET', body, query, requestId } = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const logicalRequestId = requestId || crypto.randomUUID();

    try {
      const response = await this.fetchImpl(url, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-request-id': logicalRequestId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const text = await response.text();
      const data = text ? safeJson(text) : null;
      if (!response.ok) {
        throw new ZernioError(data?.error || data?.message || `Zernio request failed (${response.status})`, {
          status: response.status,
          code: data?.code,
          details: data,
          retryable: response.status === 429 || response.status >= 500,
        });
      }
      return { data, requestId: logicalRequestId, status: response.status };
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new ZernioError('Zernio request timed out', { code: 'timeout', retryable: true });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  authCheck() {
    return this.request('/profiles');
  }

  createProfile({ name, description, color }) {
    return this.request('/profiles', { method: 'POST', body: { name, description, color } });
  }

  getProfile(profileId) {
    return this.request(`/profiles/${encodeURIComponent(profileId)}`);
  }

  createScopedKey({ name, profileIds, permission = 'read-write', expiresIn }) {
    return this.request('/api-keys', {
      method: 'POST',
      body: { name, scope: 'profiles', profileIds, permission, expiresIn },
    });
  }

  getConnectUrl({ platform, profileId, redirectUrl }) {
    return this.request(`/connect/${encodeURIComponent(platform)}`, {
      query: { profileId, redirect_url: redirectUrl },
    });
  }

  listAccounts({ profileId, platform }) {
    return this.request('/accounts', { query: { profileId, platform } });
  }

  createPost(payload, { requestId } = {}) {
    return this.request('/posts', { method: 'POST', body: payload, requestId });
  }

  listPosts(query = {}) {
    return this.request('/posts', { query });
  }

  listAnalytics(query = {}) {
    return this.request('/analytics', { query });
  }

  listCommentedPosts(query = {}) {
    return this.request('/inbox/comments', { query });
  }

  getComments({ postId, accountId, limit = 25, cursor }) {
    return this.request(`/inbox/comments/${encodeURIComponent(postId)}`, {
      query: { accountId, limit, cursor },
    });
  }

  replyToComment({ postId, accountId, message, commentId, attachmentUrl }) {
    return this.request(`/inbox/comments/${encodeURIComponent(postId)}`, {
      method: 'POST',
      body: { accountId, message, commentId, attachmentUrl },
    });
  }

  listConversations(query = {}) {
    return this.request('/inbox/conversations', { query });
  }

  createWebhook({ name, url, events, secret }) {
    return this.request('/webhooks/settings', {
      method: 'POST',
      body: { name, url, events, secret },
    });
  }
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
