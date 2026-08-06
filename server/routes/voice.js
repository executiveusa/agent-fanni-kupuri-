import { routeProvider } from '../../src/runtime/providerRouter.js';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_MIME = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg']);

export function voiceRouter(router, { requireAuth, resolveWorkspace, sttAdapters, ttsAdapters, sttRoute, ttsRoute }) {
  router.post('/voice/transcribe', requireAuth, resolveWorkspace, async (req, res) => {
    try {
      const contentType = req.headers['content-type'] || '';
      const mimeType = contentType.split(';')[0].trim();

      if (!SUPPORTED_MIME.has(mimeType)) {
        return res.status(415).json({ error: `Unsupported audio format: ${mimeType}. Accepted: ${[...SUPPORTED_MIME].join(', ')}` });
      }

      const chunks = [];
      let totalBytes = 0;

      for await (const chunk of req) {
        totalBytes += chunk.length;
        if (totalBytes > MAX_AUDIO_BYTES) {
          return res.status(413).json({ error: 'Audio exceeds 10 MB limit' });
        }
        chunks.push(chunk);
      }

      if (totalBytes === 0) return res.status(400).json({ error: 'Empty audio body' });

      const audioBuffer = Buffer.concat(chunks);
      const audioBlob = new Blob([audioBuffer], { type: mimeType });
      const language = req.headers['x-fanni-language'] || 'es';

      const result = await routeProvider({
        route: sttRoute,
        adapters: sttAdapters,
        input: { audioBlob, language, mimeType }
      });

      res.json({
        transcript: result.output.transcript,
        language: result.output.language || language,
        confidence: result.output.confidence,
        provider: result.provider
      });

    } catch (error) {
      console.error('[voice/transcribe]', error.message);
      res.status(502).json({ error: 'Transcription failed', detail: error.message.replace(/sk-[A-Za-z0-9_-]+|Key [A-Za-z0-9_-]+/g, '[REDACTED]') });
    }
  });

  router.post('/voice/synthesize', requireAuth, resolveWorkspace, async (req, res) => {
    try {
      const { text, language = 'es' } = req.body || {};
      if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
      if (text.length > 5000) return res.status(400).json({ error: 'text exceeds 5000 character limit' });

      const result = await routeProvider({
        route: ttsRoute,
        adapters: ttsAdapters,
        input: { text, language }
      });

      const { audioBuffer, mimeType } = result.output;
      res.setHeader('Content-Type', mimeType || 'audio/mpeg');
      res.setHeader('X-Fanni-Provider', result.provider);
      res.send(Buffer.from(audioBuffer));

    } catch (error) {
      console.error('[voice/synthesize]', error.message);
      res.status(502).json({ error: 'Speech synthesis failed', detail: error.message.replace(/sk-[A-Za-z0-9_-]+|Key [A-Za-z0-9_-]+/g, '[REDACTED]') });
    }
  });

  return router;
}
