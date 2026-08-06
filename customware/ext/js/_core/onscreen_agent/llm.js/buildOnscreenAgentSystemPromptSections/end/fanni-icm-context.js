// Injects current Fanni workspace + ICM context into the system prompt
// Fires at the end of buildOnscreenAgentSystemPromptSections so it appears
// after the core system prompt and before the user message.

export default function fanniIcmContextSection(ctx) {
  const workspace = globalThis.__fanniWorkspace || {
    organizationId: null,
    workspaceId: null,
    slug: 'agent-fanni-demo',
    dataClass: 'synthetic',
    externalWritesEnabled: false,
    realClientDataEnabled: false
  };

  return {
    key: 'fanni-icm-context',
    placement: 'system',
    content: [
      '## Current Workspace (ICM)',
      `- Organization ID: ${workspace.organizationId || '(not bootstrapped)'}`,
      `- Workspace: ${workspace.slug}`,
      `- Data class: ${workspace.dataClass}`,
      `- External writes: ${workspace.externalWritesEnabled ? 'ENABLED' : 'disabled'}`,
      `- Real client data: ${workspace.realClientDataEnabled ? 'ENABLED' : 'disabled'}`,
      '',
      'All workflow runs and tool calls are scoped to this workspace only.'
    ].join('\n')
  };
}
