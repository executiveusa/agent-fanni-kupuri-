import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage.js';
import { signIn, signInWithMagicLink, bootstrapWorkspace } from '../hooks/useAuth.js';

/**
 * @param {{ onNavigate: (route: string) => void, onAuthenticated: () => void }} props
 */
export function Auth({ onNavigate, onAuthenticated }) {
  const { lang, t, toggle } = useLanguage();
  const [mode, setMode] = useState('password'); // password | magic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signIn(email, password);
      if (user) {
        try { await bootstrapWorkspace(user.id); } catch { /* workspace may already exist */ }
        onAuthenticated();
      }
    } catch (err) {
      setError(err.message || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (err) {
      setError(err.message || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <nav className="auth-nav" aria-label="Navigation">
        <button className="landing-nav__brand" onClick={() => onNavigate('/')} aria-label="Back to home">
          <span className="landing-nav__wordmark">FANNI</span>
          <span className="landing-nav__org">Kupuri Media</span>
        </button>
        <button className="lang-toggle" onClick={toggle} aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}>
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
      </nav>

      <div className="auth-card" role="main" aria-label={t.auth.signIn}>
        <div className="auth-card__header">
          <div className="auth-avatar-mark" aria-hidden="true">F</div>
          <h1 className="auth-card__title">{t.auth.signIn}</h1>
          <p className="auth-card__sub">Kupuri Media · {lang === 'en' ? 'Secure workspace access' : 'Acceso seguro al espacio de trabajo'}</p>
        </div>

        {magicSent ? (
          <div className="auth-success" role="status">
            <span className="auth-success__icon" aria-hidden="true">✓</span>
            <p>{t.auth.magicLinkSent}</p>
          </div>
        ) : (
          <form onSubmit={mode === 'password' ? handlePassword : handleMagicLink} className="auth-form" noValidate>
            <div className="form-field">
              <label htmlFor="email" className="form-label">{t.auth.email}</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>

            {mode === 'password' && (
              <div className="form-field">
                <label htmlFor="password" className="form-label">{t.auth.password}</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="form-error" role="alert">{error}</div>
            )}

            <button type="submit" className="btn-primary btn-full" disabled={loading || !email}>
              {loading ? t.auth.loading : mode === 'password' ? t.auth.submit : t.auth.magicLink}
            </button>

            <button
              type="button"
              className="btn-ghost btn-full btn-sm"
              onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setError(''); }}
              disabled={loading}
            >
              {mode === 'password' ? t.auth.magicLink : t.auth.submit}
            </button>
          </form>
        )}

        <p className="auth-card__footnote">{t.auth.noAccount}</p>
      </div>
    </div>
  );
}
