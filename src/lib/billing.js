const API_BASE = import.meta.env.VITE_FANNI_API_BASE_URL || '';

export function billingConfigured() {
  return Boolean(API_BASE);
}

/**
 * Start a hosted checkout through the configured Fanni runtime.
 * Card data is never collected by the Fanni frontend.
 * @param {{ productKey: string, provider: 'stripe' | 'creem', language: string }} input
 */
export async function createHostedCheckout({ productKey, provider, language }) {
  if (!API_BASE) {
    throw new Error('BILLING_NOT_CONFIGURED');
  }

  const response = await fetch(`${API_BASE}/api/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productKey,
      provider,
      language,
      successUrl: `${window.location.origin}/#/checkout/success`,
      cancelUrl: `${window.location.origin}/#/checkout/cancelled`
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    const error = new Error(payload.error || 'CHECKOUT_FAILED');
    error.code = payload.code || response.status;
    throw error;
  }

  return payload;
}
