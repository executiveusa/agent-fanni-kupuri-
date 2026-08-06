import { routeProvider } from '../../src/runtime/providerRouter.js';

const SYSTEM_PROMPT_ES = `Eres Fanni (de Kupuri Media), una agente de IA de inteligencia de medios soberana y automatización de operaciones. Tu estilo de comunicación es ejecutivo, preciso, profesional y cálido. Respondes en español mexicano fluido y natural por defecto. Tienes acceso a herramientas de análisis de medios, latido del sistema (heartbeat), puntos de control y gestión de evidencia. Mantén tus respuestas concisas, estructuradas y enfocadas en la ejecución de tareas.`;

const SYSTEM_PROMPT_EN = `You are Agent Fanni (by Kupuri Media), a sovereign media-intelligence and operations automation AI agent. Your communication style is executive, precise, professional, and warm. You communicate natively in English when requested, defaulting to Mexican Spanish. You have access to media analysis tools, system heartbeat, checkpoints, and evidence management. Keep your responses concise, structured, and focused on task execution.`;

export function chatRouter(router, { requireAuth, resolveWorkspace, llmAdapters, llmRoute }) {
  router.post('/chat', requireAuth, resolveWorkspace, async (req, res) => {
    try {
      const { message, messages: history, language = 'es', provider: preferredProvider } = req.body || {};
      const userText = message || (Array.isArray(history) && history[history.length - 1]?.content) || '';

      if (!userText && (!history || !history.length)) {
        return res.status(400).json({ error: 'message or messages array is required' });
      }

      const systemPrompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES;
      const formattedMessages = [
        { role: 'system', content: systemPrompt }
      ];

      if (Array.isArray(history) && history.length > 0) {
        for (const m of history) {
          if (m.role === 'user' || m.role === 'assistant') {
            formattedMessages.push({ role: m.role, content: String(m.content || '') });
          }
        }
      } else {
        formattedMessages.push({ role: 'user', content: userText });
      }

      const activeRoute = preferredProvider && llmAdapters[preferredProvider]
        ? { primary: { provider: preferredProvider }, fallbacks: llmRoute?.fallbacks || [] }
        : llmRoute;

      if (!activeRoute?.primary) {
        return res.status(503).json({ error: 'No LLM model providers configured on server' });
      }

      const result = await routeProvider({
        route: activeRoute,
        adapters: llmAdapters,
        input: { messages: formattedMessages, language }
      });

      res.json({
        reply: result.output.text,
        provider: result.provider,
        inputTokens: result.output.inputTokens,
        outputTokens: result.output.outputTokens,
        estimatedCostUsd: result.output.estimatedCostUsd,
        workspaceId: req.workspace?.id
      });

    } catch (error) {
      console.error('[chat]', error.message);
      res.status(502).json({
        error: 'Chat completion failed',
        detail: error.message.replace(/sk-[A-Za-z0-9_-]+|Key [A-Za-z0-9_-]+/g, '[REDACTED]')
      });
    }
  });

  return router;
}
