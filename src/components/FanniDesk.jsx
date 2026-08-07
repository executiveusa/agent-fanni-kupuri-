import { useState } from 'react';
import { ArrowUpRight, MessageCircle, ShieldCheck, Sparkles, X } from 'lucide-react';
import { FanniCharacter } from './FanniCharacter.jsx';
import { useLanguage } from '../hooks/useLanguage.js';

const INTENTS = {
  en: [
    { key: 'demand', title: 'Find customers', detail: 'Show me repeated problems and paid opportunities.' },
    { key: 'reputation', title: 'Protect my reputation', detail: 'Show me what is changing and what is verified.' },
    { key: 'operations', title: 'Organize my business', detail: 'Show me what Fanni can remove from my plate.' }
  ],
  es: [
    { key: 'demand', title: 'Encontrar clientes', detail: 'Muéstrame problemas repetidos y oportunidades pagadas.' },
    { key: 'reputation', title: 'Proteger mi reputación', detail: 'Muéstrame qué está cambiando y qué está verificado.' },
    { key: 'operations', title: 'Organizar mi negocio', detail: 'Muéstrame qué puede quitar Fanni de mi carga.' }
  ]
};

/**
 * Accessible desktop hover/focus surface with a click fallback for touch devices.
 * It hands the selected problem to the Space Agent route without making hover essential.
 * @param {{ onNavigate: (route: string) => void }} props
 */
export function FanniDesk({ onNavigate }) {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeIntent, setActiveIntent] = useState(null);
  const copy = lang === 'en'
    ? {
        open: 'Ask Fanni',
        close: 'Close Fanni',
        eyebrow: 'Fanni is at her desk',
        title: 'What problem is costing you time or money?',
        note: 'Choose one. Fanni will keep the first conversation focused.',
        continue: 'Continue with Fanni',
        safety: 'No external action happens without the required approval.'
      }
    : {
        open: 'Pregúntale a Fanni',
        close: 'Cerrar Fanni',
        eyebrow: 'Fanni está en su escritorio',
        title: '¿Qué problema te está costando tiempo o dinero?',
        note: 'Elige uno. Fanni mantendrá enfocada la primera conversación.',
        continue: 'Continuar con Fanni',
        safety: 'Ninguna acción externa ocurre sin la aprobación requerida.'
      };

  function continueToFanni(intent = activeIntent) {
    if (intent) window.sessionStorage.setItem('fanni_public_intent', intent);
    onNavigate('/app/chat');
  }

  return (
    <aside
      className={`fanni-desk ${open ? 'fanni-desk--open' : ''}`}
      aria-label={copy.open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="fanni-desk__trigger"
        aria-expanded={open}
        aria-controls="fanni-desk-panel"
        onClick={() => setOpen(value => !value)}
      >
        <FanniCharacter className="fanni-desk__character" />
        <span className="fanni-desk__trigger-label"><MessageCircle size={16} /> {copy.open}</span>
      </button>

      <div id="fanni-desk-panel" className="fanni-desk__panel" aria-hidden={!open}>
        <div className="fanni-desk__panel-topline">
          <span><Sparkles size={15} /> {copy.eyebrow}</span>
          <button type="button" className="fanni-desk__close" onClick={() => setOpen(false)} aria-label={copy.close}>
            <X size={18} />
          </button>
        </div>
        <h2>{copy.title}</h2>
        <p>{copy.note}</p>

        <div className="fanni-desk__intents" role="list">
          {INTENTS[lang].map(intent => (
            <button
              type="button"
              key={intent.key}
              className={`fanni-desk__intent ${activeIntent === intent.key ? 'fanni-desk__intent--active' : ''}`}
              onClick={() => setActiveIntent(intent.key)}
              role="listitem"
            >
              <span>
                <strong>{intent.title}</strong>
                <small>{intent.detail}</small>
              </span>
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="fanni-desk__continue"
          disabled={!activeIntent}
          onClick={() => continueToFanni()}
        >
          {copy.continue} <ArrowUpRight size={18} />
        </button>
        <p className="fanni-desk__safety"><ShieldCheck size={15} /> {copy.safety}</p>
      </div>
    </aside>
  );
}
