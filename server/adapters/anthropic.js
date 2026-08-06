const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';

export function createAnthropicAdapter(apiKey, defaultModel = 'claude-3-5-sonnet-20241022') {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for Anthropic adapter');

  return async function anthropicAdapter({ provider, input }) {
    const model = provider.model || defaultModel;
    const rawMessages = Array.isArray(input.messages)
      ? input.messages
      : [{ role: 'user', content: String(input.text || input.prompt || '') }];

    let systemPrompt = '';
    const messages = [];

    for (const m of rawMessages) {
      if (m.role === 'system') systemPrompt += (systemPrompt ? '\n\n' : '') + m.content;
      else messages.push({ role: m.role, content: m.content });
    }

    const body = {
      model,
      messages,
      max_tokens: input.max_tokens ?? 2048,
      temperature: input.temperature ?? 0.3
    };
    if (systemPrompt) body.system = systemPrompt;

    const response = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(provider?.timeout_ms ?? 60000)
    });

    if (!response.ok) throw new Error(`anthropic ${response.status}: request_failed`);

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    const usage = data.usage || {};

    return {
      text: content,
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      estimatedCostUsd: ((usage.input_tokens || 0) * 0.000003) + ((usage.output_tokens || 0) * 0.000015)
    };
  };
}
