import { ArrowLeft, ArrowUpRight, Eye, Radar, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { findSignal, SITE_COPY } from '../content/publicSite.js';

/** @param {{ slug: string, onNavigate: (route: string) => void }} props */
export function SignalPage({ slug, onNavigate }) {
  const { lang, toggle } = useLanguage();
  const copy = SITE_COPY[lang];
  const signal = findSignal(slug);

  if (!signal) {
    return (
      <main className="public-detail public-detail--missing">
        <h1>{lang === 'en' ? 'Signal not found' : 'Señal no encontrada'}</h1>
        <button type="button" onClick={() => onNavigate('/')}>{lang === 'en' ? 'Return home' : 'Volver al inicio'}</button>
      </main>
    );
  }

  return (
    <div className="public-detail public-signal-detail">
      <header className="public-detail__nav">
        <button type="button" onClick={() => onNavigate('/')}><ArrowLeft size={18} /> FANNI</button>
        <button type="button" onClick={toggle}>{lang === 'en' ? 'ES' : 'EN'}</button>
      </header>

      <main>
        <section className="public-detail__hero public-signal-detail__hero">
          <div className="public-signal-detail__meta"><Radar size={18} /><span>{signal.theme[lang]}</span><span>{copy.labels[signal.status]}</span></div>
          <h1>{signal.title[lang]}</h1>
          <p className="public-detail__lede">{signal.evidence[lang]}</p>
          <button type="button" onClick={() => onNavigate('/checkout/problem-scan')}>
            {copy.labels.checkout} <ArrowUpRight size={20} />
          </button>
        </section>

        <section className="public-signal-detail__proof">
          <div>
            <Eye size={26} />
            <p className="public-detail__kicker">{copy.labels.evidence}</p>
            <h2>{lang === 'en' ? 'This is a qualitative market signal, not a market-size claim.' : 'Esta es una señal cualitativa del mercado, no una afirmación del tamaño del mercado.'}</h2>
          </div>
          <div>
            <p>{signal.evidence[lang]}</p>
            <dl>
              <div><dt>{lang === 'en' ? 'Source class' : 'Clase de fuente'}</dt><dd>{signal.source}</dd></div>
              <div><dt>{copy.labels.updated}</dt><dd>{signal.updated}</dd></div>
              <div><dt>{lang === 'en' ? 'Coverage limit' : 'Límite de cobertura'}</dt><dd>{lang === 'en' ? 'Public discussions only; no claim of platform-wide prevalence.' : 'Solo conversaciones públicas; no se afirma prevalencia en toda la plataforma.'}</dd></div>
            </dl>
          </div>
        </section>

        <section className="public-signal-detail__offer">
          <div>
            <p className="public-detail__kicker">{lang === 'en' ? 'Offer being tested' : 'Oferta en prueba'}</p>
            <h2>{signal.offer[lang]}</h2>
          </div>
          <div>
            <p>{lang === 'en'
              ? 'Fanni turns the recurring complaint into a bounded diagnostic, measures whether businesses will pay, and only then expands the capability.'
              : 'Fanni convierte la queja recurrente en un diagnóstico limitado, mide si los negocios pagarán y solo entonces amplía la capacidad.'}</p>
            <button type="button" onClick={() => onNavigate('/app/chat')}>
              {lang === 'en' ? 'Tell Fanni this is my problem' : 'Decirle a Fanni que este es mi problema'} <ArrowUpRight size={19} />
            </button>
          </div>
        </section>

        <section className="public-signal-detail__guardrail">
          <ShieldCheck size={24} />
          <div>
            <h2>{lang === 'en' ? 'Research does not become outreach automatically.' : 'La investigación no se convierte automáticamente en contacto.'}</h2>
            <p>{lang === 'en'
              ? 'Fanni may summarize permitted public signals and propose a test. She may not impersonate a customer, spam a community, or publish promotional replies without the required review.'
              : 'Fanni puede resumir señales públicas permitidas y proponer una prueba. No puede suplantar a un cliente, enviar spam ni publicar respuestas promocionales sin revisión.'}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
