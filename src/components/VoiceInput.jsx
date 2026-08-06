import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';

const MAX_DURATION_MS = 120_000; // 2 minutes
const API_BASE = import.meta.env.VITE_FANNI_API_BASE_URL || '';

/**
 * @param {{ onTranscript: (text: string, lang: string) => void, onStateChange: (state: string) => void, disabled?: boolean }} props
 */
export function VoiceInput({ onTranscript, onStateChange, disabled = false }) {
  const { lang, t } = useLanguage();
  const [phase, setPhase] = useState('idle'); // idle | requesting | recording | transcribing | error
  const [errorMsg, setErrorMsg] = useState('');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const changePhase = useCallback((p) => {
    setPhase(p);
    if (p === 'recording') onStateChange('listening');
    else if (p === 'transcribing') onStateChange('transcribing');
    else onStateChange('idle');
  }, [onStateChange]);

  const start = useCallback(async () => {
    setErrorMsg('');
    changePhase('requesting');

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone use in your browser settings.');
      changePhase('error');
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : 'audio/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      clearTimeout(timerRef.current);

      if (chunksRef.current.length === 0) {
        changePhase('idle');
        return;
      }

      const blob = new Blob(chunksRef.current, { type: mimeType.split(';')[0] });

      if (blob.size > 10 * 1024 * 1024) {
        setErrorMsg('Recording is too large (max 10 MB).');
        changePhase('error');
        return;
      }

      changePhase('transcribing');

      try {
        const response = await fetch(`${API_BASE}/api/voice/transcribe`, {
          method: 'POST',
          headers: {
            'Content-Type': mimeType.split(';')[0],
            'X-Fanni-Language': lang,
            'Authorization': `Bearer ${await getSessionToken()}`
          },
          body: blob
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Transcription failed' }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        onTranscript(data.transcript, data.language || lang);
        changePhase('idle');

      } catch (err) {
        setErrorMsg(`Transcription failed: ${err.message}`);
        changePhase('error');
      }
    };

    mediaRef.current = recorder;
    recorder.start(250);
    changePhase('recording');

    timerRef.current = setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, MAX_DURATION_MS);
  }, [lang, changePhase, onTranscript]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop();
    }
  }, []);

  const isRecording = phase === 'recording';
  const isProcessing = phase === 'transcribing' || phase === 'requesting';

  return (
    <div className="voice-input" aria-label="Voice input controls">
      <button
        type="button"
        className={`voice-btn ${isRecording ? 'voice-btn--recording' : ''}`}
        onClick={isRecording ? stop : start}
        disabled={disabled || isProcessing}
        aria-label={isRecording ? t.app.stopRecording : t.app.startRecording}
        aria-pressed={isRecording}
      >
        {isRecording
          ? <Square size={18} aria-hidden="true" />
          : phase === 'error' ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
      </button>

      {isRecording && (
        <span className="voice-label voice-label--active" aria-live="assertive">{t.app.recording}</span>
      )}
      {phase === 'transcribing' && (
        <span className="voice-label" aria-live="polite">{t.app.transcribing}</span>
      )}
      {phase === 'error' && errorMsg && (
        <span className="voice-label voice-label--error" role="alert">{errorMsg}</span>
      )}
    </div>
  );
}

async function getSessionToken() {
  const { supabase } = await import('../hooks/useAuth.js');
  if (!supabase) return '';
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}
