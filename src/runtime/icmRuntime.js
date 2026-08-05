const IDENTITY_FILES = ['AGENTS.md', 'HEART.md', 'PERSONA.md', 'HEARTBEAT.md'];

export function createContextManifest({
  workspaceId = 'agent-fanni-demo',
  workflowKey,
  stageKey,
  references = [],
  artifacts = [],
  authorizedTools = [],
  excludedContext = []
}) {
  if (!workflowKey || !stageKey) throw new Error('workflowKey and stageKey are required');
  return {
    manifestVersion: '1.0',
    workspaceId,
    identityFiles: IDENTITY_FILES,
    workflowContext: `workflows/${workflowKey}/CONTEXT.md`,
    stageContext: `workflows/${workflowKey}/stages/${stageKey}/CONTEXT.md`,
    references: [...new Set(references)],
    artifacts: [...new Set(artifacts)],
    authorizedTools: [...new Set(authorizedTools)],
    excludedContext: [...new Set(excludedContext)],
    loadedAt: new Date().toISOString()
  };
}

export function validateContextManifest(manifest) {
  const errors = [];
  if (!manifest?.workspaceId) errors.push('workspaceId missing');
  if (!manifest?.workflowContext) errors.push('workflow context missing');
  if (!manifest?.stageContext) errors.push('stage context missing');
  if (!Array.isArray(manifest?.identityFiles) || manifest.identityFiles.length !== 4) errors.push('identity bundle incomplete');
  if ((manifest?.excludedContext || []).some((item) => (manifest?.references || []).includes(item))) errors.push('excluded context was included');
  return { valid: errors.length === 0, errors };
}

export function createSpecialistContract({ agentName, mission, workspaceId, authorizedTools = [], inputs = [], constraints = [], outputContract = [], verification = [], stopConditions = [] }) {
  if (!agentName || !mission || !workspaceId) throw new Error('agentName, mission and workspaceId are required');
  return { agentName, mission, workspaceId, authorizedTools, inputs, constraints, outputContract, verification, stopConditions };
}
