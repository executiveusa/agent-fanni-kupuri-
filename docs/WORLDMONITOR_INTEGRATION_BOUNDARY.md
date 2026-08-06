# World Monitor Integration Boundary

## Decision

Fanni may use World Monitor as:

1. an architectural reference;
2. a separately licensed provider;
3. an external API or service boundary under a written commercial agreement.

Fanni must not copy, embed, rebrand, distribute, or operate World Monitor code as part of a commercial Kupuri Media product without obtaining the required commercial license.

## Why this boundary exists

The World Monitor repository states that commercial use, SaaS use, and rebranding require a commercial license. Fanni is intended to be a paid multi-client product, so the noncommercial repository terms are not sufficient for direct product integration.

## Allowed before a license

- study public architecture and product behavior;
- define source-neutral interfaces;
- independently implement generic concepts such as signal envelopes, source lineage, clustering, trend scoring, coverage ledgers, and evidence-backed briefs;
- integrate directly with public or separately licensed data sources under their own terms;
- prototype with synthetic data;
- link users to the public World Monitor site.

## Prohibited before a license

- copying World Monitor source files into Fanni;
- shipping a modified or rebranded commercial fork;
- presenting World Monitor-derived commercial capability as Kupuri-owned code;
- bypassing paid features, access controls, or provider restrictions;
- using a personal/noncommercial self-hosted deployment to serve paying customers.

## Adapter contract

Fanni's intelligence layer must depend on this abstract provider contract rather than a World Monitor-specific implementation:

```ts
export interface IntelligenceProvider {
  providerId: string;
  capabilities(): Promise<CapabilityManifest>;
  searchSignals(query: SignalQuery): Promise<SignalPage>;
  getEntityBrief(query: EntityBriefQuery): Promise<EntityBrief>;
  getRegionalRisk(query: RegionalRiskQuery): Promise<RegionalRisk>;
  getCoverage(): Promise<CoverageManifest>;
  health(): Promise<ProviderHealth>;
}
```

Every provider response is normalized into Fanni's own signal envelope and retains:

- provider identity;
- source lineage;
- timestamps;
- licensing classification;
- confidence;
- geographic and language scope;
- retention restrictions.

## Implementation paths

### Path A — Licensed World Monitor adapter

Use when commercial terms allow the required endpoints, caching, attribution, storage, and customer use.

### Path B — Independent intelligence mesh

Create adapters for public and licensed sources without copying World Monitor code. This is the default engineering path until licensing is resolved.

### Path C — Customer intelligence sources

Enterprises can connect their own data providers, licensed feeds, internal warehouses, and monitoring platforms through the same contract.

## Required commercial-license questions

Before signing or implementing a licensed adapter, confirm:

- permitted commercial and SaaS use;
- number of tenants and end users;
- white-label and attribution requirements;
- API or self-hosting rights;
- caching and derived-data rights;
- model-training and embedding restrictions;
- geographic restrictions;
- support and service levels;
- security responsibilities;
- termination and data-export rights;
- pricing and usage limits.

## Release gate

No production claim may say that World Monitor is integrated until a live provider call is verified under an approved license or a clearly permitted public interface.
