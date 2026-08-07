export const SITE_COPY = {
  en: {
    nav: {
      work: 'Work',
      programs: 'Programs',
      live: 'Live',
      lab: 'Signal Lab',
      about: 'About',
      ask: 'Ask Fanni',
      signIn: 'Sign in'
    },
    hero: {
      eyebrow: 'Fanni · Kupuri Media · Mexico',
      headline: 'Your business is already telling you what to do next.',
      statement: 'Fanni listens across customers, communities, operations, and public signals—then verifies what matters and turns it into approved action.',
      primary: 'Show me what Fanni sees',
      secondary: 'See Fanni’s live work'
    },
    proof: [
      '3 executable proof demos',
      '39 production tests passing',
      '0 unapproved external actions',
      'Bilingual · local + cloud'
    ],
    sections: {
      programs: 'Three problems worth solving',
      programsIntro: 'Not a list of AI features. Three operating programs tied to demand, reputation, and owner capacity.',
      work: 'Work in public',
      workIntro: 'See what is live, what is still a lab, what evidence exists, and what Fanni is doing next.',
      live: 'Fanni’s live desk',
      liveIntro: 'Current assignments, blockers, approvals, and the next verified milestone.',
      lab: 'Signal Lab',
      labIntro: 'Recurring problems Fanni is monitoring and converting into testable paid offers.',
      offers: 'Start with one painful problem',
      offersIntro: 'The first engagement is intentionally bounded. Fanni proves value before the system expands.',
      sovereignty: 'One intelligence. Your rules.',
      sovereigntyBody: 'Fanni can run locally, in the cloud, or in a hybrid setup. Every action keeps evidence, permissions, approval state, and a return point.',
      close: 'What is costing your business time, trust, or revenue?'
    },
    labels: {
      active: 'Active',
      research: 'Research',
      shipped: 'Shipped',
      lab: 'Lab',
      pilot: 'Pilot',
      internal: 'Internal',
      private: 'Private',
      caseStudy: 'Case study',
      next: 'Next',
      evidence: 'Evidence',
      outcome: 'Outcome',
      updated: 'Updated',
      from: 'From',
      start: 'Start this program',
      details: 'View project',
      read: 'Read signal',
      approve: 'Requires approval',
      checkout: 'Start paid diagnostic'
    }
  },
  es: {
    nav: {
      work: 'Trabajo',
      programs: 'Programas',
      live: 'En vivo',
      lab: 'Laboratorio',
      about: 'Acerca de',
      ask: 'Pregúntale a Fanni',
      signIn: 'Iniciar sesión'
    },
    hero: {
      eyebrow: 'Fanni · Kupuri Media · México',
      headline: 'Tu negocio ya te está diciendo qué hacer después.',
      statement: 'Fanni escucha a clientes, comunidades, operaciones y señales públicas; verifica lo que importa y lo convierte en acción aprobada.',
      primary: 'Muéstrame lo que Fanni ve',
      secondary: 'Ver el trabajo de Fanni'
    },
    proof: [
      '3 demostraciones ejecutables',
      '39 pruebas de producción aprobadas',
      '0 acciones externas sin aprobación',
      'Bilingüe · local + nube'
    ],
    sections: {
      programs: 'Tres problemas que vale la pena resolver',
      programsIntro: 'No es una lista de funciones de IA. Son tres programas operativos ligados a demanda, reputación y capacidad del dueño.',
      work: 'Construyendo en público',
      workIntro: 'Mira qué está activo, qué sigue siendo laboratorio, qué evidencia existe y qué hará Fanni después.',
      live: 'El escritorio de Fanni',
      liveIntro: 'Asignaciones actuales, bloqueos, aprobaciones y el siguiente avance verificado.',
      lab: 'Laboratorio de Señales',
      labIntro: 'Problemas recurrentes que Fanni monitorea y convierte en ofertas pagadas comprobables.',
      offers: 'Empieza con un problema doloroso',
      offersIntro: 'El primer trabajo tiene límites claros. Fanni demuestra valor antes de ampliar el sistema.',
      sovereignty: 'Una inteligencia. Tus reglas.',
      sovereigntyBody: 'Fanni puede operar localmente, en la nube o de forma híbrida. Cada acción conserva evidencia, permisos, aprobación y un punto de retorno.',
      close: '¿Qué le está costando tiempo, confianza o ingresos a tu negocio?'
    },
    labels: {
      active: 'Activo',
      research: 'Investigación',
      shipped: 'Publicado',
      lab: 'Laboratorio',
      pilot: 'Piloto',
      internal: 'Interno',
      private: 'Privado',
      caseStudy: 'Caso de estudio',
      next: 'Siguiente',
      evidence: 'Evidencia',
      outcome: 'Resultado',
      updated: 'Actualizado',
      from: 'Desde',
      start: 'Iniciar este programa',
      details: 'Ver proyecto',
      read: 'Leer señal',
      approve: 'Requiere aprobación',
      checkout: 'Iniciar diagnóstico pagado'
    }
  }
};

export const PROGRAMS = [
  {
    slug: 'demand',
    number: '01',
    name: { en: 'Fanni Demand', es: 'Fanni Demanda' },
    promise: {
      en: 'Find the problems people are already trying to pay someone to solve.',
      es: 'Encuentra los problemas que la gente ya está intentando pagar para resolver.'
    },
    pain: {
      en: 'Businesses publish content and buy tools without knowing which customer problem deserves attention.',
      es: 'Los negocios publican contenido y compran herramientas sin saber qué problema del cliente merece atención.'
    },
    outcomes: {
      en: ['Repeated customer problems', 'Offer opportunities', 'Local demand alerts', 'Evidence-backed content briefs'],
      es: ['Problemas repetidos del cliente', 'Oportunidades de oferta', 'Alertas de demanda local', 'Briefs de contenido con evidencia']
    },
    accent: 'chartreuse',
    offer: 'problem-scan'
  },
  {
    slug: 'reputation',
    number: '02',
    name: { en: 'Fanni Reputation', es: 'Fanni Reputación' },
    promise: {
      en: 'Know what is changing before a weak signal becomes an expensive problem.',
      es: 'Entiende qué está cambiando antes de que una señal débil se convierta en un problema costoso.'
    },
    pain: {
      en: 'Teams see mentions, complaints, incidents, and news in separate systems and react too late.',
      es: 'Los equipos ven menciones, quejas, incidentes y noticias en sistemas separados y reaccionan tarde.'
    },
    outcomes: {
      en: ['Verified narratives', 'Regional impact', 'Crisis routing', 'Approved response drafts'],
      es: ['Narrativas verificadas', 'Impacto regional', 'Enrutamiento de crisis', 'Borradores de respuesta aprobables']
    },
    accent: 'rose',
    offer: 'business-operator'
  },
  {
    slug: 'operations',
    number: '03',
    name: { en: 'Fanni Operations', es: 'Fanni Operaciones' },
    promise: {
      en: 'Remove the recurring work that keeps owners trapped inside the business.',
      es: 'Elimina el trabajo repetitivo que mantiene a los dueños atrapados dentro del negocio.'
    },
    pain: {
      en: 'Too many messages, approvals, reports, clients, and applications compete for one person’s attention.',
      es: 'Demasiados mensajes, aprobaciones, reportes, clientes y aplicaciones compiten por la atención de una sola persona.'
    },
    outcomes: {
      en: ['WhatsApp intake', 'Approval workflows', 'Client follow-up', 'Measured owner relief'],
      es: ['Recepción por WhatsApp', 'Flujos de aprobación', 'Seguimiento a clientes', 'Alivio medido para el dueño']
    },
    accent: 'orchid',
    offer: 'owner-relief'
  }
];

export const PROJECTS = [
  {
    slug: 'fanni-pulso',
    status: 'active',
    type: 'internal',
    client: 'Kupuri Media',
    title: 'Fanni Pulso',
    location: 'Mexico · LATAM',
    transformation: {
      en: 'Turning Fanni into a WhatsApp-first signal operating system for business and community decisions.',
      es: 'Convirtiendo a Fanni en un sistema operativo de señales por WhatsApp para decisiones empresariales y comunitarias.'
    },
    problem: {
      en: 'Social listening tools stop at dashboards while business context, approvals, and action live somewhere else.',
      es: 'Las herramientas de escucha social terminan en tableros, mientras el contexto, las aprobaciones y la acción viven en otros lugares.'
    },
    assignment: {
      en: 'Build one governed intelligence that listens, verifies, recommends, acts, measures, and learns.',
      es: 'Construir una inteligencia gobernada que escuche, verifique, recomiende, actúe, mida y aprenda.'
    },
    evidence: ['39 automated tests passing', 'World Monitor licensing boundary', '3 deterministic proof demos'],
    result: {
      en: 'Architecture and proof demos merged to main; live-source and WhatsApp credentials remain the next implementation boundary.',
      es: 'La arquitectura y las demostraciones están integradas; las fuentes en vivo y credenciales de WhatsApp son el siguiente límite.'
    },
    stage: 'Orchestration foundation',
    updated: '2026-08-06',
    next: {
      en: 'Connect the first live public-signal adapter and publish a coverage ledger.',
      es: 'Conectar el primer adaptador de señales públicas y publicar un registro de cobertura.'
    },
    accent: 'merlot'
  },
  {
    slug: 'puerto-vallarta-tourism-pulse',
    status: 'active',
    type: 'lab',
    client: 'Public proof lab',
    title: 'Puerto Vallarta Tourism Pulse',
    location: 'Puerto Vallarta · Bahía de Banderas',
    transformation: {
      en: 'From scattered traveler questions to one verified bilingual guest advisory.',
      es: 'De preguntas dispersas de viajeros a un aviso bilingüe verificado para huéspedes.'
    },
    problem: {
      en: 'Hotels and tour operators discover traveler concerns only after support volume rises or bookings are affected.',
      es: 'Hoteles y operadores descubren preocupaciones de viajeros después de que aumentan las consultas o se afectan las reservas.'
    },
    assignment: {
      en: 'Correlate public travel signals with authorized guest questions and recommend one useful response.',
      es: 'Correlacionar señales públicas de viaje con preguntas autorizadas de huéspedes y recomendar una respuesta útil.'
    },
    evidence: ['Synthetic airport-transfer signal set', 'Coverage blind spots disclosed', 'Approval required before send'],
    result: {
      en: 'The proof demo produces an evidence-aware advisory without claiming unavailable platform coverage.',
      es: 'La demostración produce un aviso con evidencia sin afirmar cobertura de plataformas no disponibles.'
    },
    stage: 'Live-source adapter',
    updated: '2026-08-06',
    next: {
      en: 'Connect weather, airport, local news, and one authorized tourism workspace.',
      es: 'Conectar clima, aeropuerto, noticias locales y un espacio turístico autorizado.'
    },
    accent: 'chartreuse'
  },
  {
    slug: 'enterprise-reputation-nerve-center',
    status: 'active',
    type: 'lab',
    client: 'Private enterprise pattern',
    title: 'Mexican Enterprise Reputation Nerve Center',
    location: 'Mexico City · National',
    transformation: {
      en: 'From noisy mentions to a verified regional incident and the correct internal owner.',
      es: 'De menciones ruidosas a un incidente regional verificado y el responsable interno correcto.'
    },
    problem: {
      en: 'A repeated story can look like a national crisis even when the underlying event is regional or unverified.',
      es: 'Una historia repetida puede parecer una crisis nacional aunque el evento sea regional o no verificado.'
    },
    assignment: {
      en: 'Deduplicate narratives, separate allegation from fact, map affected regions, and prepare an approval-ready response.',
      es: 'Deduplicar narrativas, separar alegatos de hechos, mapear regiones afectadas y preparar una respuesta aprobable.'
    },
    evidence: ['Regional degradation distinguished', 'Nationwide claim rejected', 'Communications routing prepared'],
    result: {
      en: 'The proof demo blocks publication until evidence and approval requirements are satisfied.',
      es: 'La demostración bloquea la publicación hasta cumplir evidencia y aprobación.'
    },
    stage: 'Enterprise source contract',
    updated: '2026-08-06',
    next: {
      en: 'Define the first licensed media provider and enterprise escalation map.',
      es: 'Definir el primer proveedor de medios licenciado y el mapa de escalamiento empresarial.'
    },
    accent: 'rose'
  },
  {
    slug: 'barrio-shield',
    status: 'active',
    type: 'lab',
    client: 'Community proof lab',
    title: 'Barrio Shield · Escudo Comunitario',
    location: 'Jalisco',
    transformation: {
      en: 'From community rumor to a verified public-service instruction with uncertainty kept visible.',
      es: 'De rumor comunitario a una instrucción de servicio público verificada, manteniendo visible la incertidumbre.'
    },
    problem: {
      en: 'Families receive urgent claims through WhatsApp without knowing what is confirmed, local, outdated, or false.',
      es: 'Las familias reciben alertas urgentes por WhatsApp sin saber qué está confirmado, localizado, desactualizado o falso.'
    },
    assignment: {
      en: 'Verify service interruptions, separate rumors, route resources, and require approval before mass communication.',
      es: 'Verificar interrupciones, separar rumores, dirigir recursos y requerir aprobación antes de comunicación masiva.'
    },
    evidence: ['Water interruption corroborated', 'One-source road closure suppressed', 'Human approval preserved'],
    result: {
      en: 'The proof demo prevents a one-source road claim from becoming the leading verified alert.',
      es: 'La demostración evita que un reporte vial de una sola fuente se convierta en la alerta verificada principal.'
    },
    stage: 'Community source governance',
    updated: '2026-08-06',
    next: {
      en: 'Define consent, emergency-source, and municipal partner requirements.',
      es: 'Definir requisitos de consentimiento, fuentes de emergencia y socios municipales.'
    },
    accent: 'orchid'
  },
  {
    slug: 'kupuri-social-operations',
    status: 'active',
    type: 'internal',
    client: 'Kupuri Media',
    title: 'Kupuri Social Operations',
    location: 'Puerto Vallarta · Mexico City · Seattle corridor',
    transformation: {
      en: 'From scattered social tasks to a client-isolated workflow with approvals, publishing, reconciliation, and measurement.',
      es: 'De tareas sociales dispersas a un flujo aislado por cliente con aprobaciones, publicación, conciliación y medición.'
    },
    problem: {
      en: 'Multi-client agencies risk account confusion, generic content, and unverified completion claims.',
      es: 'Las agencias con múltiples clientes arriesgan confusión de cuentas, contenido genérico y afirmaciones no verificadas.'
    },
    assignment: {
      en: 'Operate one isolated social profile per workspace through Zernio, with checkpoints before every consequential write.',
      es: 'Operar un perfil social aislado por espacio mediante Zernio, con puntos de retorno antes de cada acción importante.'
    },
    evidence: ['Workspace isolation tests', 'Approval and checkpoint gates', 'Publish reconciliation contract'],
    result: {
      en: 'The governed workflow is merged; real Zernio credentials and client accounts are not yet configured.',
      es: 'El flujo gobernado está integrado; las credenciales reales de Zernio y cuentas de clientes aún no están configuradas.'
    },
    stage: 'Credentialed pilot',
    updated: '2026-08-06',
    next: {
      en: 'Authorize the first internal profile and verify one scheduled post end to end.',
      es: 'Autorizar el primer perfil interno y verificar una publicación programada de extremo a extremo.'
    },
    accent: 'paper'
  },
  {
    slug: 'whatsapp-continuity-guardian',
    status: 'research',
    type: 'pilot',
    client: 'Opportunity research',
    title: 'WhatsApp Continuity Guardian',
    location: 'Mexico · LATAM',
    transformation: {
      en: 'From one fragile communication channel to a governed continuity plan with approved fallback routes.',
      es: 'De un canal frágil a un plan de continuidad gobernado con rutas alternativas aprobadas.'
    },
    problem: {
      en: 'For many small businesses, a WhatsApp restriction or outage can stop sales, support, and coordination at once.',
      es: 'Para muchos negocios, una restricción o falla de WhatsApp puede detener ventas, soporte y coordinación al mismo tiempo.'
    },
    assignment: {
      en: 'Monitor channel health, preserve consent and template discipline, and prepare alternate business routes.',
      es: 'Monitorear la salud del canal, preservar consentimiento y disciplina de plantillas, y preparar rutas alternas.'
    },
    evidence: ['Recurring public owner complaints', 'Continuity risk documented', 'Fallback policy required'],
    result: {
      en: 'Research has defined the paid problem; no production monitoring claim is made yet.',
      es: 'La investigación definió el problema pagado; aún no se afirma monitoreo de producción.'
    },
    stage: 'Offer validation',
    updated: '2026-08-06',
    next: {
      en: 'Interview five WhatsApp-dependent businesses and price the continuity diagnostic.',
      es: 'Entrevistar cinco negocios dependientes de WhatsApp y poner precio al diagnóstico de continuidad.'
    },
    accent: 'warning'
  }
];

export const SIGNAL_LAB = [
  {
    slug: 'social-content-without-customer-truth',
    status: 'research',
    theme: { en: 'Marketing overload', es: 'Sobrecarga de marketing' },
    title: {
      en: 'Small businesses do not need more generic posts. They need a system that turns real work into demand.',
      es: 'Los pequeños negocios no necesitan más publicaciones genéricas. Necesitan convertir trabajo real en demanda.'
    },
    evidence: {
      en: 'Public small-business discussions repeatedly describe social-media overwhelm, generic outsourced content, and unclear business results.',
      es: 'Conversaciones públicas de pequeños negocios describen repetidamente saturación, contenido externo genérico y resultados poco claros.'
    },
    offer: { en: 'Document, Don’t Perform', es: 'Documenta, no actúes' },
    source: 'Public Reddit research',
    updated: '2026-08-06'
  },
  {
    slug: 'whatsapp-single-point-of-failure',
    status: 'research',
    theme: { en: 'Business continuity', es: 'Continuidad del negocio' },
    title: {
      en: 'WhatsApp is an operating system for many businesses—and a dangerous single point of failure.',
      es: 'WhatsApp es el sistema operativo de muchos negocios y también un punto único de falla peligroso.'
    },
    evidence: {
      en: 'Public business-owner reports describe restrictions, support delays, and revenue exposure when the channel becomes unavailable.',
      es: 'Reportes públicos de dueños describen restricciones, soporte tardío y exposición de ingresos cuando el canal no está disponible.'
    },
    offer: { en: 'WhatsApp Continuity Guardian', es: 'Guardián de Continuidad de WhatsApp' },
    source: 'Public Reddit research',
    updated: '2026-08-06'
  },
  {
    slug: 'owner-attention-collapse',
    status: 'research',
    theme: { en: 'Owner capacity', es: 'Capacidad del dueño' },
    title: {
      en: 'The owner is not the workflow. The business needs a visible system for what only the owner should decide.',
      es: 'El dueño no es el flujo de trabajo. El negocio necesita un sistema visible para decidir qué solo debe resolver el dueño.'
    },
    evidence: {
      en: 'Owners repeatedly describe too many projects, messages, approvals, and responsibilities competing for one person.',
      es: 'Los dueños describen repetidamente demasiados proyectos, mensajes, aprobaciones y responsabilidades para una sola persona.'
    },
    offer: { en: 'Owner Relief System', es: 'Sistema de Alivio para el Dueño' },
    source: 'Public Reddit research',
    updated: '2026-08-06'
  }
];

export const OFFERS = [
  {
    slug: 'problem-scan',
    name: { en: 'Fanni Problem Scan', es: 'Diagnóstico de Problema Fanni' },
    price: 'MXN 1,490',
    cadence: { en: 'one-time', es: 'una sola vez' },
    promise: {
      en: 'One business. One painful problem. One evidence-backed opportunity brief and 30-day action plan.',
      es: 'Un negocio. Un problema doloroso. Un brief con evidencia y un plan de acción de 30 días.'
    },
    includes: {
      en: ['Customer and market signal scan', 'Problem and urgency ranking', 'One offer or workflow recommendation', 'Evidence and blind spots'],
      es: ['Escaneo de señales de clientes y mercado', 'Clasificación de problema y urgencia', 'Una recomendación de oferta o flujo', 'Evidencia y puntos ciegos']
    },
    checkoutProduct: 'problem_scan'
  },
  {
    slug: 'demand-operator',
    name: { en: 'Fanni Demand Operator', es: 'Operadora de Demanda Fanni' },
    price: 'MXN 4,900 / month',
    setup: 'MXN 7,500 setup',
    cadence: { en: 'monthly', es: 'mensual' },
    promise: {
      en: 'Continuous customer-problem monitoring, opportunity alerts, offer recommendations, and evidence-backed content direction.',
      es: 'Monitoreo continuo de problemas del cliente, alertas de oportunidad, recomendaciones de oferta y dirección de contenido con evidencia.'
    },
    includes: {
      en: ['Watchlist', 'Monthly opportunity brief', 'Content and offer recommendations', 'One connected business channel'],
      es: ['Lista de monitoreo', 'Brief mensual de oportunidades', 'Recomendaciones de contenido y oferta', 'Un canal empresarial conectado']
    },
    checkoutProduct: 'demand_operator'
  },
  {
    slug: 'owner-relief',
    name: { en: 'Fanni Business Operator', es: 'Operadora Empresarial Fanni' },
    price: 'MXN 12,500 / month',
    setup: 'MXN 18,000 setup',
    cadence: { en: 'monthly', es: 'mensual' },
    promise: {
      en: 'WhatsApp intake, approvals, follow-up, social operations, reporting, and a measured owner-relief ledger.',
      es: 'Recepción por WhatsApp, aprobaciones, seguimiento, operaciones sociales, reportes y medición del alivio del dueño.'
    },
    includes: {
      en: ['WhatsApp-first requests', 'Approval and return-point system', 'Connected application workflows', 'Monthly value report'],
      es: ['Solicitudes por WhatsApp', 'Sistema de aprobación y retorno', 'Flujos con aplicaciones conectadas', 'Reporte mensual de valor']
    },
    checkoutProduct: 'business_operator'
  },
  {
    slug: 'enterprise',
    name: { en: 'Enterprise Nerve Center', es: 'Centro Nervioso Empresarial' },
    price: { en: 'Custom', es: 'Personalizado' },
    cadence: { en: 'annual or pilot', es: 'anual o piloto' },
    promise: {
      en: 'Private, multi-team signal intelligence with governed escalation, local/cloud deployment, auditability, and custom sources.',
      es: 'Inteligencia privada multi-equipo con escalamiento gobernado, operación local/nube, auditoría y fuentes personalizadas.'
    },
    includes: {
      en: ['Regional reputation intelligence', 'Private deployment options', 'Custom connectors and policies', 'Service-level agreement'],
      es: ['Inteligencia regional de reputación', 'Opciones de despliegue privado', 'Conectores y políticas personalizadas', 'Acuerdo de nivel de servicio']
    },
    checkoutProduct: 'enterprise_consultation'
  }
];

export function findProgram(slug) {
  return PROGRAMS.find((program) => program.slug === slug) || null;
}

export function findProject(slug) {
  return PROJECTS.find((project) => project.slug === slug) || null;
}

export function findSignal(slug) {
  return SIGNAL_LAB.find((signal) => signal.slug === slug) || null;
}

export function findOffer(slug) {
  return OFFERS.find((offer) => offer.slug === slug) || null;
}
