const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
  ]);
}

export async function routeProvider({ route, adapters, input, onAttempt = () => {} }) {
  if (!route?.primary) throw new Error('provider route missing primary');
  const providers = [route.primary, ...(route.fallbacks || [])];
  const maxRetries = route.max_retries ?? 0;
  const timeoutMs = route.timeout_ms ?? 30000;
  const errors = [];

  for (const provider of providers) {
    const adapter = adapters[provider.provider];
    if (!adapter) {
      errors.push({ provider: provider.provider, error: 'adapter missing' });
      continue;
    }

    for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
      onAttempt({ provider: provider.provider, attempt });
      try {
        const output = await withTimeout(adapter({ provider, input, route }), timeoutMs);
        return { provider: provider.provider, attempt, output, failures: errors };
      } catch (error) {
        errors.push({ provider: provider.provider, attempt, error: error.message });
        if (attempt <= maxRetries) await wait(Math.min(2000, 250 * 2 ** (attempt - 1)));
      }
    }
  }

  const failure = new Error('all provider routes failed');
  failure.failures = errors;
  throw failure;
}

export function resolveConfiguredModel(provider, env = {}) {
  const model = provider.model_env ? env[provider.model_env] : provider.model;
  if (provider.model_env && !model) throw new Error(`missing model environment variable ${provider.model_env}`);
  return { ...provider, model };
}
