const positiveTerms = ['mejora', 'segura', 'rápida', 'resolvió', 'reconocimiento', 'inclusión'];
const negativeTerms = ['interrupciones', 'fraude', 'problema', 'no pude', 'filtración', 'comisión', 'esperando'];
const highRiskTerms = ['fraude', 'filtración', 'acusación'];

const containsAny = (text, terms) => terms.some((term) => text.includes(term));
const normalizeText = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const classifyTopic = (text) => {
  if (text.includes('aplicación') || text.includes('digital') || text.includes('autenticación')) return 'Experiencia digital';
  if (text.includes('fraude') || text.includes('filtración') || text.includes('segura')) return 'Seguridad y fraude';
  if (text.includes('soporte') || text.includes('comisión')) return 'Experiencia del cliente';
  if (text.includes('expansión') || text.includes('estrategia') || text.includes('mercado')) return 'Estrategia corporativa';
  return 'Reputación general';
};

const classifyMention = (mention) => {
  const normalized = normalizeText(mention.text);
  const positive = containsAny(normalized, positiveTerms);
  const negative = containsAny(normalized, negativeTerms);
  const highRisk = containsAny(normalized, highRiskTerms);
  const sentiment = positive && !negative ? 'Positive' : negative && !positive ? 'Negative' : 'Neutral';
  const confidence = highRisk ? 64 : sentiment === 'Neutral' ? 82 : 91;
  return {
    ...mention,
    normalized,
    topic: classifyTopic(normalized),
    sentiment,
    risk: highRisk ? 'High' : negative ? 'Medium' : 'Low',
    confidence,
    requiresReview: highRisk || confidence < 70,
    evidence: [
      `Sentiment terms: ${positive ? 'positive' : ''}${positive && negative ? ', ' : ''}${negative ? 'negative' : 'none'}`,
      `Risk terms: ${highRisk ? 'high-risk language detected' : 'no high-risk term detected'}`
    ]
  };
};

export const workflowStages = [
  'ingest',
  'normalize',
  'deduplicate',
  'classify',
  'verify',
  'synthesize',
  'report',
  'measure'
];

export function runMediaIntelligenceWorkflow(records) {
  const startedAt = new Date().toISOString();
  const artifacts = [];

  artifacts.push({ stage: 'ingest', status: 'complete', count: records.length });

  const normalized = records.map((record) => ({ ...record, normalized: normalizeText(record.text) }));
  artifacts.push({ stage: 'normalize', status: 'complete', count: normalized.length });

  const seen = new Set();
  const unique = normalized.filter((record) => {
    const key = `${record.source}|${record.normalized}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  artifacts.push({ stage: 'deduplicate', status: 'complete', count: unique.length, removed: normalized.length - unique.length });

  const classified = unique.map(classifyMention);
  artifacts.push({ stage: 'classify', status: 'complete', count: classified.length });

  const reviewQueue = classified.filter((record) => record.requiresReview);
  artifacts.push({ stage: 'verify', status: 'complete', count: reviewQueue.length });

  const summary = classified.reduce((acc, record) => {
    acc.sentiment[record.sentiment] = (acc.sentiment[record.sentiment] || 0) + 1;
    acc.risk[record.risk] = (acc.risk[record.risk] || 0) + 1;
    acc.topics[record.topic] = (acc.topics[record.topic] || 0) + 1;
    return acc;
  }, { sentiment: {}, risk: {}, topics: {} });
  artifacts.push({ stage: 'synthesize', status: 'complete', summary });

  const topTopic = Object.entries(summary.topics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No topic';
  const report = {
    title: 'Synthetic Weekly Media Intelligence Report',
    executiveSummary: `Processed ${records.length} synthetic records, removed ${records.length - unique.length} duplicate, and identified ${reviewQueue.length} item(s) requiring review. The leading topic was ${topTopic}.`,
    totalInput: records.length,
    totalUnique: unique.length,
    duplicatesRemoved: records.length - unique.length,
    reviewRequired: reviewQueue.length,
    sentiment: summary.sentiment,
    risk: summary.risk,
    topics: summary.topics,
    recommendations: [
      'Review every high-risk allegation before external use.',
      'Investigate recurring mobile-access complaints.',
      'Reuse verified positive digital-experience evidence in approved communications.'
    ],
    disclaimer: 'Synthetic demonstration data. Not associated with Banorte, Onclusive, an employer, or a real client.'
  };
  artifacts.push({ stage: 'report', status: 'complete', report });

  const estimatedManualMinutes = records.length * 4;
  const measuredRuntimeSeconds = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
  const metrics = {
    estimatedManualMinutes,
    measuredRuntimeSeconds,
    estimatedMinutesSaved: Math.max(0, estimatedManualMinutes - Math.ceil(measuredRuntimeSeconds / 60)),
    automationRate: Math.round(((classified.length - reviewQueue.length) / classified.length) * 100)
  };
  artifacts.push({ stage: 'measure', status: 'complete', metrics });

  return {
    runId: `demo-${Date.now()}`,
    workflowKey: 'media-intelligence-weekly',
    workspaceId: 'agent-fanni-demo',
    status: 'complete',
    startedAt,
    completedAt: new Date().toISOString(),
    artifacts,
    records: classified,
    reviewQueue,
    report,
    metrics
  };
}

export function reportToMarkdown(run) {
  const { report, metrics } = run;
  return `# ${report.title}\n\n${report.disclaimer}\n\n## Executive summary\n${report.executiveSummary}\n\n## Metrics\n- Input records: ${report.totalInput}\n- Unique records: ${report.totalUnique}\n- Duplicates removed: ${report.duplicatesRemoved}\n- Items requiring review: ${report.reviewRequired}\n- Estimated manual minutes: ${metrics.estimatedManualMinutes}\n- Estimated minutes saved: ${metrics.estimatedMinutesSaved}\n- Automation rate: ${metrics.automationRate}%\n\n## Recommendations\n${report.recommendations.map((item) => `- ${item}`).join('\n')}\n`;
}
