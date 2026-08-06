const OPENAI_BASE = 'https://api.openai.com/v1';

export function createOpenAIAdapter(apiKey) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for the openai adapter');

  return async function openaiAdapter({ provider, input }) {
    const model = provider.model;
    if (!model) throw new Error('openai adapter: model is required');

    const messages = Array.isArray(input.messages)
      ? input.messages
      : [{ role: 'user', content: String(input.text || input.prompt || '') }];

    const body = {
      model,
      messages,
      temperature: input.temperature ?? 0.3,
      max_tokens: input.max_tokens ?? 2048
    };

    if (provider.require_json) {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(provider.timeout_ms ?? 60000)
    });

    if (!response.ok) {
      const code = response.status;
      throw new Error(`openai ${code}: ${code === 401 ? 'invalid key' : code === 429 ? 'rate_limited' : 'request_failed'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
      text: content,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      estimatedCostUsd: ((usage.prompt_tokens || 0) * 0.00000015) + ((usage.completion_tokens || 0) * 0.0000006)
    };
  };
}

export function createQvacAdapter(baseUrl, model) {
  if (!baseUrl) throw new Error('QVAC_BASE_URL is required for the local adapter');

  return async function qvacAdapter({ provider, input }) {
    const resolvedModel = model || provider.model || 'local';
    const messages = Array.isArray(input.messages)
      ? input.messages
      : [{ role: 'user', content: String(input.text || input.prompt || '') }];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: resolvedModel, messages }),
      signal: AbortSignal.timeout(provider.timeout_ms ?? 60000)
    });

    if (!response.ok) throw new Error(`qvac ${response.status}`);

    const data = await response.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      estimatedCostUsd: 0
    };
  };
}
