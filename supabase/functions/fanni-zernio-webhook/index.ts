import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const secret = Deno.env.get('ZERNIO_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret || !supabaseUrl || !serviceRole) return json({ error: 'Webhook is not configured' }, 503);

  const rawBody = await request.text();
  const signature = request.headers.get('x-zernio-signature') || '';
  const eventIdHeader = request.headers.get('x-zernio-event-id');
  const valid = await verifyHmac(rawBody, signature, secret);
  if (!valid) return json({ error: 'Invalid signature' }, 401);

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const eventId = String(eventIdHeader || payload.id || '');
  const eventType = String(payload.type || payload.event || 'unknown');
  if (!eventId) return json({ error: 'Missing event id' }, 400);

  const profileId = readString(payload, ['profileId', 'profile.id', 'account.profileId', 'number.profileId']);
  const accountId = readString(payload, ['accountId', 'account.id']);
  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

  let organizationId: string | null = null;
  let workspaceId: string | null = null;
  if (profileId) {
    const { data: integration } = await admin
      .schema('fanni')
      .from('social_integrations')
      .select('organization_id, workspace_id')
      .eq('provider', 'zernio')
      .eq('external_profile_id', profileId)
      .maybeSingle();
    organizationId = integration?.organization_id || null;
    workspaceId = integration?.workspace_id || null;
  }

  const record = {
    id: eventId,
    provider: 'zernio',
    event_type: eventType,
    organization_id: organizationId,
    workspace_id: workspaceId,
    external_profile_id: profileId,
    external_account_id: accountId,
    payload_redacted: redact(payload),
    signature_valid: true,
    processing_status: workspaceId ? 'accepted' : 'ignored',
  };

  const { error } = await admin.schema('fanni').from('social_webhook_events').upsert(record, { onConflict: 'id', ignoreDuplicates: true });
  if (error) return json({ error: 'Persistence failed', code: error.code }, 500);

  return json({ accepted: true, duplicateSafe: true, routed: Boolean(workspaceId) }, 202);
});

async function verifyHmac(body: string, signature: string, secret: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const expected = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, signature.replace(/^sha256=/, '').toLowerCase());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readString(value: unknown, paths: string[]): string | null {
  for (const path of paths) {
    let current: any = value;
    for (const part of path.split('.')) current = current?.[part];
    if (typeof current === 'string' && current) return current;
  }
  return null;
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, child]) => {
    if (/token|secret|authorization|api.?key|password/i.test(key)) return [key, '[REDACTED]'];
    return [key, redact(child)];
  }));
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
