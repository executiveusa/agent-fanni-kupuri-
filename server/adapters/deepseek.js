const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

export function createDeepSeekAdapter(apiKey, defaultModel = 'deepseek-chat') {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is required for the deepseek adapter');

  return async function deepseekAdapter({ provider, input }) {
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

    const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(provider?.timeout_ms ?? 60000)
    });

    if (!response.ok) {
      const code = response.status;
      throw new Error(`deepseek ${code}: request_failed`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
      text: content,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      estimatedCostUsd: ((usage.prompt_tokens || 0) * 0.00000014) + ((usage.completion_tokens || 0) * 0.00000028)
    };
  };
}
