const GROQ_BASE = 'https://api.groq.com/openai/v1';

export function createGroqAdapter(apiKey, defaultModel = 'llama-3.3-70b-versatile') {
  if (!apiKey) throw new Error('GROQ_API_KEY is required for the groq adapter');

  return async function groqAdapter({ provider, input }) {
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

    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
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
      throw new Error(`groq ${code}: request_failed`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
      text: content,
      inputTokens: usage.prompt_tokens || 0,
      outputTokens: usage.completion_tokens || 0,
      estimatedCostUsd: 0.0000005 * ((usage.prompt_tokens || 0) + (usage.completion_tokens || 0))
    };
  };
}
