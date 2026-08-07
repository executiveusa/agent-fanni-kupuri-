import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  createHostedCheckout,
  processBillingWebhook,
  resolveReturnUrls,
  verifyCreemWebhook,
  verifyStripeWebhook
} from '../server/integrations/billing.js';

function makeStore() {
  const records = { checkouts: [], events: [], entitlements: [] };
  return {
    records,
    async recordCheckoutRequest(value) { records.checkouts.push(value); },
    async recordEvent(value) { records.events.push(value); },
    async upsertEntitlement(value) { records.entitlements.push(value); }
  };
}

const baseEnv = {
  FANNI_PUBLIC_SITE_ORIGIN: 'https://fanni.example',
  FANNI_BILLING_ALLOWED_ORIGINS: 'https://fanni.example,https://preview.fanni.example',
  STRIPE_SECRET_KEY: 'stripe-test-secret',
  STRIPE_PRICE_PROBLEM_SCAN: 'price_problem_scan',
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
  CREEM_API_KEY: 'creem-test-secret',
  CREEM_PRODUCT_PROBLEM_SCAN: 'prod_problem_scan',
  CREEM_WEBHOOK_SECRET: 'creem_webhook_test',
  CREEM_TEST_MODE: 'true'
};

test('billing return URLs reject foreign origins', () => {
  assert.throws(
    () => resolveReturnUrls({
      successUrl: 'https://attacker.example/success',
      cancelUrl: 'https://fanni.example/#/checkout/cancelled',
      env: baseEnv
    }),
    error => error.code === 'INVALID_RETURN_URL'
  );
});

test('Stripe checkout uses hosted session and records request before access', async () => {
  const store = makeStore();
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      async json() { return { id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' }; }
    };
  };

  const result = await createHostedCheckout({
    productKey: 'problem_scan',
    provider: 'stripe',
    successUrl: 'https://fanni.example/#/checkout/success',
    cancelUrl: 'https://fanni.example/#/checkout/cancelled',
    language: 'es',
    env: baseEnv,
    fetchImpl,
    store
  });

  assert.equal(result.provider, 'stripe');
  assert.match(result.url, /^https:\/\/checkout\.stripe\.com/);
  assert.equal(request.url, 'https://api.stripe.com/v1/checkout/sessions');
  assert.equal(request.options.method, 'POST');
  assert.match(request.options.headers.Authorization, /^Bearer /);
  assert.ok(request.options.headers['Idempotency-Key']);
  assert.equal(store.records.checkouts.length, 1);
  assert.equal(store.records.entitlements.length, 0);
});

test('Creem checkout uses hosted checkout URL and records request', async () => {
  const store = makeStore();
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      async json() { return { id: 'ch_test_123', checkout_url: 'https://checkout.creem.io/ch_test_123' }; }
    };
  };

  const result = await createHostedCheckout({
    productKey: 'problem_scan',
    provider: 'creem',
    successUrl: 'https://fanni.example/#/checkout/success',
    cancelUrl: 'https://fanni.example/#/checkout/cancelled',
    language: 'en',
    env: baseEnv,
    fetchImpl,
    store
  });

  assert.equal(result.provider, 'creem');
  assert.equal(request.url, 'https://test-api.creem.io/v1/checkouts');
  assert.equal(request.options.headers['x-api-key'], baseEnv.CREEM_API_KEY);
  assert.equal(store.records.checkouts.length, 1);
  assert.equal(store.records.entitlements.length, 0);
});

test('Stripe webhook verification enforces signature and timestamp tolerance', () => {
  const rawBody = JSON.stringify({ id: 'evt_1' });
  const now = 1_800_000_000_000;
  const timestamp = Math.floor(now / 1000);
  const signature = crypto.createHmac('sha256', baseEnv.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  assert.equal(verifyStripeWebhook({
    rawBody,
    signatureHeader: `t=${timestamp},v1=${signature}`,
    secret: baseEnv.STRIPE_WEBHOOK_SECRET,
    now
  }), true);
  assert.equal(verifyStripeWebhook({
    rawBody,
    signatureHeader: `t=${timestamp - 1000},v1=${signature}`,
    secret: baseEnv.STRIPE_WEBHOOK_SECRET,
    now
  }), false);
});

test('Creem webhook verification uses HMAC over raw body', () => {
  const rawBody = JSON.stringify({ id: 'evt_creem_1' });
  const signature = crypto.createHmac('sha256', baseEnv.CREEM_WEBHOOK_SECRET).update(rawBody).digest('hex');
  assert.equal(verifyCreemWebhook({ rawBody, signature, secret: baseEnv.CREEM_WEBHOOK_SECRET }), true);
  assert.equal(verifyCreemWebhook({ rawBody, signature: '00', secret: baseEnv.CREEM_WEBHOOK_SECRET }), false);
});

test('verified Stripe event activates entitlement through ledger', async () => {
  const store = makeStore();
  const now = 1_800_000_000_000;
  const timestamp = Math.floor(now / 1000);
  const event = {
    id: 'evt_checkout_complete',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        customer: 'cus_123',
        metadata: {
          product_key: 'problem_scan',
          fanni_request_id: 'f36b4699-21d7-4b1d-9f61-3d2077fe30a1'
        }
      }
    }
  };
  const rawBody = JSON.stringify(event);
  const signature = crypto.createHmac('sha256', baseEnv.STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const result = await processBillingWebhook({
    provider: 'stripe',
    rawBody,
    signature: `t=${timestamp},v1=${signature}`,
    env: baseEnv,
    store,
    now
  });

  assert.equal(result.entitlementStatus, 'active');
  assert.equal(store.records.events.length, 1);
  assert.equal(store.records.entitlements.length, 1);
  assert.equal(store.records.entitlements[0].status, 'active');
  assert.equal(store.records.entitlements[0].product_key, 'problem_scan');
});

test('invalid webhook signature fails without changing entitlement', async () => {
  const store = makeStore();
  await assert.rejects(
    processBillingWebhook({
      provider: 'creem',
      rawBody: JSON.stringify({ id: 'evt_bad', eventType: 'checkout.completed' }),
      signature: 'deadbeef',
      env: baseEnv,
      store
    }),
    error => error.code === 'INVALID_WEBHOOK_SIGNATURE'
  );
  assert.equal(store.records.events.length, 0);
  assert.equal(store.records.entitlements.length, 0);
});

test('verified Creem checkout event activates entitlement', async () => {
  const store = makeStore();
  const now = 1_800_000_000_000;
  const event = {
    id: 'evt_creem_complete',
    eventType: 'checkout.completed',
    object: {
      customer: { id: 'cust_creem_1' },
      metadata: {
        product_key: 'problem_scan',
        fanni_request_id: 'dcf337af-7bc6-4f90-af35-891c83def265'
      }
    }
  };
  const rawBody = JSON.stringify(event);
  const signature = crypto.createHmac('sha256', baseEnv.CREEM_WEBHOOK_SECRET).update(rawBody).digest('hex');

  const result = await processBillingWebhook({
    provider: 'creem',
    rawBody,
    signature,
    env: baseEnv,
    store,
    now
  });

  assert.equal(result.entitlementStatus, 'active');
  assert.equal(store.records.events.length, 1);
  assert.equal(store.records.entitlements.length, 1);
  assert.equal(store.records.entitlements[0].customer_ref, 'cust_creem_1');
});
