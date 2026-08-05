export class CogValidationError extends Error {}

export function validateCog(cog) {
  const errors = [];
  const root = cog?.cog;
  const agents = cog?.agents || [];
  const transitions = cog?.flow?.transitions || {};
  const ids = new Set(agents.map((agent) => agent.id));

  if (!root?.name) errors.push('cog.name is required');
  if (!agents.length) errors.push('at least one agent is required');
  if (!cog?.flow?.start) errors.push('flow.start is required');
  if (cog?.flow?.start && !ids.has(cog.flow.start)) errors.push('flow.start must reference an agent');

  for (const [from, transition] of Object.entries(transitions)) {
    if (!ids.has(from)) errors.push(`transition source ${from} is not an agent`);
    if (typeof transition === 'string' && !ids.has(transition)) errors.push(`transition target ${transition} is not an agent`);
    if (transition && typeof transition === 'object') {
      const targets = [...Object.values(transition.choices || {}), transition.fallback].filter(Boolean);
      for (const target of targets) {
        if (target !== 'rollback' && !ids.has(target)) errors.push(`transition target ${target} is not an agent`);
      }
    }
  }

  const maxTotalVisits = cog?.resilience?.max_total_visits;
  if (maxTotalVisits != null && (!Number.isInteger(maxTotalVisits) || maxTotalVisits < 1)) {
    errors.push('resilience.max_total_visits must be a positive integer');
  }

  return { valid: errors.length === 0, errors };
}

export async function runCog(cog, handlers, initialContext = {}) {
  const validation = validateCog(cog);
  if (!validation.valid) throw new CogValidationError(validation.errors.join('; '));

  const state = {};
  const trail = [];
  const visits = new Map();
  const maxTotalVisits = cog.resilience?.max_total_visits ?? 50;
  let current = cog.flow.start;
  let totalVisits = 0;

  while (current) {
    totalVisits += 1;
    if (totalVisits > maxTotalVisits) throw new Error('cog max_total_visits exceeded');

    const agent = cog.agents.find((item) => item.id === current);
    const handler = handlers[current] || handlers[agent.type];
    if (!handler) throw new Error(`no handler registered for ${current}`);

    const visitCount = (visits.get(current) || 0) + 1;
    visits.set(current, visitCount);
    const startedAt = new Date().toISOString();
    const output = await handler({ context: initialContext, state, agent, visitCount });
    state[current] = output;
    trail.push({ agentId: current, visitCount, startedAt, completedAt: new Date().toISOString(), output });

    const transition = cog.flow.transitions[current];
    if (!transition) break;
    if (typeof transition === 'string') {
      current = transition;
      continue;
    }
    if (transition.end === true) break;

    const maxVisits = transition.max_visits;
    if (maxVisits && visitCount >= maxVisits) {
      current = transition.fallback;
      continue;
    }

    const decisionKey = transition.decision_key;
    const decision = decisionKey ? output?.[decisionKey] : undefined;
    current = transition.choices?.[String(decision).toLowerCase()] || transition.fallback;
    if (!current) throw new Error(`no transition matched for ${current}`);
    if (current === 'rollback') break;
  }

  return { state, trail, finalAgent: trail.at(-1)?.agentId || null, finalOutput: trail.at(-1)?.output ?? null };
}
