const COHERE_BASE = 'https://api.cohere.com/v2';

export function createCohereAdapter(apiKey, defaultModel = 'command-r-plus') {
  if (!apiKey) throw new Error('COHERE_API_KEY/COMMAND_R_API_KEY is required for Cohere adapter');

  return async function cohereAdapter({ provider, input }) {
    const model = provider.model || defaultModel;
    const messages = Array.isArray(input.messages)
      ? input.messages
      : [{ role: 'user', content: String(input.text || input.prompt || '') }];

    const response = await fetch(`${COHERE_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: input.temperature ?? 0.3
      }),
      signal: AbortSignal.timeout(provider?.timeout_ms ?? 60000)
    });

    if (!response.ok) throw new Error(`cohere ${response.status}: request_failed`);

    const data = await response.json();
    const content = data.message?.content?.[0]?.text || data.text || '';
    const usage = data.usage?.tokens || {};

    return {
      text: content,
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      estimatedCostUsd: 0.000003 * ((usage.input_tokens || 0) + (usage.output_tokens || 0))
    };
  };
}
