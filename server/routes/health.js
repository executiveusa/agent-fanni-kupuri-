export function healthRouter(router, { startedAt, version }) {
  router.get('/health', (_req, res) => {
    const providers = {
      openai: Boolean(process.env.OPENAI_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      cohere: Boolean(process.env.COHERE_API_KEY || process.env.COMMAND_R_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID),
      fal: Boolean(process.env.FAL_KEY),
      qvac: Boolean(process.env.QVAC_BASE_URL)
    };

    const safetyGates = {
      externalWritesEnabled: process.env.FANNI_ALLOW_EXTERNAL_WRITES === 'true',
      realClientDataEnabled: process.env.FANNI_ALLOW_REAL_CLIENT_DATA === 'true',
      networkMode: process.env.FANNI_NETWORK_MODE || 'deny_by_default'
    };

    const configuredProviderCount = Object.values(providers).filter(Boolean).length;
    const status = configuredProviderCount >= 1 ? 'ok' : 'degraded';

    res.json({
      status,
      version,
      agent: 'fanni',
      organization: 'Kupuri Media',
      startedAt,
      uptime: Math.round((Date.now() - new Date(startedAt).getTime()) / 1000),
      providers,
      safetyGates,
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY))
    });
  });

  return router;
}
