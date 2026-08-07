import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const BILLING_PRODUCTS = {
  problem_scan: {
    mode: 'payment',
    stripePriceEnv: 'STRIPE_PRICE_PROBLEM_SCAN',
    creemProductEnv: 'CREEM_PRODUCT_PROBLEM_SCAN'
  },
  demand_operator: {
    mode: 'subscription',
    stripePriceEnv: 'STRIPE_PRICE_DEMAND_OPERATOR',
    creemProductEnv: 'CREEM_PRODUCT_DEMAND_OPERATOR'
  },
  business_operator: {
    mode: 'subscription',
    stripePriceEnv: 'STRIPE_PRICE_BUSINESS_OPERATOR',
    creemProductEnv: 'CREEM_PRODUCT_BUSINESS_OPERATOR'
  },
  enterprise_consultation: {
    mode: 'payment',
    stripePriceEnv: 'STRIPE_PRICE_ENTERPRISE_CONSULTATION',
    creemProductEnv: 'CREEM_PRODUCT_ENTERPRISE_CONSULTATION'
  }
};

function safeJson(value) {
  if (!value || typeof value !== 'object') return {};
  const json = JSON.stringify(value, (key, item) => {
    if (/secret|token|card|authorization|api[_-]?key/i.test(key)) return '[redacted]';
    if (typeof item === 'string' && item.length > 2000) return `${item.slice(0, 2000)}…`;
    return item;
  });
  return JSON.parse(json);
}

function assertProduct(productKey) {
  const product = BILLING_PRODUCTS[productKey];
  if (!product) {
    const error = new Error('Unsupported product');
    error.code = 'UNSUPPORTED_PRODUCT';
    error.status = 400;
    throw error;
  }
  return product;
}

function assertSafeReturnUrl(value, allowedOrigins) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid return URL');
  if (!allowedOrigins.includes(url.origin)) {
    const error = new Error('Return URL origin is not allowed');
    error.code = 'INVALID_RETURN_URL';
    error.status = 400;
    throw error;
  }
  return url.toString();
}

export function resolveReturnUrls({ successUrl, cancelUrl, env = process.env }) {
  const configuredOrigin = env.FANNI_PUBLIC_SITE_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = (env.FANNI_BILLING_ALLOWED_ORIGINS || configuredOrigin)
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  return {
    successUrl: assertSafeReturnUrl(successUrl || `${configuredOrigin}/#/checkout/success`, allowedOrigins),
    cancelUrl: assertSafeReturnUrl(cancelUrl || `${configuredOrigin}/#/checkout/cancelled`, allowedOrigins)
  };
}

export function createBillingStore(env = process.env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  return {
    async recordCheckoutRequest(record) {
      const { error } = await client.schema('fanni').from('billing_checkout_requests').upsert(record, { onConflict: 'request_id' });
      if (error) throw error;
    },
    async recordEvent(record) {
      const { error } = await client.schema('fanni').from('billing_events').upsert(record, { onConflict: 'provider,event_id' });
      if (error) throw error;
    },
    async upsertEntitlement(record) {
      const { error } = await client.schema('fanni').from('billing_entitlements').upsert(record, { onConflict: 'provider,customer_ref,product_key' });
      if (error) throw error;
    }
  };
}

async function createStripeCheckout({ productKey, successUrl, cancelUrl, requestId, env, fetchImpl }) {
  const product = assertProduct(productKey);
  const apiKey = env.STRIPE_SECRET_KEY;
  const priceId = env[product.stripePriceEnv];
  if (!apiKey || !priceId) {
    const error = new Error('Stripe is not configured for this product');
    error.code = 'STRIPE_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const body = new URLSearchParams();
  body.set('mode', product.mode);
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('line_items[0][price]', priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('allow_promotion_codes', 'true');
  body.set('billing_address_collection', 'required');
  body.set('client_reference_id', requestId);
  body.set('metadata[product_key]', productKey);
  body.set('metadata[fanni_request_id]', requestId);
  if (product.mode === 'subscription') {
    body.set('subscription_data[metadata][product_key]', productKey);
    body.set('subscription_data[metadata][fanni_request_id]', requestId);
  }

  const response = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': requestId
    },
    body
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    const error = new Error(payload?.error?.message || 'Stripe checkout failed');
    error.code = 'STRIPE_CHECKOUT_FAILED';
    error.status = response.status || 502;
    throw error;
  }
  return { provider: 'stripe', id: payload.id, url: payload.url, mode: product.mode };
}

async function createCreemCheckout({ productKey, successUrl, requestId, env, fetchImpl }) {
  const product = assertProduct(productKey);
  const apiKey = env.CREEM_API_KEY;
  const productId = env[product.creemProductEnv];
  if (!apiKey || !productId) {
    const error = new Error('Creem is not configured for this product');
    error.code = 'CREEM_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const baseUrl = env.CREEM_TEST_MODE === 'true' ? 'https://test-api.creem.io' : 'https://api.creem.io';
  const response = await fetchImpl(`${baseUrl}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      request_id: requestId,
      units: 1,
      success_url: successUrl,
      metadata: {
        product_key: productKey,
        fanni_request_id: requestId
      }
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.checkout_url) {
    const error = new Error(payload?.message || payload?.error || 'Creem checkout failed');
    error.code = 'CREEM_CHECKOUT_FAILED';
    error.status = response.status || 502;
    throw error;
  }
  return { provider: 'creem', id: payload.id, url: payload.checkout_url, mode: product.mode };
}

export async function createHostedCheckout({ productKey, provider, successUrl, cancelUrl, language = 'es', env = process.env, fetchImpl = fetch, store = createBillingStore(env) }) {
  assertProduct(productKey);
  if (!['stripe', 'creem'].includes(provider)) {
    const error = new Error('Unsupported billing provider');
    error.code = 'UNSUPPORTED_PROVIDER';
    error.status = 400;
    throw error;
  }
  if (!store) {
    const error = new Error('Billing ledger is not configured');
    error.code = 'BILLING_LEDGER_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const requestId = crypto.randomUUID();
  const urls = resolveReturnUrls({ successUrl, cancelUrl, env });
  const checkout = provider === 'stripe'
    ? await createStripeCheckout({ productKey, ...urls, requestId, env, fetchImpl })
    : await createCreemCheckout({ productKey, successUrl: urls.successUrl, requestId, env, fetchImpl });

  await store.recordCheckoutRequest({
    request_id: requestId,
    provider,
    provider_checkout_id: checkout.id,
    product_key: productKey,
    mode: checkout.mode,
    language: language === 'en' ? 'en' : 'es',
    status: 'created',
    metadata_redacted: { success_origin: new URL(urls.successUrl).origin },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  return { ...checkout, requestId };
}

function timingSafeHexEqual(left, right) {
  if (!left || !right || !/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyStripeWebhook({ rawBody, signatureHeader, secret, now = Date.now(), toleranceSeconds = 300 }) {
  if (!rawBody || !signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').map(part => part.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const age = Math.abs(Math.floor(now / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some(signature => timingSafeHexEqual(expected, signature));
}

export function verifyCreemWebhook({ rawBody, signature, secret }) {
  if (!rawBody || !signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeHexEqual(expected, signature);
}

function getNested(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function normalizeStripeEvent(event) {
  const object = event?.data?.object || {};
  const metadata = object.metadata || getNested(object, 'subscription_details.metadata') || {};
  let entitlementStatus = null;
  if (['checkout.session.completed', 'invoice.paid', 'customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) entitlementStatus = 'active';
  if (['invoice.payment_failed'].includes(event.type)) entitlementStatus = 'past_due';
  if (['customer.subscription.deleted', 'charge.refunded'].includes(event.type)) entitlementStatus = 'inactive';
  return {
    eventId: event.id,
    eventType: event.type,
    productKey: metadata.product_key || null,
    requestId: metadata.fanni_request_id || object.client_reference_id || null,
    customerRef: object.customer || object.customer_email || getNested(object, 'customer_details.email') || null,
    subscriptionRef: object.subscription || (event.type.startsWith('customer.subscription.') ? object.id : null),
    entitlementStatus,
    payload: safeJson({ id: event.id, type: event.type, object })
  };
}

function normalizeCreemEvent(event) {
  const object = event?.object || {};
  const metadata = object.metadata || {};
  const eventType = event.eventType || event.type;
  let entitlementStatus = null;
  if (['checkout.completed', 'subscription.active', 'subscription.paid', 'subscription.trialing', 'subscription.update'].includes(eventType)) entitlementStatus = 'active';
  if (['subscription.past_due'].includes(eventType)) entitlementStatus = 'past_due';
  if (['subscription.canceled', 'subscription.expired', 'subscription.paused', 'refund.created', 'dispute.created'].includes(eventType)) entitlementStatus = 'inactive';
  return {
    eventId: event.id,
    eventType,
    productKey: metadata.product_key || null,
    requestId: metadata.fanni_request_id || object.request_id || event.request_id || null,
    customerRef: object.customer?.id || object.customer?.email || object.customer || null,
    subscriptionRef: object.subscription?.id || object.subscription || null,
    entitlementStatus,
    payload: safeJson({ id: event.id, eventType, object })
  };
}

export async function processBillingWebhook({ provider, rawBody, signature, env = process.env, store = createBillingStore(env), now = Date.now() }) {
  if (!store) {
    const error = new Error('Billing ledger is not configured');
    error.code = 'BILLING_LEDGER_NOT_CONFIGURED';
    error.status = 503;
    throw error;
  }

  const valid = provider === 'stripe'
    ? verifyStripeWebhook({ rawBody, signatureHeader: signature, secret: env.STRIPE_WEBHOOK_SECRET, now })
    : verifyCreemWebhook({ rawBody, signature, secret: env.CREEM_WEBHOOK_SECRET });
  if (!valid) {
    const error = new Error('Invalid webhook signature');
    error.code = 'INVALID_WEBHOOK_SIGNATURE';
    error.status = 401;
    throw error;
  }

  let event;
  try { event = JSON.parse(rawBody); } catch {
    const error = new Error('Invalid webhook payload');
    error.code = 'INVALID_WEBHOOK_PAYLOAD';
    error.status = 400;
    throw error;
  }

  const normalized = provider === 'stripe' ? normalizeStripeEvent(event) : normalizeCreemEvent(event);
  if (!normalized.eventId || !normalized.eventType) {
    const error = new Error('Webhook event is missing identity');
    error.code = 'INVALID_WEBHOOK_EVENT';
    error.status = 400;
    throw error;
  }

  await store.recordEvent({
    provider,
    event_id: normalized.eventId,
    event_type: normalized.eventType,
    request_id: normalized.requestId,
    product_key: normalized.productKey,
    customer_ref: normalized.customerRef,
    signature_valid: true,
    processing_status: 'processed',
    payload_redacted: normalized.payload,
    received_at: new Date(now).toISOString(),
    processed_at: new Date(now).toISOString()
  });

  if (normalized.entitlementStatus && normalized.productKey && normalized.customerRef) {
    await store.upsertEntitlement({
      provider,
      customer_ref: normalized.customerRef,
      product_key: normalized.productKey,
      provider_subscription_id: normalized.subscriptionRef,
      status: normalized.entitlementStatus,
      source_event_id: normalized.eventId,
      metadata_redacted: { request_id: normalized.requestId },
      updated_at: new Date(now).toISOString()
    });
  }

  return {
    received: true,
    provider,
    eventId: normalized.eventId,
    eventType: normalized.eventType,
    entitlementStatus: normalized.entitlementStatus
  };
}
