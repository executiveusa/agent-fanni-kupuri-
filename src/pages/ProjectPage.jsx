import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { findProject, SITE_COPY } from '../content/publicSite.js';

/** @param {{ slug: string, onNavigate: (route: string) => void }} props */
export function ProjectPage({ slug, onNavigate }) {
  const { lang, toggle } = useLanguage();
  const copy = SITE_COPY[lang];
  const project = findProject(slug);

  if (!project) {
    return (
      <main className="public-detail public-detail--missing">
        <h1>{lang === 'en' ? 'Project not found' : 'Proyecto no encontrado'}</h1>
        <button type="button" onClick={() => onNavigate('/')}>{lang === 'en' ? 'Return home' : 'Volver al inicio'}</button>
      </main>
    );
  }

  return (
    <div className={`public-detail public-project-detail public-project-detail--${project.accent}`}>
      <header className="public-detail__nav">
        <button type="button" onClick={() => onNavigate('/')}><ArrowLeft size={18} /> FANNI</button>
        <button type="button" onClick={toggle}>{lang === 'en' ? 'ES' : 'EN'}</button>
      </header>

      <main>
        <section className="public-detail__hero public-project-detail__hero">
          <div className="public-project-detail__meta">
            <span>{copy.labels[project.status]}</span>
            <span>{project.type}</span>
            <span>{project.location}</span>
          </div>
          <p>{project.client}</p>
          <h1>{project.title}</h1>
          <p className="public-detail__lede">{project.transformation[lang]}</p>
          <button type="button" onClick={() => onNavigate('/app/chat')}>
            {lang === 'en' ? 'Ask Fanni about this work' : 'Pregúntale a Fanni sobre este trabajo'} <ArrowUpRight size={20} />
          </button>
        </section>

        <section className="public-project-detail__story">
          <article>
            <span>01</span>
            <p className="public-detail__kicker">{lang === 'en' ? 'The problem' : 'El problema'}</p>
            <h2>{project.problem[lang]}</h2>
          </article>
          <article>
            <span>02</span>
            <p className="public-detail__kicker">{lang === 'en' ? 'Fanni’s assignment' : 'La asignación de Fanni'}</p>
            <h2>{project.assignment[lang]}</h2>
          </article>
          <article>
            <span>03</span>
            <p className="public-detail__kicker">{lang === 'en' ? 'Current result' : 'Resultado actual'}</p>
            <h2>{project.result[lang]}</h2>
          </article>
        </section>

        <section className="public-project-detail__ledger" aria-labelledby="evidence-ledger-title">
          <header>
            <Eye size={24} />
            <div>
              <p className="public-detail__kicker">{copy.labels.evidence}</p>
              <h2 id="evidence-ledger-title">{lang === 'en' ? 'What the public claim is based on' : 'En qué se basa la afirmación pública'}</h2>
            </div>
          </header>
          <div className="public-project-detail__evidence-list">
            {project.evidence.map((item, index) => (
              <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><CheckCircle2 size={18} /></div>
            ))}
          </div>
          <div className="public-project-detail__disclosure">
            <ShieldCheck size={20} />
            <p>{lang === 'en'
              ? 'This page distinguishes an active assignment or lab from a completed client case study. No missing credential, live source, or measured outcome is implied.'
              : 'Esta página distingue una asignación activa o laboratorio de un caso de cliente completado. No implica credenciales, fuentes en vivo ni resultados medidos que aún no existan.'}</p>
          </div>
        </section>

        <section className="public-project-detail__now">
          <div>
            <Clock3 size={24} />
            <p className="public-detail__kicker">{lang === 'en' ? 'Build in public' : 'Construcción en público'}</p>
            <h2>{project.stage}</h2>
          </div>
          <div>
            <span>{copy.labels.updated}</span>
            <strong>{project.updated}</strong>
          </div>
          <div>
            <span>{copy.labels.next}</span>
            <strong>{project.next[lang]}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}
