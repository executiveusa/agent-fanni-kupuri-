import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const files = {
  landing: 'src/pages/Landing.jsx',
  program: 'src/pages/ProgramPage.jsx',
  project: 'src/pages/ProjectPage.jsx',
  signal: 'src/pages/SignalPage.jsx',
  checkout: 'src/pages/Checkout.jsx',
  desk: 'src/components/FanniDesk.jsx',
  character: 'src/components/FanniCharacter.jsx',
  content: 'src/content/publicSite.js',
  css: 'src/public-site.css',
  accessibilityCss: 'src/public-accessibility.css',
  main: 'src/main.jsx',
  billingClient: 'src/lib/billing.js',
  billingServer: 'server/integrations/billing.js',
  billingRoutes: 'server/routes/billing.js',
  migration: 'supabase/migrations/20260807010000_fanni_public_site_and_billing.sql',
  skill: 'customware/ext/skills/fanni-site-gauntlet/SKILL.md'
};

const source = {};
for (const [key, relativePath] of Object.entries(files)) {
  source[key] = await fs.readFile(path.join(root, relativePath), 'utf8');
}

const results = [];
function check(loop, name, condition, detail) {
  results.push({ loop, name, pass: Boolean(condition), detail });
}
function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const publicJsx = [source.landing, source.program, source.project, source.signal, source.checkout, source.desk, source.character].join('\n');
const allPublicSource = `${publicJsx}\n${source.content}\n${source.css}\n${source.accessibilityCss}`;

// Loop 1 — Content truth
const governedProjectTypes = ['case-study', 'active-assignment', 'pilot', 'lab', 'internal', 'private'];
check(1, 'Project taxonomy is explicit', governedProjectTypes.every(type => source.migration.includes(`'${type}'`)));
check(1, 'Labs are disclosed as labs', /Public proof lab/.test(source.content) && /proof demo/.test(source.content));
check(1, 'Missing credentials and live sources are disclosed', /credentials remain the next implementation boundary/.test(source.content) && /not yet configured/.test(source.content));
check(1, 'Research coverage limits are visible', /qualitative market signal, not a market-size claim/i.test(source.signal) && /no claim of platform-wide prevalence/i.test(source.signal));
check(1, 'Case-study publication requires client permission', /published_case_study_requires_permission/.test(source.migration) && /client_permission_status = 'approved'/.test(source.migration));
check(1, 'No unsupported named financial client claim', !/Banorte/i.test(allPublicSource));

// Loop 2 — Krug information architecture
check(2, 'Hero states a business problem', /Your business is already telling you what to do next/.test(source.content));
check(2, 'Hero has one dominant primary action', count(source.landing, /public-button--primary/g) === 1, `found ${count(source.landing, /public-button--primary/g)}`);
check(2, 'Navigation labels are plain', ['Work', 'Programs', 'Live', 'Signal Lab', 'About', 'Ask Fanni'].every(label => source.content.includes(label)));
check(2, 'Programs are outcome-led', /Three problems worth solving/.test(source.content) && /Not a list of AI features/.test(source.content));
check(2, 'Project and offer paths exist', /\/programs\//.test(source.main) && /\/work\//.test(source.main) && /\/checkout\//.test(source.main));

// Loop 3 — Editorial system
check(3, 'Public design system is isolated', /import '\.\/public-site\.css'/.test(source.main) && /import '\.\/public-accessibility\.css'/.test(source.main));
check(3, 'Full-body avatar is implemented', /Full-body/.test(source.character) && /viewBox="0 0 520 720"/.test(source.character));
check(3, 'Eight capability arms are present', count(source.character, /fanni-character__arm--\d/g) === 8, `found ${count(source.character, /fanni-character__arm--\d/g)}`);
check(3, 'No emoji operational icons in public UI', !/\p{Extended_Pictographic}/u.test(publicJsx));
check(3, 'Project storytelling is larger than a card list', /public-project--lead/.test(source.landing) && /public-project-detail__story/.test(source.project));
check(3, 'Avatar remains available on mobile', !/@media[^}]+\.fanni-character[^}]+display\s*:\s*none/s.test(source.css));

// Loop 4 — Motion and interaction
check(4, 'No transition all', !/transition\s*:\s*all/i.test(source.css));
check(4, 'No infinite public animation', !/animation[^;]*infinite/i.test(source.css));
check(4, 'Hover movement is pointer-gated', /@media \(hover: hover\) and \(pointer: fine\)/.test(source.css));
check(4, 'Reduced motion is explicit', /@media \(prefers-reduced-motion: reduce\)/.test(source.css) && /scroll-behavior:\s*auto/.test(source.css));
check(4, 'Space Agent overlay is not hover-only', /onClick=\{\(\) => setOpen/.test(source.desk) && /aria-expanded=\{open\}/.test(source.desk));
check(4, 'Motion uses named timing tokens', /--public-fast/.test(source.css) && /--public-ease-out/.test(source.css));

// Loop 5 — Focus and accessibility
const uniqueIntentKeys = new Set([...source.desk.matchAll(/key: '(demand|reputation|operations)'/g)].map(match => match[1]));
check(5, 'First contact has three bounded choices', uniqueIntentKeys.size === 3, `found ${uniqueIntentKeys.size}`);
check(5, 'Selected problem is carried into Space Agent', /fanni_public_intent/.test(source.desk) && /\/app\/chat/.test(source.desk));
check(5, 'Semantic landmarks exist', /<header/.test(source.landing) && /<main/.test(source.landing) && /<footer/.test(source.landing) && /<nav/.test(source.landing));
check(5, 'Fanni Desk is keyboard discoverable', /onFocusCapture/.test(source.desk) && /onBlurCapture/.test(source.desk));
const smallPx = [...source.css.matchAll(/font-size:\s*(\d+)px/g)].map(match => Number(match[1])).filter(value => value < 12);
const accessibilityOverrides = ['.public-project__evidence span', '.public-signal__offer small', '.fanni-desk__trigger-label', 'font-size: 12px'].every(value => source.accessibilityCss.includes(value));
check(5, 'Public metadata is at least 12px after final cascade', smallPx.length === 0 || accessibilityOverrides, `base declarations below 12px: ${smallPx.join(', ') || 'none'}`);
check(5, 'Mobile breakpoints include phone and tablet behavior', /@media \(max-width: 780px\)/.test(source.css) && /@media \(max-width: 1120px\)/.test(source.css));

// Loop 6 — Conversion and monetization
check(6, 'Bounded entry offer exists', /Fanni Problem Scan/.test(source.content) && /MXN 1,490/.test(source.content));
check(6, 'Stripe and Creem are provider choices', /Stripe/.test(source.checkout) && /Creem/.test(source.checkout));
check(6, 'Checkout is hosted', /window\.location\.assign/.test(source.checkout) && /checkout_url/.test(source.billingServer) && /checkout\/sessions/.test(source.billingServer));
check(6, 'No card data collection in Fanni UI', !/<input[^>]+(card|cc-|credit|number)/i.test(source.checkout));
check(6, 'Products are allowlisted', /BILLING_PRODUCTS/.test(source.billingServer) && /Unsupported product/.test(source.billingServer));
check(6, 'Redirect does not grant entitlement', !/upsertEntitlement/.test(source.checkout) && /signed provider webhook/.test(source.checkout));
check(6, 'Webhooks drive entitlement changes', /processBillingWebhook/.test(source.billingServer) && /upsertEntitlement/.test(source.billingServer));

// Loop 7 — Privacy and security
check(7, 'Public reads require publication status', /publication_status = 'published'/.test(source.migration));
check(7, 'Billing tables are not readable anonymously', /revoke all on fanni\.billing_entitlements from anon, authenticated/.test(source.migration) && !/create policy public_read[^;]+billing_entitlements/s.test(source.migration));
check(7, 'Public evidence requires verification', /published_evidence_requires_verification/.test(source.migration));
check(7, 'Return URLs are allowlisted', /FANNI_BILLING_ALLOWED_ORIGINS/.test(source.billingServer) && /INVALID_RETURN_URL/.test(source.billingServer));
check(7, 'Webhook signatures use timing-safe comparison', /timingSafeEqual/.test(source.billingServer));
check(7, 'Payload redaction exists', /safeJson/.test(source.billingServer) && /\[redacted\]/.test(source.billingServer));
check(7, 'Raw webhook body is preserved by server route contract', /req\.rawBody/.test(source.billingRoutes));

// Loop 8 — Production proof wiring
check(8, 'Gauntlet skill exists', /eight-loop release system/i.test(source.skill));
check(8, 'Public routes are lazy loaded', /const ProgramPage = lazy/.test(source.main) && /const ProjectPage = lazy/.test(source.main) && /const Checkout = lazy/.test(source.main));
check(8, 'Billing has an explicit unconfigured recovery', /BILLING_NOT_CONFIGURED/.test(source.checkout) && /Continue with Fanni/.test(source.checkout));
check(8, 'Migration is represented in source control', /create table if not exists fanni\.public_projects/.test(source.migration));

const grouped = new Map();
for (const item of results) {
  if (!grouped.has(item.loop)) grouped.set(item.loop, []);
  grouped.get(item.loop).push(item);
}

console.log('\nFANNI PUBLIC SITE GAUNTLET');
console.log('==========================');
for (const [loop, items] of grouped) {
  const passed = items.filter(item => item.pass).length;
  console.log(`\nLoop ${loop}: ${passed}/${items.length}`);
  for (const item of items) {
    console.log(`${item.pass ? '  PASS' : '  FAIL'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
  }
}

const failures = results.filter(item => !item.pass);
console.log(`\nTotal: ${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Gauntlet failed with ${failures.length} blocking check(s).`);
  process.exit(1);
}
console.log('Gauntlet passed.');
