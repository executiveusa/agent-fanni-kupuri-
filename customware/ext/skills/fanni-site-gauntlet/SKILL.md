# Fanni Public Site Gauntlet

## Purpose

Use this skill to prevent Agent Fanni's public website from becoming generic SaaS decoration, misleading case-study theater, inaccessible motion, or an unverified conversion funnel.

The gauntlet is an eight-loop release system. Each loop produces inspectable proof. A later loop may send the build back to an earlier loop. No loop may be waived because the page looks attractive.

## Required design references

- COLLINS: editorial scale, decisive hierarchy, transformation-led case studies, programs tied to business outcomes, cultural/editorial publishing, and direct commercial closure. Never copy COLLINS assets, source code, proprietary layouts, or brand language.
- Emil Kowalski: purposeful motion, immediate interaction feedback, custom easing, pointer-aware hover, reduced-motion behavior, and transform/opacity-first performance.
- ADHD-friendly workflow: one next action, bounded choices, persistent state, visible progress, and tangents suppressed until requested.
- Steve Krug: every page should be self-evident, scannable, convention-aware, and usable without explanation.

## Loop 1 — Content truth

Check:

1. Every public project is labeled as one of: case study, active assignment, pilot, lab, internal, or private.
2. A case study has client permission, evidence references, and measured/estimated/unknown outcome labels.
3. A lab or synthetic demo is never described as a live client result.
4. Missing credentials, source coverage, providers, and customer data are disclosed.
5. Reddit or public-community findings are described as qualitative signals unless prevalence is measured.
6. No named company is presented as a client without explicit publication permission.

Fail conditions:

- fabricated logo wall;
- unsupported customer count;
- unsupported performance number;
- vague 'trusted by' language;
- synthetic proof presented as production usage.

## Loop 2 — Krug information architecture

Five-second questions:

1. What is Fanni?
2. What problem does she solve?
3. Is this relevant to me?
4. What real work exists?
5. What is the next action?

Check:

- plain navigation labels;
- one dominant hero action;
- no technical language before the business benefit;
- every section answers one question;
- links and buttons look actionable;
- no hidden instructions required.

## Loop 3 — Editorial brand system

Check:

- large, decisive typography;
- strong composition and section rhythm;
- project storytelling larger than feature cards;
- fewer bordered containers and pills;
- one accent idea per section;
- full-body stylized Fanni remains visible on desktop and mobile;
- the authenticated Space Agent workspace remains calm and operational rather than mimicking the marketing page.

Fail conditions:

- generic dashboard card wall;
- emoji as operational icons;
- fake-human avatar;
- decorative glassmorphism;
- COLLINS asset or wording duplication.

## Loop 4 — Motion and interaction

Check:

- no `transition: all`;
- no unnecessary infinite animations;
- hover movement only inside `(hover: hover) and (pointer: fine)`;
- essential interactions work by click, keyboard, and touch;
- entrances use strong ease-out behavior;
- exits are no slower than entrances;
- repeated actions have restrained motion;
- reduced-motion preserves useful opacity/color feedback while removing spatial movement;
- animated properties prioritize transform and opacity.

## Loop 5 — Focus and accessibility

Check:

- three or fewer first-contact choices;
- one selected problem is carried into Space Agent;
- no essential hover-only content;
- keyboard focus reaches navigation, Fanni Desk, project links, and checkout;
- semantic headings progress logically;
- landmarks and button labels are explicit;
- body text is at least 16px where practical;
- metadata is at least 12px;
- color is not the only status signal;
- mobile layouts work at 360px, 390px, 768px, and 1024px;
- Spanish expansion does not hide actions.

## Loop 6 — Conversion and monetization

Check:

- each paid offer names a painful problem, outcome, scope, price hypothesis, and boundary;
- the entry offer is bounded and lower risk;
- Stripe and Creem use hosted checkout;
- Fanni never collects card data in chat or local inputs;
- success redirects do not grant access;
- only verified signed webhooks change entitlement state;
- checkout creation is idempotent and product-allowlisted;
- provider secrets remain server-only;
- a failed or unconfigured checkout gives a clear recovery action without claiming payment.

## Loop 7 — Security, privacy, and publication governance

Check:

- anonymous public reads are restricted to published and permitted records;
- billing, lead, and private workflow data have no anonymous read policy;
- public case studies require client permission;
- public evidence requires verification;
- return URLs use an allowlist;
- webhook comparison is timing-safe;
- payloads are redacted before persistence;
- one client cannot influence or inspect another workspace;
- external action approval and return points remain visible.

## Loop 8 — Production proof

Required gates:

1. security scan;
2. production configuration validation;
3. site gauntlet script;
4. unit and integration tests;
5. production build;
6. preview deployment ready;
7. runtime error check;
8. production deployment after merge;
9. canonical URL verification;
10. report exact known gaps.

## Required release record

```yaml
release:
  branch: string
  commit: string
  deployment: string
  loops:
    content_truth: pass | fail
    information_architecture: pass | fail
    editorial_system: pass | fail
    motion: pass | fail
    accessibility_focus: pass | fail
    conversion: pass | fail
    privacy_security: pass | fail
    production_proof: pass | fail
  proof: []
  remaining_gaps: []
  rollback: string
```

## Commandment

Beautiful is not enough.
Clear is not enough.
Working is not enough.

The public site must be beautiful, self-evident, truthful, accessible, monetizable, secure, measurable, and reversible at the same time.
