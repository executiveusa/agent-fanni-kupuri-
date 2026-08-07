import { createHostedCheckout, processBillingWebhook } from '../integrations/billing.js';

function safeError(res, error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const publicCodes = new Set([
    'UNSUPPORTED_PRODUCT',
    'UNSUPPORTED_PROVIDER',
    'INVALID_RETURN_URL',
    'STRIPE_NOT_CONFIGURED',
    'CREEM_NOT_CONFIGURED',
    'BILLING_LEDGER_NOT_CONFIGURED',
    'INVALID_WEBHOOK_SIGNATURE',
    'INVALID_WEBHOOK_PAYLOAD',
    'INVALID_WEBHOOK_EVENT'
  ]);
  const code = publicCodes.has(error?.code) ? error.code : 'BILLING_ERROR';
  return res.status(status).json({ error: code, code });
}

/**
 * @param {{ post: (path: string, ...handlers: Function[]) => void }} router
 * @param {{ checkout?: typeof createHostedCheckout, webhook?: typeof processBillingWebhook }} deps
 */
export function billingRouter(router, deps = {}) {
  const checkout = deps.checkout || createHostedCheckout;
  const webhook = deps.webhook || processBillingWebhook;

  router.post('/billing/checkout', async (req, res) => {
    try {
      const { productKey, provider, successUrl, cancelUrl, language } = req.body || {};
      const result = await checkout({ productKey, provider, successUrl, cancelUrl, language });
      return res.status(201).json({
        provider: result.provider,
        checkoutId: result.id,
        requestId: result.requestId,
        url: result.url
      });
    } catch (error) {
      return safeError(res, error);
    }
  });

  router.post('/billing/webhooks/stripe', async (req, res) => {
    try {
      const result = await webhook({
        provider: 'stripe',
        rawBody: req.rawBody || '',
        signature: req.headers['stripe-signature'] || ''
      });
      return res.status(200).json(result);
    } catch (error) {
      return safeError(res, error);
    }
  });

  router.post('/billing/webhooks/creem', async (req, res) => {
    try {
      const result = await webhook({
        provider: 'creem',
        rawBody: req.rawBody || '',
        signature: req.headers['creem-signature'] || ''
      });
      return res.status(200).json(result);
    } catch (error) {
      return safeError(res, error);
    }
  });
}
