const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export function createOpenRouterAdapter(apiKey, defaultModel = 'anthropic/claude-3.5-sonnet') {
  if (!apiKey) throw new Error('OPEN_ROUTER_API is required for OpenRouter adapter');

  return async function openrouterAdapter({ provider, input }) {
    const model = provider.model || defaultModel;
    const messages = Array.isArray(input.messages)
      ? input.messages
      : [{ role: 'user', content: String(input.text || input.prompt || '') }];

    const body = {
      model,
      messages,
      temperature: input.temperature ?? 0.3,
      max_tokens: input.max_tokens ?? 2048
    };

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(provider?.timeout_ms ?? 60000)
    });

    if (!response.ok) throw new Error(`openrouter ${response.status}: request_failed`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
      text: content,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      estimatedCostUsd: 0
    };
  };
}
