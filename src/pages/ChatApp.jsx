import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Download, Settings, LogOut, Bot, AlertTriangle, Loader
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { useAuth, signOut, bootstrapWorkspace } from '../hooks/useAuth.js';
import { Avatar } from '../components/Avatar.jsx';
import { VoiceInput } from '../components/VoiceInput.jsx';
import { OperatorDrawer } from '../components/OperatorDrawer.jsx';
import { syntheticMentions } from '../runtime/syntheticMentions.js';
import { reportToMarkdown } from '../runtime/workflowEngine.js';
import { runHeartbeat } from '../runtime/heartbeat.js';
import { runFanniDemo, timeTravelFanni } from '../runtime/fanniRuntime.js';
import { persistWorkflowRun, persistHeartbeat } from '../runtime/persistence.js';

const API_BASE = import.meta.env.VITE_FANNI_API_BASE_URL || '';
const ENV_LABEL = import.meta.env.VITE_FANNI_ENV || 'preview';

function makeId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const SUGGESTED_PROMPTS = {
  en: ['Run the weekly media intelligence workflow', 'Show me the heartbeat status', 'What did you find in the last run?'],
  es: ['Ejecuta el flujo de inteligencia de medios semanal', 'Muéstrame el estado del sistema', '¿Qué encontraste en la última ejecución?']
};

/**
 * @param {{ onNavigate: (route: string) => void }} props
 */
export function ChatApp({ onNavigate }) {
  const { lang, t, toggle: toggleLang } = useLanguage();
  const { user, loading: authLoading, configured: supabaseConfigured } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [avatarState, setAvatarState] = useState('idle');
  const [runContext, setRunContext] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Bootstrap workspace on login
  useEffect(() => {
    if (user && supabaseConfigured) {
      bootstrapWorkspace(user.id).catch(() => { /* workspace may already exist */ });
    }
  }, [user, supabaseConfigured]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user && supabaseConfigured) {
      onNavigate('/auth');
    }
  }, [user, authLoading, supabaseConfigured, onNavigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    setMessages([{
      id: makeId(),
      role: 'assistant',
      content: lang === 'en'
        ? `Hello${user ? ` — I see you're authenticated` : ''}. I'm Fanni. I'm here to help with media intelligence, workflow automation, and business operations. What would you like to work on today?`
        : `Hola${user ? ' — veo que estás autenticado' : ''}. Soy Fanni. Estoy aquí para ayudar con inteligencia de medios, automatización de flujos y operaciones de negocio. ¿En qué quieres trabajar hoy?`,
      timestamp: new Date().toISOString()
    }]);
  }, [lang, user]);

  const addMessage = useCallback((role, content, meta = {}) => {
    const msg = { id: makeId(), role, content, timestamp: new Date().toISOString(), ...meta };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const speak = useCallback(async (text) => {
    if (!voiceEnabled || !API_BASE) return;
    try {
      const token = user ? (await import('../hooks/useAuth.js')).supabase?.auth.getSession().then(d => d.data.session?.access_token) : null;
      const response = await fetch(`${API_BASE}/api/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fanni-Language': lang,
          ...(token ? { 'Authorization': `Bearer ${await token}` } : {})
        },
        body: JSON.stringify({ text, language: lang })
      });
      if (!response.ok) return;
      const audioBuffer = await response.arrayBuffer();
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(audioBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(audioCtx.destination);
      setAvatarState('speaking');
      source.start();
      source.onended = () => setAvatarState('idle');
    } catch { /* voice is optional */ }
  }, [voiceEnabled, lang, user]);

  const processInput = useCallback(async (text) => {
    if (!text.trim()) return;
    addMessage('user', text);
    setInput('');
    setAvatarState('thinking');

    const lower = text.toLowerCase();
    const isWorkflowRequest = lower.includes('media') || lower.includes('workflow') || lower.includes('intelligence') || lower.includes('inteligencia') || lower.includes('flujo');
    const isHeartbeat = lower.includes('heartbeat') || lower.includes('latido') || lower.includes('status') || lower.includes('estado');

    await new Promise(r => setTimeout(r, 400)); // brief thinking pause

    try {
      if (isWorkflowRequest) {
        setAvatarState('working');
        addMessage('assistant', lang === 'en'
          ? 'Running the media intelligence workflow… I\'ll create a checkpoint before starting and report back with evidence.'
          : 'Ejecutando el flujo de inteligencia de medios… Crearé un punto de control antes de comenzar y reportaré con evidencia.');

        const demoResult = runFanniDemo({ records: syntheticMentions });
        const { run, heartbeat, checkpointBefore, checkpointAfter, workItemId } = demoResult;

        setLastRun(run);
        setRunContext({
          workItemId,
          workflowKey: run.workflowKey,
          stage: 'measure',
          status: run.status,
          artifacts: run.artifacts,
          heartbeat,
          checkpoints: [checkpointBefore, checkpointAfter].filter(Boolean),
          risks: []
        });

        // Persist if authenticated
        if (supabaseConfigured && user) {
          try {
            await persistWorkflowRun(run);
            await persistHeartbeat(heartbeat);
          } catch { /* persistence is non-blocking */ }
        }

        const report = run.report;
        const response = lang === 'en'
          ? `Workflow complete. I processed ${report.totalInput} records, removed ${report.duplicatesRemoved} duplicates, and flagged ${report.reviewRequired} item(s) for review.\n\n**Leading topic:** ${Object.entries(report.topics).sort((a,b)=>b[1]-a[1])[0]?.[0]}\n**Estimated time saved:** ${run.metrics.estimatedMinutesSaved} min\n**Automation rate:** ${run.metrics.automationRate}%\n\nWork item, checkpoints, and evidence are now visible in the operator panel.`
          : `Flujo completo. Procesé ${report.totalInput} registros, eliminé ${report.duplicatesRemoved} duplicados y marqué ${report.reviewRequired} elemento(s) para revisión.\n\n**Tema principal:** ${Object.entries(report.topics).sort((a,b)=>b[1]-a[1])[0]?.[0]}\n**Tiempo estimado ahorrado:** ${run.metrics.estimatedMinutesSaved} min\n**Tasa de automatización:** ${run.metrics.automationRate}%\n\nEl elemento de trabajo, los puntos de control y la evidencia ya están visibles en el panel del operador.`;

        addMessage('assistant', response, { run, hasReport: true });
        setAvatarState('success');
        setTimeout(() => setAvatarState('idle'), 3000);
        await speak(lang === 'en' ? `Workflow complete. I saved you approximately ${run.metrics.estimatedMinutesSaved} minutes.` : `Flujo completo. Te ahorré aproximadamente ${run.metrics.estimatedMinutesSaved} minutos.`);

      } else if (isHeartbeat) {
        setAvatarState('working');
        const heartbeat = runHeartbeat({ workflowRun: lastRun });
        const response = lang === 'en'
          ? `**System status:** ${heartbeat.systemStatus}\n\n**Facts:**\n${heartbeat.facts.map(f => `- ${f}`).join('\n')}\n\n**Next action:** ${heartbeat.nextAction}`
          : `**Estado del sistema:** ${heartbeat.systemStatus}\n\n**Hechos:**\n${heartbeat.facts.map(f => `- ${f}`).join('\n')}\n\n**Próxima acción:** ${heartbeat.nextAction}`;
        addMessage('assistant', response);
        setAvatarState('idle');

      } else {
        // General conversation — synthetic response for now
        // In production this routes through the provider adapter API
        const responses = {
          en: [
            "I can help with that. Could you tell me more about what you need? I work best when I have clear context about the workflow, the data source, and the desired outcome.",
            "That's something I can work on. Let me understand the scope first. Is this a one-time task or something you want to run on a schedule?",
            "I'm noting that. Before I proceed, I want to be transparent: this action hasn't been routed through a live provider yet in this session. Configure the API base URL in your environment to enable full provider routing."
          ],
          es: [
            "Puedo ayudar con eso. ¿Podrías contarme más sobre lo que necesitas? Trabajo mejor cuando tengo contexto claro sobre el flujo, la fuente de datos y el resultado deseado.",
            "Es algo en lo que puedo trabajar. Déjame entender el alcance primero. ¿Es una tarea única o algo que quieres ejecutar de forma programada?",
            "Lo estoy anotando. Antes de proceder, quiero ser transparente: esta acción aún no ha sido enrutada a través de un proveedor en vivo en esta sesión. Configura la URL base de la API en tu entorno para habilitar el enrutamiento completo."
          ]
        };
        const list = responses[lang] || responses.en;
        const pick = list[Math.floor(Math.random() * list.length)];
        addMessage('assistant', pick);
        setAvatarState('idle');
        await speak(pick.replace(/\*\*/g, '').slice(0, 200));
      }

    } catch (error) {
      setAvatarState('error');
      addMessage('assistant', lang === 'en'
        ? `An error occurred: ${error.message}. The previous checkpoint remains available for restoration via the operator panel.`
        : `Ocurrió un error: ${error.message}. El punto de control anterior sigue disponible para restauración a través del panel del operador.`);
      setTimeout(() => setAvatarState('idle'), 5000);
    }
  }, [lang, lastRun, supabaseConfigured, user, addMessage, speak]);

  const handleRollback = useCallback((checkpointId) => {
    try {
      const currentState = { messages, lastRun };
      timeTravelFanni({ checkpointId, currentState });
      addMessage('system', lang === 'en'
        ? `Rollback complete. Restored to checkpoint ${checkpointId}. A safety snapshot was created before restoring. Original timeline preserved.`
        : `Reversión completa. Restaurado al punto de control ${checkpointId}. Se creó una instantánea de seguridad antes de restaurar. Línea de tiempo original preservada.`);
    } catch (error) {
      addMessage('system', `Rollback failed: ${error.message}`);
    }
    setDrawerOpen(false);
  }, [messages, lastRun, addMessage, lang]);

  const handleVoiceTranscript = useCallback((text, _detectedLang) => {
    processInput(text);
  }, [processInput]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    onNavigate('/');
  }, [onNavigate]);

  const isDemo = !supabaseConfigured || !user;

  return (
    <div className="chat-app">
      {/* Top bar */}
      <header className="chat-topbar" role="banner">
        <div className="chat-topbar__brand">
          <button className="chat-topbar__wordmark" onClick={() => onNavigate('/')} aria-label="Fanni home">
            FANNI
          </button>
          <span className="chat-topbar__org">Kupuri Media</span>
          {isDemo && <span className="env-badge env-badge--preview">preview</span>}
          {!isDemo && <span className="env-badge">{ENV_LABEL}</span>}
        </div>

        <div className="chat-topbar__actions">
          <button className="lang-toggle" onClick={toggleLang} aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}>
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <button
            className={`icon-btn ${voiceEnabled ? 'icon-btn--active' : ''}`}
            onClick={() => setVoiceEnabled(v => !v)}
            aria-label={voiceEnabled ? t.app.voiceOff : t.app.voiceOn}
            aria-pressed={voiceEnabled}
            title={voiceEnabled ? t.app.voiceOff : t.app.voiceOn}
          >
            🔊
          </button>
          {runContext && (
            <button className="icon-btn" onClick={() => setDrawerOpen(o => !o)} aria-label={t.app.operatorDrawer} aria-expanded={drawerOpen}>
              <Settings size={16} aria-hidden="true" />
            </button>
          )}
          {user && (
            <button className="icon-btn" onClick={handleSignOut} aria-label={t.nav.signOut} title={t.nav.signOut}>
              <LogOut size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div className="chat-body">
        {/* Avatar sidebar */}
        <aside className="chat-sidebar" aria-label="Fanni status">
          <Avatar state={avatarState} waveformActive={avatarState === 'listening'} />
          {lastRun && (
            <button
              className="btn-ghost btn-sm"
              onClick={() => downloadText('fanni-report.md', reportToMarkdown(lastRun))}
              aria-label={t.app.downloadReport}
            >
              <Download size={14} aria-hidden="true" /> {t.app.downloadReport}
            </button>
          )}
        </aside>

        {/* Main chat */}
        <main className="chat-main" role="main" aria-label="Conversation">
          <div className="chat-messages" aria-live="polite" aria-atomic="false">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
                {msg.role === 'assistant' && (
                  <span className="chat-msg__avatar" aria-hidden="true"><Bot size={14} /></span>
                )}
                <div className="chat-msg__bubble">
                  <div className="chat-msg__content" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  {msg.hasReport && lastRun && (
                    <button
                      className="chat-msg__action"
                      onClick={() => downloadText('fanni-report.md', reportToMarkdown(lastRun))}
                    >
                      <Download size={12} aria-hidden="true" /> {t.app.downloadReport}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {avatarState === 'thinking' || avatarState === 'working' ? (
              <div className="chat-msg chat-msg--assistant" aria-label={avatarState === 'thinking' ? t.app.thinking : 'Working'}>
                <span className="chat-msg__avatar" aria-hidden="true"><Bot size={14} /></span>
                <div className="chat-msg__bubble chat-msg__bubble--typing">
                  <Loader size={14} className="spin" aria-hidden="true" />
                  <span>{avatarState === 'thinking' ? t.app.thinking : '…'}</span>
                </div>
              </div>
            ) : null}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested prompts when empty */}
          {messages.length <= 1 && (
            <div className="chat-suggestions" role="list" aria-label="Suggested prompts">
              {(SUGGESTED_PROMPTS[lang] || SUGGESTED_PROMPTS.en).map(prompt => (
                <button
                  key={prompt}
                  className="chat-suggestion"
                  role="listitem"
                  onClick={() => processInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="chat-input-area">
            <form
              className="chat-input-form"
              onSubmit={e => { e.preventDefault(); processInput(input); }}
            >
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onStateChange={setAvatarState}
                disabled={avatarState === 'thinking' || avatarState === 'working'}
              />
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t.app.placeholder}
                aria-label={t.app.placeholder}
                disabled={avatarState === 'thinking' || avatarState === 'working'}
                maxLength={4000}
              />
              <button
                type="submit"
                className="chat-send"
                disabled={!input.trim() || avatarState === 'thinking' || avatarState === 'working'}
                aria-label={t.app.send}
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
            {isDemo && (
              <p className="chat-demo-notice" role="status">
                <AlertTriangle size={12} aria-hidden="true" />
                {lang === 'en' ? 'Preview mode — configure Supabase and API keys for production features.' : 'Modo de vista previa — configura Supabase y las claves de API para funciones de producción.'}
              </p>
            )}
          </div>
        </main>

        {/* Operator drawer */}
        <OperatorDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          runContext={runContext}
          onRollback={handleRollback}
        />
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- (.+)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}
