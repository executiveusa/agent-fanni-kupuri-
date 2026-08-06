import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ClipboardCheck, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import './styles.css';
import './connections.css';
import './focus-home.css';
import { LanguageContext, useLanguageProvider, useLanguage } from './hooks/useLanguage.js';
import { AuthContext, useAuthProvider } from './hooks/useAuth.js';

const Landing = lazy(() => import('./pages/Landing.jsx').then(module => ({ default: module.Landing })));
const Auth = lazy(() => import('./pages/Auth.jsx').then(module => ({ default: module.Auth })));
const Home = lazy(() => import('./pages/Home.jsx').then(module => ({ default: module.Home })));
const ChatApp = lazy(() => import('./pages/ChatApp.jsx').then(module => ({ default: module.ChatApp })));
const Connections = lazy(() => import('./pages/Connections.jsx').then(module => ({ default: module.Connections })));

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  if (hash === '/auth' || hash === '/auth/') return '/auth';
  if (hash.startsWith('/app/connections')) return '/app/connections';
  if (hash.startsWith('/app/approvals')) return '/app/approvals';
  if (hash.startsWith('/app/history')) return '/app/history';
  if (hash.startsWith('/app/chat')) return '/app/chat';
  if (hash === '/app' || hash === '/app/') return '/app';
  if (hash === '/privacy') return '/privacy';
  if (hash === '/status') return '/status';
  return '/';
}

function navigate(route) {
  window.location.hash = route;
}

function LoadingRoute() {
  return <div className="route-loading" role="status">Loading Fanni…</div>;
}

function Privacy() {
  return (
    <div className="prose-page">
      <nav className="prose-nav">
        <button className="landing-nav__brand" onClick={() => navigate('/')}>
          <span className="landing-nav__wordmark">FANNI</span>
        </button>
      </nav>
      <article className="prose">
        <h1>Privacy Statement / Declaración de Privacidad</h1>
        <p>Agent Fanni by Kupuri Media is designed with privacy as a default, not an option.</p>
        <h2>Data handling</h2>
        <ul>
          <li>All workspace data is isolated by organization and workspace at the database layer.</li>
          <li>External writes require explicit authorization from a workspace owner or admin.</li>
          <li>Real client data is disabled by default.</li>
          <li>Voice recordings are processed and not retained beyond the transcription pipeline.</li>
          <li>Secrets never leave the server environment.</li>
        </ul>
        <h2>Contact</h2>
        <p>For privacy inquiries, contact your Kupuri Media workspace administrator.</p>
      </article>
    </div>
  );
}

function Status() {
  const [health, setHealth] = useState(null);
  const API_BASE = import.meta.env.VITE_FANNI_API_BASE_URL || '';

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/health`).then(r => r.json()).then(setHealth).catch(() => {});
  }, [API_BASE]);

  return (
    <div className="prose-page">
      <nav className="prose-nav">
        <button className="landing-nav__brand" onClick={() => navigate('/')}>
          <span className="landing-nav__wordmark">FANNI</span>
        </button>
      </nav>
      <article className="prose">
        <h1>System Status / Estado del Sistema</h1>
        {!API_BASE && <p>API not configured. Status endpoint unavailable.</p>}
        {API_BASE && !health && <p>Loading…</p>}
        {health && (
          <>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Version:</strong> {health.version}</p>
            <p><strong>Uptime:</strong> {health.uptime}s</p>
            <p><strong>External writes:</strong> {health.safetyGates?.externalWritesEnabled ? 'enabled' : 'blocked'}</p>
          </>
        )}
      </article>
    </div>
  );
}

function FocusSection({ type, onNavigate }) {
  const { lang } = useLanguage();
  const isApprovals = type === 'approvals';
  const copy = isApprovals
    ? {
        title: lang === 'en' ? 'Approvals' : 'Aprobaciones',
        intro: lang === 'en'
          ? 'Anything Fanni wants to send, publish, delete, or change appears here before it happens.'
          : 'Todo lo que Fanni quiera enviar, publicar, borrar o cambiar aparece aquí antes de que ocurra.',
        empty: lang === 'en' ? 'No approvals are waiting.' : 'No hay aprobaciones pendientes.'
      }
    : {
        title: lang === 'en' ? 'History' : 'Historial',
        intro: lang === 'en'
          ? 'Finished work, evidence, and saved return points will appear here.'
          : 'El trabajo terminado, la evidencia y los puntos de retorno guardados aparecerán aquí.',
        empty: lang === 'en' ? 'No finished work has been recorded yet.' : 'Todavía no hay trabajo terminado registrado.'
      };
  const Icon = isApprovals ? ClipboardCheck : HistoryIcon;

  return (
    <div className="focus-section-page">
      <header>
        <button onClick={() => onNavigate('/app')}><ArrowLeft size={17} /> {lang === 'en' ? 'Home' : 'Inicio'}</button>
        <strong>FANNI</strong>
      </header>
      <main>
        <Icon size={30} />
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="focus-section-empty">
          <ShieldCheck size={22} />
          <strong>{copy.empty}</strong>
          <span>{lang === 'en' ? 'Fanni will show the client, account, exact change, and saved return point.' : 'Fanni mostrará el cliente, la cuenta, el cambio exacto y el punto de retorno guardado.'}</span>
        </div>
      </main>
    </div>
  );
}

function Router({ route, setRoute }) {
  const nav = (nextRoute) => setRoute(nextRoute);

  switch (route) {
    case '/auth': return <Auth onNavigate={nav} onAuthenticated={() => setRoute('/app')} />;
    case '/app/connections': return <Connections onNavigate={nav} />;
    case '/app/approvals': return <FocusSection type="approvals" onNavigate={nav} />;
    case '/app/history': return <FocusSection type="history" onNavigate={nav} />;
    case '/app/chat': return <ChatApp onNavigate={nav} />;
    case '/app': return <Home onNavigate={nav} />;
    case '/privacy': return <Privacy />;
    case '/status': return <Status />;
    default: return <Landing onNavigate={nav} />;
  }
}

function App() {
  const languageValue = useLanguageProvider();
  const authValue = useAuthProvider();
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    window.location.hash = route;
  }, [route]);

  return (
    <LanguageContext.Provider value={languageValue}>
      <AuthContext.Provider value={authValue}>
        <Suspense fallback={<LoadingRoute />}>
          <Router route={route} setRoute={setRoute} />
        </Suspense>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
