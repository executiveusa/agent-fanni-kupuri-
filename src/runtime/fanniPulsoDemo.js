const REQUIRED_SIGNAL_FIELDS = [
  'id',
  'sourceClass',
  'sourceName',
  'topic',
  'claim',
  'observedAt',
  'sourceQuality'
];

function assertSignal(signal) {
  for (const field of REQUIRED_SIGNAL_FIELDS) {
    if (signal[field] === undefined || signal[field] === null || signal[field] === '') {
      throw new Error(`Signal ${signal.id || 'unknown'} is missing ${field}`);
    }
  }

  if (signal.sourceQuality < 0 || signal.sourceQuality > 1) {
    throw new Error(`Signal ${signal.id} sourceQuality must be between 0 and 1`);
  }
}

function unique(values) {
  return [...new Set(values)];
}

function groupByTopic(signals) {
  const topics = new Map();

  for (const signal of signals) {
    const bucket = topics.get(signal.topic) || [];
    bucket.push(signal);
    topics.set(signal.topic, bucket);
  }

  return [...topics.entries()]
    .map(([topic, topicSignals]) => {
      const sourceClasses = unique(topicSignals.map(signal => signal.sourceClass));
      const sourceNames = unique(topicSignals.map(signal => signal.sourceName));
      const averageQuality = topicSignals.reduce((sum, signal) => sum + signal.sourceQuality, 0) / topicSignals.length;
      const recentCount = topicSignals.filter(signal => signal.window === 'current').length;
      const baselineCount = Math.max(1, topicSignals.filter(signal => signal.window === 'baseline').length);
      const velocity = Number((recentCount / baselineCount).toFixed(2));

      return {
        topic,
        mentionCount: topicSignals.length,
        sourceClasses,
        sourceNames,
        averageQuality: Number(averageQuality.toFixed(2)),
        velocity,
        claims: unique(topicSignals.map(signal => signal.claim))
      };
    })
    .sort((a, b) => {
      if (b.velocity !== a.velocity) return b.velocity - a.velocity;
      return b.mentionCount - a.mentionCount;
    });
}

function classifyConfidence(leadingTopic, contradictions, unavailableSources) {
  if (!leadingTopic) return 'insufficient';

  let score = 0;
  if (leadingTopic.sourceClasses.length >= 2) score += 2;
  if (leadingTopic.averageQuality >= 0.75) score += 2;
  if (leadingTopic.velocity >= 2) score += 1;
  if (contradictions.length > 0) score -= 2;
  if (unavailableSources.length > 2) score -= 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function buildActionReceipt(fixture, leadingTopic, confidence) {
  const requiresApproval = fixture.requestedAction !== 'answer' && fixture.requestedAction !== 'watch';

  return {
    question: fixture.question,
    workspaceId: fixture.workspaceId,
    facts: leadingTopic ? leadingTopic.claims : [],
    inferences: leadingTopic
      ? [`${leadingTopic.topic} is the strongest current cluster for this synthetic demo.`]
      : [],
    unknowns: fixture.unknowns,
    contradictions: fixture.contradictions,
    coverage: {
      availableSourceClasses: unique(fixture.signals.map(signal => signal.sourceClass)),
      unavailableSources: fixture.unavailableSources,
      geographicScope: fixture.locationScope,
      languageScope: fixture.languageScope,
      lastRefreshedAt: fixture.now,
      synthetic: true
    },
    confidence,
    recommendation: fixture.recommendedAction,
    requestedAction: fixture.requestedAction,
    approval: {
      required: requiresApproval,
      status: requiresApproval ? 'awaiting_approval' : 'not_required'
    },
    externalWritePerformed: false,
    checkpointCreated: requiresApproval,
    value: {
      classification: 'estimated',
      metric: fixture.valueMetric
    },
    nextAction: requiresApproval ? 'Review the evidence and approve the prepared action.' : 'Keep watching for material change.'
  };
}

export function runFanniPulsoDemo(fixture) {
  if (!fixture?.id || !fixture?.workspaceId || !fixture?.question) {
    throw new Error('Demo fixture requires id, workspaceId, and question');
  }

  if (!Array.isArray(fixture.signals) || fixture.signals.length === 0) {
    throw new Error(`Demo ${fixture.id} requires synthetic signals`);
  }

  fixture.signals.forEach(assertSignal);

  const clusters = groupByTopic(fixture.signals);
  const leadingTopic = clusters[0] || null;
  const confidence = classifyConfidence(
    leadingTopic,
    fixture.contradictions || [],
    fixture.unavailableSources || []
  );

  return {
    demoId: fixture.id,
    title: fixture.title,
    synthetic: true,
    clusters,
    leadingTopic,
    actionReceipt: buildActionReceipt(
      {
        ...fixture,
        contradictions: fixture.contradictions || [],
        unknowns: fixture.unknowns || [],
        unavailableSources: fixture.unavailableSources || []
      },
      leadingTopic,
      confidence
    )
  };
}

const NOW = '2026-08-06T22:00:00.000Z';

export const FANNI_PULSO_DEMOS = [
  {
    id: 'tourism-pulse-puerto-vallarta',
    title: 'Puerto Vallarta Tourism Pulse',
    workspaceId: 'demo-pv-hotel',
    question: 'What are travelers worried about today, and what should we tell tomorrow’s guests?',
    locationScope: 'Puerto Vallarta and Bahía de Banderas',
    languageScope: ['es-MX', 'en'],
    now: NOW,
    requestedAction: 'draft',
    recommendedAction: 'Prepare a bilingual airport-transfer and arrival update for tomorrow’s guests.',
    valueMetric: 'Reduce repeated arrival questions and protect guest confidence.',
    unavailableSources: ['TikTok public search'],
    unknowns: ['Exact airport delay duration remains subject to airline updates.'],
    contradictions: [],
    signals: [
      { id: 'pv-1', sourceClass: 'public', sourceName: 'airport-status', topic: 'airport-transfer-delays', claim: 'Multiple inbound flights show delays.', observedAt: NOW, sourceQuality: 0.9, window: 'current' },
      { id: 'pv-2', sourceClass: 'authorized_private', sourceName: 'whatsapp-guest-inbox', topic: 'airport-transfer-delays', claim: 'Six guests asked whether transfers are still operating.', observedAt: NOW, sourceQuality: 0.95, window: 'current' },
      { id: 'pv-3', sourceClass: 'authorized_private', sourceName: 'social-comments', topic: 'airport-transfer-delays', claim: 'Travelers are asking about pickup timing.', observedAt: NOW, sourceQuality: 0.8, window: 'current' },
      { id: 'pv-4', sourceClass: 'public', sourceName: 'historical-baseline', topic: 'airport-transfer-delays', claim: 'Typical day has fewer transfer questions.', observedAt: NOW, sourceQuality: 0.75, window: 'baseline' }
    ]
  },
  {
    id: 'enterprise-reputation-mexico',
    title: 'Mexican Enterprise Reputation Nerve Center',
    workspaceId: 'demo-national-brand',
    question: 'What changed around our brand in the last two hours, which claims are spreading, and who should act?',
    locationScope: 'Mexico national with CDMX concentration',
    languageScope: ['es-MX'],
    now: NOW,
    requestedAction: 'draft',
    recommendedAction: 'Route a verified incident brief to Communications and Customer Operations; prepare but do not publish a holding statement.',
    valueMetric: 'Shorten incident detection and response coordination time.',
    unavailableSources: ['private groups', 'encrypted peer-to-peer messages'],
    unknowns: ['Original author identity is not verified.'],
    contradictions: ['One repost claims a nationwide outage while operational telemetry shows a regional issue.'],
    signals: [
      { id: 'mx-1', sourceClass: 'public', sourceName: 'news-monitor', topic: 'regional-service-incident', claim: 'A regional service interruption is being reported in CDMX.', observedAt: NOW, sourceQuality: 0.9, window: 'current' },
      { id: 'mx-2', sourceClass: 'authorized_private', sourceName: 'support-tickets', topic: 'regional-service-incident', claim: 'Support volume increased in two CDMX postal zones.', observedAt: NOW, sourceQuality: 0.95, window: 'current' },
      { id: 'mx-3', sourceClass: 'authorized_private', sourceName: 'operations-telemetry', topic: 'regional-service-incident', claim: 'Telemetry confirms a regional degradation, not a nationwide outage.', observedAt: NOW, sourceQuality: 1, window: 'current' },
      { id: 'mx-4', sourceClass: 'public', sourceName: 'historical-baseline', topic: 'regional-service-incident', claim: 'Normal incident mention volume is lower.', observedAt: NOW, sourceQuality: 0.8, window: 'baseline' }
    ]
  },
  {
    id: 'barrio-shield-water-outage',
    title: 'Barrio Shield / Escudo Comunitario',
    workspaceId: 'demo-community-coalition',
    question: 'There is no water in my colonia and people say the road is closed. Is it true, and what should families do?',
    locationScope: 'Configured neighborhood pilot area',
    languageScope: ['es-MX'],
    now: NOW,
    requestedAction: 'alert',
    recommendedAction: 'Prepare a limited, human-reviewed community notice with verified water-service information and mark the road closure as unverified.',
    valueMetric: 'Reduce confusion while preventing an unverified claim from becoming a mass alert.',
    unavailableSources: ['unregistered neighborhood groups'],
    unknowns: ['Road closure has not been confirmed by an official or second independent source.'],
    contradictions: [],
    signals: [
      { id: 'bs-1', sourceClass: 'community_opt_in', sourceName: 'whatsapp-report', topic: 'water-service-interruption', claim: 'Residents report loss of water service.', observedAt: NOW, sourceQuality: 0.65, window: 'current' },
      { id: 'bs-2', sourceClass: 'public', sourceName: 'utility-alert', topic: 'water-service-interruption', claim: 'The utility confirms maintenance affecting the configured area.', observedAt: NOW, sourceQuality: 1, window: 'current' },
      { id: 'bs-3', sourceClass: 'licensed', sourceName: 'partner-field-report', topic: 'water-service-interruption', claim: 'A verified partner confirms low water pressure in adjacent blocks.', observedAt: NOW, sourceQuality: 0.9, window: 'current' },
      { id: 'bs-4', sourceClass: 'public', sourceName: 'historical-baseline', topic: 'water-service-interruption', claim: 'Normal service-alert volume is lower.', observedAt: NOW, sourceQuality: 0.85, window: 'baseline' },
      { id: 'bs-5', sourceClass: 'community_opt_in', sourceName: 'whatsapp-report', topic: 'road-closure-rumor', claim: 'One resident says the main road is closed.', observedAt: NOW, sourceQuality: 0.45, window: 'current' }
    ]
  }
];

export function runAllFanniPulsoDemos() {
  return FANNI_PULSO_DEMOS.map(runFanniPulsoDemo);
}
