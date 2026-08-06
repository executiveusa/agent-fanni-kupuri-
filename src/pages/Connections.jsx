import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Link2, LockKeyhole, Mail, CalendarDays, FolderOpen, MessageSquare, Database, BriefcaseBusiness } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { supabase } from '../hooks/useAuth.js';

const API_BASE = import.meta.env.VITE_FANNI_API_BASE_URL || '';

const ARMS = [
  { slug: 'gmail', icon: Mail, en: 'Work email', es: 'Correo de trabajo', helpEn: 'Read, organize, draft, and—with approval—send email.', helpEs: 'Leer, organizar, redactar y—con aprobación—enviar correos.' },
  { slug: 'googlecalendar', icon: CalendarDays, en: 'Calendar', es: 'Calendario', helpEn: 'Find availability and—with approval—schedule meetings.', helpEs: 'Encontrar disponibilidad y—con aprobación—programar reuniones.' },
  { slug: 'googledrive', icon: FolderOpen, en: 'Files and documents', es: 'Archivos y documentos', helpEn: 'Find the right files and use them as client context.', helpEs: 'Encontrar archivos y usarlos como contexto del cliente.' },
  { slug: 'slack', icon: MessageSquare, en: 'Team messages', es: 'Mensajes del equipo', helpEn: 'Summarize updates and prepare replies.', helpEs: 'Resumir novedades y preparar respuestas.' },
  { slug: 'notion', icon: Database, en: 'Knowledge and notes', es: 'Conocimiento y notas', helpEn: 'Find project knowledge and keep approved records current.', helpEs: 'Encontrar conocimiento y mantener registros aprobados.' },
  { slug: 'hubspot', icon: BriefcaseBusiness, en: 'Customers and sales', es: 'Clientes y ventas', helpEn: 'Review customer context and prepare follow-up work.', helpEs: 'Revisar contexto de clientes y preparar seguimiento.' }
];

async function accessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export function Connections({ onNavigate }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState(null);
  const [session, setSession] = useState(null);
  const [selected, setSelected] = useState(ARMS.map(a => a.slug));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_BASE) return;
    accessToken().then(token => fetch(`${API_BASE}/api/composio/status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })).then(r => r.ok ? r.json() : Promise.reject(new Error('Status unavailable')))
      .then(setStatus).catch(() => setStatus({ configured: false }));
  }, []);

  function toggle(slug) {
    setSelected(current => current.includes(slug) ? current.filter(v => v !== slug) : [...current, slug]);
  }

  async function beginConnection() {
    setBusy(true); setError('');
    try {
      const token = await accessToken();
      const response = await fetch(`${API_BASE}/api/composio/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ toolkits: selected })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not start app connection');
      setSession(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const t = lang === 'es' ? {
    back: 'Volver a Fanni', eyebrow: 'LOS BRAZOS DE FANNI', title: 'Conecta el trabajo. Mantén el control.',
    intro: 'Cada aplicación pertenece solo a este espacio de cliente. Fanni te pedirá permiso antes de cambiar, enviar, publicar o borrar algo.',
    choose: 'Elige qué puede usar Fanni', connect: 'Preparar conexiones', ready: 'Sesión segura preparada',
    next: 'Ahora Fanni puede darte enlaces seguros de autorización dentro del chat.', configured: 'Composio conectado', notConfigured: 'Falta configurar Composio',
    privacy: 'Las credenciales no pasan por el chat ni se guardan en la interfaz.', account: 'Cuenta específica requerida cuando hay más de una.'
  } : {
    back: 'Back to Fanni', eyebrow: 'FANNI’S ARMS', title: 'Connect the work. Keep control.',
    intro: 'Every app belongs only to this client workspace. Fanni asks before she changes, sends, publishes, or deletes anything.',
    choose: 'Choose what Fanni can use', connect: 'Prepare connections', ready: 'Secure session prepared',
    next: 'Fanni can now provide secure authorization links inside the conversation.', configured: 'Composio connected', notConfigured: 'Composio needs configuration',
    privacy: 'Credentials never pass through chat or appear in this interface.', account: 'A specific account is required when more than one is connected.'
  };

  return (
    <main className="connections-page">
      <header className="connections-header">
        <button className="connections-back" onClick={() => onNavigate('/app')}><ArrowLeft size={18} /> {t.back}</button>
        <span className={`connection-health ${status?.configured ? 'is-ready' : ''}`}>
          <span className="connection-health__dot" /> {status?.configured ? t.configured : t.notConfigured}
        </span>
      </header>

      <section className="connections-hero">
        <p className="connections-eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>

      <section className="connections-panel" aria-labelledby="connections-title">
        <div className="connections-panel__heading">
          <div><span>01</span><h2 id="connections-title">{t.choose}</h2></div>
          <LockKeyhole size={22} aria-hidden="true" />
        </div>

        <div className="connections-grid">
          {ARMS.map(({ slug, icon: Icon, en, es, helpEn, helpEs }) => {
            const active = selected.includes(slug);
            return (
              <button key={slug} className={`connection-arm ${active ? 'is-selected' : ''}`} onClick={() => toggle(slug)} aria-pressed={active}>
                <span className="connection-arm__icon"><Icon size={22} /></span>
                <span className="connection-arm__copy"><strong>{lang === 'es' ? es : en}</strong><small>{lang === 'es' ? helpEs : helpEn}</small></span>
                <span className="connection-arm__check">{active ? <Check size={16} /> : null}</span>
              </button>
            );
          })}
        </div>

        <div className="connections-explainer">
          <p><LockKeyhole size={16} /> {t.privacy}</p>
          <p><Link2 size={16} /> {t.account}</p>
        </div>

        {error && <p className="connections-error" role="alert">{error}</p>}
        {session ? (
          <div className="connections-success" role="status">
            <Check size={20} /><div><strong>{t.ready}</strong><p>{t.next}</p></div>
          </div>
        ) : (
          <button className="connections-primary" disabled={busy || !status?.configured || selected.length === 0} onClick={beginConnection}>
            {busy ? '…' : t.connect}<span>{selected.length}</span>
          </button>
        )}
      </section>
    </main>
  );
}
