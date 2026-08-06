import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { LanguageContext, useLanguageProvider } from './hooks/useLanguage.js';
import { AuthContext, useAuthProvider } from './hooks/useAuth.js';
import { Landing } from './pages/Landing.jsx';
import { Auth } from './pages/Auth.jsx';
import { ChatApp } from './pages/ChatApp.jsx';

function getRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  if (hash === '/auth' || hash === '/auth/') return '/auth';
  if (hash.startsWith('/app')) return '/app';
  if (hash === '/privacy') return '/privacy';
  if (hash === '/status') return '/status';
  return '/';
}

function navigate(route) {
  window.location.hash = route;
}

function Privacy() {
  React.useContext(LanguageContext);
  return (
    <div className="prose-page">
      <nav className="prose-nav">
        <button className="landing-nav__brand" onClick={() => navigate('/')}>
          <span className="landing-nav__wordmark">FANNI</span>
        </button>
      </nav>
      <article className="prose">
        <h1>Privacy Statement</h1>
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
        <h1>System Status</h1>
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

function Router({ route, setRoute }) {
  const navigate = (r) => setRoute(r);

  switch (route) {
    case '/auth': return <Auth onNavigate={navigate} onAuthenticated={() => setRoute('/app')} />;
    case '/app': return <ChatApp onNavigate={navigate} />;
    case '/privacy': return <Privacy />;
    case '/status': return <Status />;
    default: return <Landing onNavigate={navigate} />;
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
        <Router route={route} setRoute={setRoute} />
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
