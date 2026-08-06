import { useLanguage } from '../hooks/useLanguage.js';

const DEMO_CHECKPOINTS = [
  { id: 'cp-001', stage: 'ingest', label: 'Records collected', time: '09:01' },
  { id: 'cp-002', stage: 'classify', label: 'Classification complete', time: '09:02' },
  { id: 'cp-003', stage: 'verify', label: 'Human review gate', time: '09:04', highlight: true },
  { id: 'cp-004', stage: 'report', label: 'Report generated', time: '09:06' }
];

const USE_CASES = [
  { icon: '📡', en: 'Weekly media intelligence in minutes', es: 'Inteligencia de medios semanal en minutos' },
  { icon: '📋', en: 'Approval workflows with evidence trail', es: 'Flujos de aprobación con rastro de evidencia' },
  { icon: '🔒', en: 'Private by default, auditable always', es: 'Privado por defecto, auditable siempre' },
  { icon: '🌐', en: 'Bilingual voice interface', es: 'Interfaz de voz bilingüe' }
];

/**
 * @param {{ onNavigate: (route: string) => void }} props
 */
export function Landing({ onNavigate }) {
  const { lang, t, toggle } = useLanguage();

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav" aria-label="Main navigation">
        <a className="landing-nav__brand" href="#/" aria-label="Fanni home">
          <span className="landing-nav__wordmark">FANNI</span>
          <span className="landing-nav__org">Kupuri Media</span>
        </a>
        <div className="landing-nav__actions">
          <button className="lang-toggle" onClick={toggle} aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}>
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <button className="btn-ghost" onClick={() => onNavigate('/auth')}>
            {t.nav.signIn}
          </button>
          <button className="btn-primary" onClick={() => onNavigate('/app')}>
            {t.landing.ctaButton}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" aria-labelledby="hero-headline">
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow" aria-hidden="true">Agent Fanni · Kupuri Media</p>
          <h1 id="hero-headline" className="landing-hero__headline">
            {t.landing.headline}
          </h1>
          <p className="landing-hero__sub">{t.landing.subheadline}</p>
          <div className="landing-hero__actions">
            <button className="btn-primary btn-large" onClick={() => onNavigate('/app')}>
              {t.landing.ctaButton}
            </button>
            <button className="btn-ghost btn-large" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              {t.landing.ctaSecondary}
            </button>
          </div>
        </div>

        <div className="landing-hero__avatar-wrap" aria-hidden="true">
          <div className="landing-hero__avatar-ring" />
          <div className="landing-hero__avatar-portrait">
            <img
              src={`/avatars/fanni-${import.meta.env.VITE_FANNI_AVATAR_VARIANT || 'a'}.png`}
              alt="Fanni"
              className="landing-hero__avatar-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
            />
            <div className="landing-hero__avatar-fallback">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="hg" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#C58A9E" />
                    <stop offset="100%" stopColor="#4C1027" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="100" fill="#0B0A0C" />
                <ellipse cx="100" cy="85" rx="38" ry="44" fill="url(#hg)" />
                <ellipse cx="100" cy="160" rx="60" ry="50" fill="#741C43" />
                <text x="100" y="95" textAnchor="middle" fontSize="48" fontWeight="800" fill="#F3EEE6" fontFamily="serif">F</text>
              </svg>
            </div>
          </div>
          <div className="landing-hero__avatar-state">
            <span className="pulse-dot" />
            <span>{lang === 'en' ? 'Ready to work' : 'Lista para trabajar'}</span>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="landing-trust" role="list" aria-label="Trust indicators">
        {t.landing.trust.map((item) => (
          <span key={item} role="listitem" className="landing-trust__item">
            <span className="landing-trust__dot" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>

      {/* Capability marquee */}
      <div className="landing-marquee" aria-hidden="true">
        <div className="landing-marquee__track">
          {[...t.landing.capabilities, ...t.landing.capabilities].map((cap, i) => (
            <span key={i} className="landing-marquee__item">{cap}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="landing-section" aria-labelledby="how-heading">
        <h2 id="how-heading" className="landing-section__title">{t.landing.sections.howItWorks}</h2>
        <div className="landing-workflow">
          <div className="landing-workflow__stage">
            <span className="landing-workflow__num">01</span>
            <strong>{lang === 'en' ? 'Ingest' : 'Ingestión'}</strong>
            <p>{lang === 'en' ? 'Fanni collects and normalizes signals from your configured sources.' : 'Fanni recopila y normaliza señales de tus fuentes configuradas.'}</p>
          </div>
          <div className="landing-workflow__arrow" aria-hidden="true">→</div>
          <div className="landing-workflow__stage">
            <span className="landing-workflow__num">02</span>
            <strong>{lang === 'en' ? 'Classify' : 'Clasificar'}</strong>
            <p>{lang === 'en' ? 'Each signal is classified, scored for risk, and flagged for review when needed.' : 'Cada señal es clasificada, puntuada por riesgo y marcada para revisión cuando es necesario.'}</p>
          </div>
          <div className="landing-workflow__arrow" aria-hidden="true">→</div>
          <div className="landing-workflow__stage">
            <span className="landing-workflow__num">03</span>
            <strong>{lang === 'en' ? 'Synthesize' : 'Sintetizar'}</strong>
            <p>{lang === 'en' ? 'Verified signals become a structured, downloadable intelligence report.' : 'Las señales verificadas se convierten en un reporte de inteligencia estructurado y descargable.'}</p>
          </div>
          <div className="landing-workflow__arrow" aria-hidden="true">→</div>
          <div className="landing-workflow__stage landing-workflow__stage--highlight">
            <span className="landing-workflow__num">04</span>
            <strong>{lang === 'en' ? 'Measure' : 'Medir'}</strong>
            <p>{lang === 'en' ? 'Every run produces evidence of time saved and automation rate.' : 'Cada ejecución produce evidencia del tiempo ahorrado y la tasa de automatización.'}</p>
          </div>
        </div>
      </section>

      {/* Time travel */}
      <section className="landing-section landing-section--dark" aria-labelledby="time-travel-heading">
        <h2 id="time-travel-heading" className="landing-section__title">{t.landing.sections.timeTravel}</h2>
        <p className="landing-section__sub">{t.landing.sections.timeTravelDesc}</p>
        <div className="checkpoint-timeline" role="list" aria-label="Checkpoint timeline">
          {DEMO_CHECKPOINTS.map((cp) => (
            <div
              key={cp.id}
              className={`checkpoint-node ${cp.highlight ? 'checkpoint-node--highlight' : ''}`}
              role="listitem"
            >
              <div className="checkpoint-node__time">{cp.time}</div>
              <div className="checkpoint-node__dot" aria-hidden="true" />
              <div className="checkpoint-node__label">
                <span className="badge">{cp.stage}</span>
                <span>{cp.label}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="landing-section__caption">
          {lang === 'en'
            ? 'She listens. She organizes. She builds. She remembers. She can go back.'
            : 'Escucha. Organiza. Construye. Recuerda. Puede regresar.'}
        </p>
      </section>

      {/* Use cases */}
      <section className="landing-section" aria-labelledby="use-cases-heading">
        <h2 id="use-cases-heading" className="landing-section__title">{t.landing.sections.useCases}</h2>
        <div className="use-case-grid">
          {USE_CASES.map((uc) => (
            <div key={uc.en} className="use-case-card">
              <span className="use-case-card__icon" aria-hidden="true">{uc.icon}</span>
              <p>{lang === 'en' ? uc.en : uc.es}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sovereignty */}
      <section className="landing-section landing-section--sovereignty" aria-labelledby="sovereignty-heading">
        <p className="sovereignty-label" id="sovereignty-heading">{t.landing.sovereignty.label}</p>
        <div className="sovereignty-lines" aria-label="Sovereignty principles">
          {t.landing.sovereignty.lines.map((line) => (
            <p key={line} className="sovereignty-line">{line}</p>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta" aria-label="Call to action">
        <h2 className="landing-cta__headline">
          {lang === 'en' ? 'Ready to meet Fanni?' : '¿Lista para conocer a Fanni?'}
        </h2>
        <button className="btn-primary btn-large" onClick={() => onNavigate('/app')}>
          {t.landing.ctaButton}
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__brand">
          <strong>FANNI</strong> · Kupuri Media
        </div>
        <nav className="landing-footer__links" aria-label="Footer links">
          <button className="link-ghost" onClick={() => onNavigate('/privacy')}>Privacy</button>
          <button className="link-ghost" onClick={() => onNavigate('/status')}>Status</button>
        </nav>
        <p className="landing-footer__copy">
          {lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
        </p>
      </footer>
    </div>
  );
}
