# Fanni Public Site

## Product role

The public website is Agent Fanni's evidence-led commercial and build-in-public surface.

It combines:

1. a COLLINS-inspired editorial information hierarchy;
2. business programs organized around demand, reputation, and owner capacity;
3. evidence-led project pages;
4. an approval-controlled build-in-public ledger;
5. a full-body stylized Fanni character;
6. a Space Agent hover, focus, click, and touch surface;
7. hosted Stripe and Creem checkout;
8. the executable Fanni Site Gauntlet.

The public site and authenticated Space Agent workspace share one brand but do not use the same visual density. The public site is expressive and editorial. The authenticated application remains calm and operational.

## Public routes

| Route | Purpose |
|---|---|
| `/#/` | Editorial homepage |
| `/#/programs/:slug` | Paid problem-solving program |
| `/#/work/:slug` | Evidence-led project or assignment |
| `/#/signals/:slug` | Signal Lab research and offer hypothesis |
| `/#/checkout/:slug` | Hosted Stripe or Creem checkout selection |
| `/#/checkout/success` | Payment-return state; does not grant access |
| `/#/checkout/cancelled` | Cancelled hosted checkout state |
| `/#/app/chat` | Space Agent operating surface |

## Public project taxonomy

A project must be classified before publication:

- **Case study** — completed, permissioned, and evidence-backed.
- **Active assignment** — current real work without final outcome claims.
- **Pilot** — real but intentionally limited.
- **Lab** — synthetic, internal, or experimental proof.
- **Internal** — Kupuri-owned work.
- **Private** — real work whose identifying details are restricted.

A lab must never be described as a client case study. A private company must never be named without publication permission.

## Database publication layer

Migration:

`supabase/migrations/20260807010000_fanni_public_site_and_billing.sql`

Public content tables:

- `fanni.public_programs`
- `fanni.public_projects`
- `fanni.project_updates`
- `fanni.public_case_studies`
- `fanni.public_case_study_metrics`
- `fanni.signal_lab_entries`
- `fanni.public_evidence`
- `fanni.commercial_offers`

Private commercial tables:

- `fanni.lead_diagnostics`
- `fanni.billing_checkout_requests`
- `fanni.billing_events`
- `fanni.billing_entitlements`

Anonymous users may only read published public records allowed by RLS. Billing and lead tables have no anonymous read policy.

### Case-study publication gate

A public case study requires:

- `publication_status = 'published'`;
- `visibility = 'public'` or `anonymized`;
- `client_permission_status = 'approved'`;
- `approved_at`;
- `last_verified_at`;
- at least one evidence reference.

### Evidence publication gate

Public evidence requires:

- verified status;
- verifier identity;
- verification timestamp;
- published state;
- permitted visibility.

## Full-body character

Component:

`src/components/FanniCharacter.jsx`

Fanni is a stylized editorial cartoon octopus, not a photorealistic person. Her eight arms represent:

1. Listen
2. Verify
3. Understand
4. Decide
5. Act
6. Measure
7. Protect
8. Learn

The character remains visible on mobile. Essential actions never depend on hover.

## Space Agent overlay

Component:

`src/components/FanniDesk.jsx`

The public first-contact flow offers exactly three choices:

- Find customers
- Protect my reputation
- Organize my business

The choice is stored as `fanni_public_intent` and the visitor is sent to the Space Agent route. The operating application remains the place for extended work, tools, approvals, and history.

## Programs and offers

### Fanni Demand

Find repeated customer problems, paid opportunities, local demand changes, and evidence-backed content direction.

### Fanni Reputation

Verify narratives, map regional impact, route incidents, and prepare approved responses.

### Fanni Operations

Handle WhatsApp intake, approvals, follow-up, social operations, reporting, and measurable owner relief.

Initial price hypotheses:

| Offer | Price |
|---|---|
| Fanni Problem Scan | MXN 1,490 one time |
| Fanni Demand Operator | MXN 4,900/month + MXN 7,500 setup |
| Fanni Business Operator | MXN 12,500/month + MXN 18,000 setup |
| Enterprise Nerve Center | Custom |

These prices are testable commercial hypotheses. They are not guaranteed market-clearing prices.

## Billing architecture

Server files:

- `server/integrations/billing.js`
- `server/routes/billing.js`

Frontend files:

- `src/lib/billing.js`
- `src/pages/Checkout.jsx`

### Safety rules

- Product keys are allowlisted.
- Provider prices and products come only from server environment variables.
- Return URLs use an explicit origin allowlist.
- Stripe and Creem provide hosted checkout.
- Fanni never collects card numbers in chat or public forms.
- A checkout redirect never grants entitlement.
- Only a verified signed webhook may update `billing_entitlements`.
- Webhook comparisons are timing-safe.
- Stored event payloads are redacted.
- An unconfigured billing runtime returns a clear recovery action without claiming payment.

### Required environment variables

See `.env.example`.

Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_*`

Creem:

- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `CREEM_PRODUCT_*`
- `CREEM_TEST_MODE`

Shared:

- `FANNI_PUBLIC_SITE_ORIGIN`
- `FANNI_BILLING_ALLOWED_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Build-in-public workflow

1. Create or update an internal project record.
2. Classify it correctly.
3. Attach evidence references.
4. Separate measured, estimated, and unknown outcomes.
5. Remove private client or customer information.
6. Obtain client permission when required.
7. Move to review.
8. Have an authorized person approve it.
9. Set `last_verified_at`.
10. Publish.
11. Add future updates through `project_updates`.
12. Archive stale claims rather than silently rewriting history.

## Eight-loop gauntlet

Skill:

`customware/ext/skills/fanni-site-gauntlet/SKILL.md`

Command:

```bash
npm run gauntlet:site
```

The production `npm run check` executes:

1. security scan;
2. production configuration validation;
3. public site gauntlet;
4. automated tests;
5. Vite production build.

The gauntlet covers:

- content truth;
- Krug information architecture;
- editorial design system;
- motion and interaction;
- ADHD-friendly focus and accessibility;
- conversion and monetization;
- privacy and security;
- production proof.

## Known credential boundaries

The codebase supports hosted Stripe and Creem checkout, but live payment collection requires real provider accounts, product IDs, webhook secrets, and a deployed Node runtime.

The public site can display the governed Fanni Pulso labs, but live World Monitor data, a WhatsApp Business number, Zernio accounts, Composio credentials, and licensed social firehose data remain separate credentialed integrations.

No page should imply otherwise.
