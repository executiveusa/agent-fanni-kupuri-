const instructionPatterns = [
  /ignore (all|any|the) previous instructions/i,
  /system prompt/i,
  /developer message/i,
  /tool call/i,
  /reveal (the )?(secret|credential|key)/i
];

export function sanitizeMemoryRecord(record, workspaceId) {
  if (!record || record.workspaceId !== workspaceId) {
    throw new Error('cross-workspace memory access denied');
  }

  const text = String(record.text || record.body || '');
  const injectionSignals = instructionPatterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);

  return {
    ...record,
    text: text.replace(/(sk-[A-Za-z0-9_-]{20,}|sb_[A-Za-z0-9_-]{20,})/g, '[REDACTED_SECRET]'),
    untrusted: true,
    injectionSignals,
    safeForPrompt: injectionSignals.length === 0,
    sourceHash: record.sourceHash || null
  };
}

export function selectMemory(records, { workspaceId, maxResults = 12, minimumSimilarity = 0.72 }) {
  return records
    .filter((record) => record.workspaceId === workspaceId)
    .filter((record) => record.similarity == null || record.similarity >= minimumSimilarity)
    .slice(0, maxResults)
    .map((record) => sanitizeMemoryRecord(record, workspaceId));
}
