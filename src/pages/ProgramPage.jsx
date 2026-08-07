import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { findOffer, findProgram, PROJECTS, SITE_COPY } from '../content/publicSite.js';

/** @param {{ slug: string, onNavigate: (route: string) => void }} props */
export function ProgramPage({ slug, onNavigate }) {
  const { lang, toggle } = useLanguage();
  const copy = SITE_COPY[lang];
  const program = findProgram(slug);

  if (!program) {
    return (
      <main className="public-detail public-detail--missing">
        <h1>{lang === 'en' ? 'Program not found' : 'Programa no encontrado'}</h1>
        <button type="button" onClick={() => onNavigate('/')}>{lang === 'en' ? 'Return home' : 'Volver al inicio'}</button>
      </main>
    );
  }

  const offer = findOffer(program.offer);
  const related = PROJECTS.filter(project => {
    if (slug === 'demand') return ['puerto-vallarta-tourism-pulse', 'whatsapp-continuity-guardian'].includes(project.slug);
    if (slug === 'reputation') return ['enterprise-reputation-nerve-center', 'barrio-shield'].includes(project.slug);
    return ['fanni-pulso', 'kupuri-social-operations'].includes(project.slug);
  });

  return (
    <div className={`public-detail public-detail--${program.accent}`}>
      <header className="public-detail__nav">
        <button type="button" onClick={() => onNavigate('/')}><ArrowLeft size={18} /> FANNI</button>
        <button type="button" onClick={toggle}>{lang === 'en' ? 'ES' : 'EN'}</button>
      </header>

      <main>
        <section className="public-detail__hero">
          <p>{program.number} · {program.name[lang]}</p>
          <h1>{program.promise[lang]}</h1>
          <p className="public-detail__lede">{program.pain[lang]}</p>
          <button type="button" onClick={() => onNavigate(`/checkout/${offer?.slug || 'problem-scan'}`)}>
            {copy.labels.start} <ArrowUpRight size={20} />
          </button>
        </section>

        <section className="public-detail__split">
          <div>
            <p className="public-detail__kicker">{lang === 'en' ? 'Business outcome' : 'Resultado de negocio'}</p>
            <h2>{lang === 'en' ? 'Fanni does not sell activity. She has to change an operating result.' : 'Fanni no vende actividad. Tiene que cambiar un resultado operativo.'}</h2>
          </div>
          <ul>
            {program.outcomes[lang].map(outcome => <li key={outcome}><Check size={18} /> {outcome}</li>)}
          </ul>
        </section>

        <section className="public-detail__process">
          <p className="public-detail__kicker">{lang === 'en' ? 'How the program works' : 'Cómo funciona el programa'}</p>
          <div>
            <article><span>01</span><h3>{lang === 'en' ? 'Bound the problem' : 'Delimitar el problema'}</h3><p>{lang === 'en' ? 'One business objective, one workspace, and a clear evidence requirement.' : 'Un objetivo de negocio, un espacio y un requisito claro de evidencia.'}</p></article>
            <article><span>02</span><h3>{lang === 'en' ? 'Listen and verify' : 'Escuchar y verificar'}</h3><p>{lang === 'en' ? 'Fanni checks approved sources, separates facts from inference, and shows blind spots.' : 'Fanni revisa fuentes aprobadas, separa hechos de inferencias y muestra puntos ciegos.'}</p></article>
            <article><span>03</span><h3>{lang === 'en' ? 'Recommend one move' : 'Recomendar un movimiento'}</h3><p>{lang === 'en' ? 'The recommendation must be useful, reversible, and tied to the stated outcome.' : 'La recomendación debe ser útil, reversible y ligada al resultado definido.'}</p></article>
            <article><span>04</span><h3>{lang === 'en' ? 'Approve, act, measure' : 'Aprobar, actuar y medir'}</h3><p>{lang === 'en' ? 'Consequential actions wait for approval, preserve a return point, and record the result.' : 'Las acciones importantes esperan aprobación, guardan un punto de retorno y registran el resultado.'}</p></article>
          </div>
        </section>

        <section className="public-detail__related">
          <p className="public-detail__kicker">{lang === 'en' ? 'Relevant work' : 'Trabajo relacionado'}</p>
          <div>
            {related.map(project => (
              <button type="button" key={project.slug} onClick={() => onNavigate(`/work/${project.slug}`)}>
                <span>{project.type}</span>
                <strong>{project.title}</strong>
                <p>{project.transformation[lang]}</p>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
        </section>

        {offer && (
          <section className="public-detail__offer">
            <div>
              <p className="public-detail__kicker">{lang === 'en' ? 'Start bounded' : 'Empieza con límites'}</p>
              <h2>{offer.name[lang]}</h2>
              <p>{offer.promise[lang]}</p>
            </div>
            <div>
              <strong>{typeof offer.price === 'string' ? offer.price : offer.price[lang]}</strong>
              <span>{offer.cadence[lang]}</span>
              <button type="button" onClick={() => onNavigate(`/checkout/${offer.slug}`)}>{copy.labels.checkout} <ArrowUpRight size={19} /></button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
