import { routeProvider } from '../../src/runtime/providerRouter.js';
import { composioRouter } from './composio.js';

const SYSTEM_PROMPT_ES = `Eres Fanni (de Kupuri Media), una supersecretaria soberana que organiza contexto, conecta aplicaciones con permiso y convierte pedidos en trabajo verificable. Tu estilo es ejecutivo, preciso, profesional, cálido y fácil de entender para personas no técnicas. Respondes en español mexicano fluido y natural por defecto. Siempre dices qué vas a hacer, para qué cliente, con qué cuenta y si necesitas aprobación. Nunca ocultas una acción externa detrás de lenguaje técnico.`;

const SYSTEM_PROMPT_EN = `You are Agent Fanni by Kupuri Media, a sovereign super-secretary who organizes context, connects approved apps, and turns requests into verifiable work. Your style is executive, precise, professional, warm, and easy for nontechnical people to understand. Always state what you will do, which client and account are in scope, and whether approval is required. Never hide an external action behind technical language.`;

export function chatRouter(router, { requireAuth, resolveWorkspace, llmAdapters, llmRoute }) {
  composioRouter(router, { requireAuth, resolveWorkspace });

  router.post('/chat', requireAuth, resolveWorkspace, async (req, res) => {
    try {
      const { message, messages: history, language = 'es', provider: preferredProvider } = req.body || {};
      const userText = message || (Array.isArray(history) && history[history.length - 1]?.content) || '';

      if (!userText && (!history || !history.length)) {
        return res.status(400).json({ error: 'message or messages array is required' });
      }

      const systemPrompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES;
      const formattedMessages = [{ role: 'system', content: systemPrompt }];

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

  router.post('/v1/chat/completions', requireAuth, resolveWorkspace, async (req, res) => {
    try {
      const { messages, model, temperature } = req.body || {};
      if (!messages || !messages.length) {
        return res.status(400).json({ error: { message: 'messages array is required', type: 'invalid_request_error' } });
      }

      const activeRoute = llmRoute;
      if (!activeRoute?.primary) {
        return res.status(503).json({ error: { message: 'No LLM providers available', type: 'api_error' } });
      }

      const result = await routeProvider({
        route: activeRoute,
        adapters: llmAdapters,
        input: { messages, temperature }
      });

      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model || result.provider,
        choices: [{ index: 0, message: { role: 'assistant', content: result.output.text }, finish_reason: 'stop' }],
        usage: {
          prompt_tokens: result.output.inputTokens || 0,
          completion_tokens: result.output.outputTokens || 0,
          total_tokens: (result.output.inputTokens || 0) + (result.output.outputTokens || 0)
        }
      });
    } catch (error) {
      console.error('[chat/completions]', error.message);
      res.status(502).json({ error: { message: error.message, type: 'api_error' } });
    }
  });

  return router;
}
