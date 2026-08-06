const FAL_BASE = 'https://fal.run';

export function createFalSTTAdapter({ apiKey }) {
  if (!apiKey) throw new Error('FAL_KEY is required for Fal STT');

  return async function falSTTAdapter({ input }) {
    const { audioBlob, language = 'es' } = input;
    if (!audioBlob) throw new Error('stt: audioBlob is required');

    const form = new FormData();
    form.append('audio_url', audioBlob, 'audio.webm');

    const response = await fetch(`${FAL_BASE}/fal-ai/wizper`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) throw new Error(`fal stt ${response.status}`);

    const data = await response.json();
    return {
      transcript: data.text || '',
      language: data.detected_language || language,
      confidence: 0.9
    };
  };
}

export function createFalTTSAdapter({ apiKey, endpoint = 'fal-ai/elevenlabs/tts/turbo-v2.5' }) {
  if (!apiKey) throw new Error('FAL_KEY is required for Fal TTS');

  return async function falTTSAdapter({ input, provider }) {
    const text = String(input.text || '');
    if (!text) throw new Error('tts: text is required');

    const response = await fetch(`${FAL_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, language: input.language || 'es' }),
      signal: AbortSignal.timeout(provider?.timeout_ms ?? 30000)
    });

    if (!response.ok) throw new Error(`fal tts ${response.status}`);

    const data = await response.json();
    const audioUrl = data.audio?.url;
    if (!audioUrl) throw new Error('fal tts: no audio URL in response');

    const audioResponse = await fetch(audioUrl, { signal: AbortSignal.timeout(15000) });
    const audioBuffer = await audioResponse.arrayBuffer();

    return {
      audioBuffer,
      mimeType: 'audio/mpeg',
      provider: 'fal',
      endpoint,
      estimatedCostUsd: text.length * 0.00002
    };
  };
}
