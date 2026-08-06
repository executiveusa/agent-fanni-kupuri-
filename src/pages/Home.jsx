import { useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Link2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  History,
  ClipboardCheck
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { useAuth, bootstrapWorkspace } from '../hooks/useAuth.js';

const COPY = {
  en: {
    eyebrow: 'Your work, clearly organized',
    title: 'What needs to happen?',
    subtitle: 'Tell Fanni the result you need. She will organize the work, show which client and apps are involved, and ask before anything important changes.',
    ask: 'Talk to Fanni',
    connect: 'Connect apps',
    client: 'Active client',
    clientValue: 'Kupuri Media workspace',
    today: 'Today',
    completed: '3 items completed',
    approval: '1 approval needs attention',
    attention: '2 connected accounts need attention',
    current: 'Current work',
    currentTitle: 'Media intelligence workflow',
    currentStep: 'Step 2 of 4 · Reviewing new information',
    currentApps: 'Using Gmail and Google Drive',
    currentAction: 'No action needed right now',
    approvals: 'Approvals',
    approvalsCopy: 'Review anything Fanni wants to send, publish, delete, or change.',
    connections: 'Connections',
    connectionsCopy: 'Choose which apps and accounts Fanni may use for this client.',
    history: 'History',
    historyCopy: 'See finished work, evidence, and saved return points.',
    safety: 'Fanni never sends, publishes, deletes, or changes access without the required approval.',
    details: 'View work details'
  },
  es: {
    eyebrow: 'Tu trabajo, claramente organizado',
    title: '¿Qué necesita pasar?',
    subtitle: 'Dile a Fanni el resultado que necesitas. Ella organizará el trabajo, mostrará qué cliente y aplicaciones están involucrados y pedirá permiso antes de cualquier cambio importante.',
    ask: 'Hablar con Fanni',
    connect: 'Conectar aplicaciones',
    client: 'Cliente activo',
    clientValue: 'Espacio de Kupuri Media',
    today: 'Hoy',
    completed: '3 tareas completadas',
    approval: '1 aprobación necesita atención',
    attention: '2 cuentas conectadas necesitan atención',
    current: 'Trabajo actual',
    currentTitle: 'Flujo de inteligencia de medios',
    currentStep: 'Paso 2 de 4 · Revisando información nueva',
    currentApps: 'Usando Gmail y Google Drive',
    currentAction: 'No necesitas hacer nada ahora',
    approvals: 'Aprobaciones',
    approvalsCopy: 'Revisa lo que Fanni quiere enviar, publicar, borrar o cambiar.',
    connections: 'Conexiones',
    connectionsCopy: 'Elige qué aplicaciones y cuentas puede usar Fanni para este cliente.',
    history: 'Historial',
    historyCopy: 'Consulta trabajo terminado, evidencia y puntos de retorno guardados.',
    safety: 'Fanni nunca envía, publica, elimina ni cambia accesos sin la aprobación requerida.',
    details: 'Ver detalles del trabajo'
  }
};

export function Home({ onNavigate }) {
  const { lang, toggle: toggleLang } = useLanguage();
  const { user, loading, configured } = useAuth();
  const c = COPY[lang] || COPY.en;

  useEffect(() => {
    if (user && configured) bootstrapWorkspace(user.id).catch(() => {});
  }, [user, configured]);

  useEffect(() => {
    if (!loading && !user && configured) onNavigate('/auth');
  }, [loading, user, configured, onNavigate]);

  return (
    <div className="focus-home">
      <header className="focus-home__header">
        <button className="focus-home__brand" onClick={() => onNavigate('/')} aria-label="Fanni home">
          <span>FANNI</span>
          <small>Kupuri Media</small>
        </button>
        <nav className="focus-home__nav" aria-label="Main navigation">
          <button aria-current="page">{lang === 'en' ? 'Home' : 'Inicio'}</button>
          <button onClick={() => onNavigate('/app/chat')}>{lang === 'en' ? 'Work' : 'Trabajo'}</button>
          <button onClick={() => onNavigate('/app/connections')}>{c.connections}</button>
          <button onClick={() => onNavigate('/app/approvals')}>{c.approvals}</button>
          <button onClick={() => onNavigate('/app/history')}>{c.history}</button>
        </nav>
        <button className="focus-home__language" onClick={toggleLang} aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}>
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </header>

      <main className="focus-home__main">
        <section className="focus-home__hero" aria-labelledby="focus-home-title">
          <p className="focus-home__eyebrow"><Sparkles size={15} /> {c.eyebrow}</p>
          <h1 id="focus-home-title">{c.title}</h1>
          <p>{c.subtitle}</p>
          <div className="focus-home__actions">
            <button className="focus-action focus-action--primary" onClick={() => onNavigate('/app/chat')}>
              <MessageCircle size={18} /> {c.ask} <ArrowRight size={17} />
            </button>
            <button className="focus-action" onClick={() => onNavigate('/app/connections')}>
              <Link2 size={18} /> {c.connect}
            </button>
          </div>
        </section>

        <section className="focus-context" aria-label={c.client}>
          <div>
            <span>{c.client}</span>
            <strong>{c.clientValue}</strong>
          </div>
          <span className="focus-context__safe"><ShieldCheck size={16} /> {lang === 'en' ? 'Protected workspace' : 'Espacio protegido'}</span>
        </section>

        <section className="focus-summary" aria-labelledby="today-heading">
          <h2 id="today-heading">{c.today}</h2>
          <div className="focus-summary__items">
            <p><CheckCircle2 size={18} /> {c.completed}</p>
            <p><ClipboardCheck size={18} /> {c.approval}</p>
            <p><Clock3 size={18} /> {c.attention}</p>
          </div>
        </section>

        <section className="focus-work" aria-labelledby="current-work-heading">
          <div className="focus-work__heading">
            <div>
              <span>{c.current}</span>
              <h2 id="current-work-heading">{c.currentTitle}</h2>
            </div>
            <button onClick={() => onNavigate('/app/chat')}>{c.details} <ArrowRight size={16} /></button>
          </div>
          <div className="focus-progress" aria-label={c.currentStep}>
            <span style={{ width: '50%' }} />
          </div>
          <div className="focus-work__facts">
            <p>{c.currentStep}</p>
            <p>{c.currentApps}</p>
            <p className="focus-work__calm"><CheckCircle2 size={16} /> {c.currentAction}</p>
          </div>
        </section>

        <section className="focus-destinations" aria-label={lang === 'en' ? 'Workspace areas' : 'Áreas de trabajo'}>
          <button onClick={() => onNavigate('/app/approvals')}>
            <ClipboardCheck size={22} />
            <span><strong>{c.approvals}</strong><small>{c.approvalsCopy}</small></span>
            <ArrowRight size={18} />
          </button>
          <button onClick={() => onNavigate('/app/connections')}>
            <Link2 size={22} />
            <span><strong>{c.connections}</strong><small>{c.connectionsCopy}</small></span>
            <ArrowRight size={18} />
          </button>
          <button onClick={() => onNavigate('/app/history')}>
            <History size={22} />
            <span><strong>{c.history}</strong><small>{c.historyCopy}</small></span>
            <ArrowRight size={18} />
          </button>
        </section>

        <p className="focus-safety"><ShieldCheck size={17} /> {c.safety}</p>
      </main>
    </div>
  );
}
