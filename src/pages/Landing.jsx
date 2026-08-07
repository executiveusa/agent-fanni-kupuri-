import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  Globe2,
  LockKeyhole,
  Menu,
  Radar,
  ShieldCheck,
  X
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { FanniCharacter } from '../components/FanniCharacter.jsx';
import { FanniDesk } from '../components/FanniDesk.jsx';
import { OFFERS, PROGRAMS, PROJECTS, SIGNAL_LAB, SITE_COPY } from '../content/publicSite.js';

const STATUS_ICONS = {
  active: Clock3,
  research: Radar,
  shipped: CheckCircle2
};

function labelForType(type, labels) {
  if (type === 'internal') return labels.internal;
  if (type === 'private') return labels.private;
  if (type === 'pilot') return labels.pilot;
  if (type === 'case-study') return labels.caseStudy;
  return labels.lab;
}

/**
 * @param {{ onNavigate: (route: string) => void }} props
 */
export function Landing({ onNavigate }) {
  const { lang, toggle } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = SITE_COPY[lang];
  const featuredProjects = PROJECTS.slice(0, 4);
  const liveProjects = PROJECTS.filter(project => project.status === 'active').slice(0, 4);

  function go(route) {
    setMenuOpen(false);
    onNavigate(route);
  }

  function scrollTo(id) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="public-site">
      <header className="public-nav">
        <button type="button" className="public-nav__brand" onClick={() => go('/')} aria-label="Fanni home">
          <strong>FANNI</strong>
          <span>Kupuri Media</span>
        </button>

        <nav className={`public-nav__links ${menuOpen ? 'public-nav__links--open' : ''}`} aria-label="Primary navigation">
          <button type="button" onClick={() => scrollTo('work')}>{copy.nav.work}</button>
          <button type="button" onClick={() => scrollTo('programs')}>{copy.nav.programs}</button>
          <button type="button" onClick={() => scrollTo('live')}>{copy.nav.live}</button>
          <button type="button" onClick={() => scrollTo('signal-lab')}>{copy.nav.lab}</button>
          <button type="button" onClick={() => scrollTo('about')}>{copy.nav.about}</button>
        </nav>

        <div className="public-nav__actions">
          <button type="button" className="public-nav__language" onClick={toggle} aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}>
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <button type="button" className="public-nav__signin" onClick={() => go('/auth')}>{copy.nav.signIn}</button>
          <button type="button" className="public-nav__ask" onClick={() => go('/app/chat')}>{copy.nav.ask} <ArrowUpRight size={16} /></button>
          <button
            type="button"
            className="public-nav__menu"
            onClick={() => setMenuOpen(value => !value)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="public-hero" aria-labelledby="public-hero-title">
          <div className="public-hero__copy">
            <p className="public-eyebrow">{copy.hero.eyebrow}</p>
            <h1 id="public-hero-title">{copy.hero.headline}</h1>
            <p className="public-hero__statement">{copy.hero.statement}</p>
            <div className="public-hero__actions">
              <button type="button" className="public-button public-button--primary" onClick={() => go('/app/chat')}>
                {copy.hero.primary} <ArrowUpRight size={19} />
              </button>
              <button type="button" className="public-button public-button--text" onClick={() => scrollTo('live')}>
                {copy.hero.secondary} <ArrowDownRight size={18} />
              </button>
            </div>
          </div>

          <div className="public-hero__character">
            <FanniCharacter labelled />
            <div className="public-hero__character-note">
              <span>{lang === 'en' ? 'Eight governed capabilities' : 'Ocho capacidades gobernadas'}</span>
              <strong>{lang === 'en' ? 'One clear Fanni' : 'Una sola Fanni clara'}</strong>
            </div>
          </div>
        </section>

        <section className="public-proof" aria-label={lang === 'en' ? 'Current proof' : 'Evidencia actual'}>
          {copy.proof.map((item, index) => (
            <div key={item} className="public-proof__item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </section>

        <section id="programs" className="public-section public-programs" aria-labelledby="programs-title">
          <header className="public-section__header">
            <p className="public-section__index">01 · {copy.nav.programs}</p>
            <div>
              <h2 id="programs-title">{copy.sections.programs}</h2>
              <p>{copy.sections.programsIntro}</p>
            </div>
          </header>

          <div className="public-programs__list">
            {PROGRAMS.map(program => (
              <article key={program.slug} className={`public-program public-program--${program.accent}`}>
                <span className="public-program__number">{program.number}</span>
                <div className="public-program__main">
                  <p className="public-program__name">{program.name[lang]}</p>
                  <h3>{program.promise[lang]}</h3>
                  <p className="public-program__pain">{program.pain[lang]}</p>
                </div>
                <ul className="public-program__outcomes" aria-label={copy.labels.outcome}>
                  {program.outcomes[lang].map(outcome => <li key={outcome}>{outcome}</li>)}
                </ul>
                <button type="button" className="public-program__link" onClick={() => go(`/programs/${program.slug}`)}>
                  {copy.labels.start} <ArrowUpRight size={20} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="public-section public-work" aria-labelledby="work-title">
          <header className="public-section__header public-section__header--light">
            <p className="public-section__index">02 · {copy.nav.work}</p>
            <div>
              <h2 id="work-title">{copy.sections.work}</h2>
              <p>{copy.sections.workIntro}</p>
            </div>
          </header>

          <div className="public-work__grid">
            {featuredProjects.map((project, index) => (
              <article key={project.slug} className={`public-project public-project--${project.accent} ${index === 0 ? 'public-project--lead' : ''}`}>
                <div className="public-project__meta">
                  <span>{labelForType(project.type, copy.labels)}</span>
                  <span>{project.location}</span>
                </div>
                <div className="public-project__body">
                  <p>{project.client}</p>
                  <h3>{project.title}</h3>
                  <strong>{project.transformation[lang]}</strong>
                </div>
                <div className="public-project__evidence">
                  <span>{copy.labels.evidence}</span>
                  <p>{project.evidence[0]}</p>
                </div>
                <button type="button" onClick={() => go(`/work/${project.slug}`)}>
                  {copy.labels.details} <ArrowUpRight size={19} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="live" className="public-section public-live" aria-labelledby="live-title">
          <header className="public-section__header">
            <p className="public-section__index">03 · {copy.nav.live}</p>
            <div>
              <h2 id="live-title">{copy.sections.live}</h2>
              <p>{copy.sections.liveIntro}</p>
            </div>
          </header>

          <div className="public-live__table" role="list">
            {liveProjects.map(project => {
              const StatusIcon = STATUS_ICONS[project.status] || Clock3;
              return (
                <button key={project.slug} type="button" className="public-live__row" onClick={() => go(`/work/${project.slug}`)} role="listitem">
                  <span className="public-live__status"><StatusIcon size={16} /> {copy.labels[project.status]}</span>
                  <span className="public-live__project">
                    <strong>{project.title}</strong>
                    <small>{project.stage}</small>
                  </span>
                  <span className="public-live__next"><small>{copy.labels.next}</small>{project.next[lang]}</span>
                  <span className="public-live__date">{project.updated}</span>
                  <ArrowUpRight size={19} />
                </button>
              );
            })}
          </div>
        </section>

        <section id="signal-lab" className="public-section public-lab" aria-labelledby="lab-title">
          <header className="public-section__header public-section__header--light">
            <p className="public-section__index">04 · {copy.nav.lab}</p>
            <div>
              <h2 id="lab-title">{copy.sections.lab}</h2>
              <p>{copy.sections.labIntro}</p>
            </div>
          </header>

          <div className="public-lab__list">
            {SIGNAL_LAB.map((signal, index) => (
              <article key={signal.slug} className="public-signal">
                <div className="public-signal__number">{String(index + 1).padStart(2, '0')}</div>
                <div className="public-signal__content">
                  <p>{signal.theme[lang]}</p>
                  <h3>{signal.title[lang]}</h3>
                  <p className="public-signal__evidence">{signal.evidence[lang]}</p>
                </div>
                <div className="public-signal__offer">
                  <small>{lang === 'en' ? 'Offer being tested' : 'Oferta en prueba'}</small>
                  <strong>{signal.offer[lang]}</strong>
                </div>
                <button type="button" onClick={() => go(`/signals/${signal.slug}`)} aria-label={`${copy.labels.read}: ${signal.title[lang]}`}>
                  <ArrowUpRight size={22} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="offers" className="public-section public-offers" aria-labelledby="offers-title">
          <header className="public-section__header">
            <p className="public-section__index">05 · {lang === 'en' ? 'Offers' : 'Ofertas'}</p>
            <div>
              <h2 id="offers-title">{copy.sections.offers}</h2>
              <p>{copy.sections.offersIntro}</p>
            </div>
          </header>

          <div className="public-offers__grid">
            {OFFERS.map((offer, index) => (
              <article key={offer.slug} className={`public-offer ${index === 0 ? 'public-offer--featured' : ''}`}>
                <p className="public-offer__number">{String(index + 1).padStart(2, '0')}</p>
                <h3>{offer.name[lang]}</h3>
                <div className="public-offer__price">
                  <strong>{typeof offer.price === 'string' ? offer.price : offer.price[lang]}</strong>
                  <span>{offer.cadence[lang]}</span>
                </div>
                {offer.setup && <p className="public-offer__setup">{offer.setup}</p>}
                <p>{offer.promise[lang]}</p>
                <ul>
                  {offer.includes[lang].map(item => <li key={item}>{item}</li>)}
                </ul>
                <button type="button" onClick={() => go(`/checkout/${offer.slug}`)}>
                  {index === 0 ? copy.labels.checkout : copy.labels.start} <ArrowUpRight size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="public-sovereignty" aria-labelledby="sovereignty-title">
          <div className="public-sovereignty__statement">
            <p className="public-section__index">06 · {copy.nav.about}</p>
            <h2 id="sovereignty-title">{copy.sections.sovereignty}</h2>
            <p>{copy.sections.sovereigntyBody}</p>
          </div>
          <div className="public-sovereignty__principles">
            <div><LockKeyhole size={22} /><strong>{lang === 'en' ? 'Private by default' : 'Privado por defecto'}</strong><span>{lang === 'en' ? 'Workspace and client boundaries stay explicit.' : 'Los límites de espacio y cliente permanecen explícitos.'}</span></div>
            <div><ShieldCheck size={22} /><strong>{lang === 'en' ? 'Approval before consequence' : 'Aprobación antes de consecuencias'}</strong><span>{lang === 'en' ? 'Publishing, sending, deleting, or spending requires policy.' : 'Publicar, enviar, borrar o gastar requiere política.'}</span></div>
            <div><Eye size={22} /><strong>{lang === 'en' ? 'Evidence before certainty' : 'Evidencia antes de certeza'}</strong><span>{lang === 'en' ? 'Facts, inferences, unknowns, and blind spots remain separate.' : 'Hechos, inferencias, incógnitas y puntos ciegos permanecen separados.'}</span></div>
            <div><Globe2 size={22} /><strong>{lang === 'en' ? 'Local, cloud, or hybrid' : 'Local, nube o híbrido'}</strong><span>{lang === 'en' ? 'The deployment follows the sensitivity of the work.' : 'El despliegue sigue la sensibilidad del trabajo.'}</span></div>
          </div>
        </section>

        <section className="public-close" aria-label={copy.sections.close}>
          <p>FANNI · KUPURI MEDIA</p>
          <h2>{copy.sections.close}</h2>
          <button type="button" onClick={() => go('/checkout/problem-scan')}>
            {copy.labels.checkout} <ArrowUpRight size={24} />
          </button>
        </section>
      </main>

      <footer className="public-footer">
        <div>
          <strong>FANNI</strong>
          <span>Kupuri Media · Mexico</span>
        </div>
        <nav aria-label="Footer navigation">
          <button type="button" onClick={() => go('/privacy')}>Privacy</button>
          <button type="button" onClick={() => go('/status')}>Status</button>
          <button type="button" onClick={() => go('/app')}>{lang === 'en' ? 'Workspace' : 'Espacio de trabajo'}</button>
        </nav>
        <p>{lang === 'en' ? 'Built in public. Claims remain tied to evidence.' : 'Construido en público. Las afirmaciones permanecen ligadas a evidencia.'}</p>
      </footer>

      <FanniDesk onNavigate={go} />
    </div>
  );
}
