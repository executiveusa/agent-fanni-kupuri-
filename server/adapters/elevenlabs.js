const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

export function createElevenLabsTTSAdapter({
  apiKey,
  voiceId,
  model = 'eleven_turbo_v2_5',
  stability = 0.5,
  similarityBoost = 0.75,
  style = 0.15,
  speed = 0.96
}) {
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required for ElevenLabs TTS');
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID is required; voice selection is pending brand approval');

  return async function elevenLabsTTSAdapter({ input }) {
    const text = String(input.text || '');
    if (!text) throw new Error('tts: text is required');

    const response = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability, similarity_boost: similarityBoost, style, use_speaker_boost: true },
        output_format: 'mp3_44100_128',
        speed
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const code = response.status;
      throw new Error(`elevenlabs tts ${code}: ${code === 401 ? 'invalid key' : code === 422 ? 'invalid voice id' : 'request_failed'}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return {
      audioBuffer,
      mimeType: 'audio/mpeg',
      provider: 'elevenlabs',
      voiceId,
      characterCount: text.length,
      estimatedCostUsd: text.length * 0.00003
    };
  };
}

export function createElevenLabsSTTAdapter({ apiKey }) {
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is required for ElevenLabs STT');

  return async function elevenLabsSTTAdapter({ input }) {
    const { audioBlob, language = 'es' } = input;
    if (!audioBlob) throw new Error('stt: audioBlob is required');

    const form = new FormData();
    form.append('file', audioBlob, 'audio.webm');
    form.append('model_id', 'scribe_v1');
    form.append('language_code', language);

    const response = await fetch(`${ELEVENLABS_BASE}/speech-to-text`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: form,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) throw new Error(`elevenlabs stt ${response.status}`);

    const data = await response.json();
    return {
      transcript: data.text || '',
      language: data.language_code || language,
      confidence: data.words?.length ? 0.9 : 0.7
    };
  };
}
