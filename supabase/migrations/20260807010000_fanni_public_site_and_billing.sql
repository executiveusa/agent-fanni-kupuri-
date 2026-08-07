begin;

create schema if not exists fanni;

grant usage on schema fanni to anon, authenticated, service_role;

create or replace function fanni.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = fanni, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists fanni.public_programs (
  slug text primary key,
  position integer not null check (position > 0),
  name_en text not null,
  name_es text not null,
  promise_en text not null,
  promise_es text not null,
  pain_en text not null,
  pain_es text not null,
  outcomes_en jsonb not null default '[]'::jsonb check (jsonb_typeof(outcomes_en) = 'array'),
  outcomes_es jsonb not null default '[]'::jsonb check (jsonb_typeof(outcomes_es) = 'array'),
  accent text not null default 'paper',
  offer_slug text,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs) = 'array'),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_program_requires_approval check (
    publication_status <> 'published' or (approved_at is not null and last_verified_at is not null)
  )
);

create table if not exists fanni.public_projects (
  slug text primary key,
  status text not null check (status in ('active', 'research', 'shipped', 'paused', 'complete')),
  project_type text not null check (project_type in ('case-study', 'active-assignment', 'pilot', 'lab', 'internal', 'private')),
  client_label text not null,
  title text not null,
  location text not null,
  transformation_en text not null,
  transformation_es text not null,
  problem_en text not null,
  problem_es text not null,
  assignment_en text not null,
  assignment_es text not null,
  result_en text not null,
  result_es text not null,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  stage text not null,
  next_en text not null,
  next_es text not null,
  accent text not null default 'paper',
  visibility text not null default 'public' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  client_permission_status text not null default 'not_required' check (client_permission_status in ('not_required', 'pending', 'approved', 'denied')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_project_requires_verification check (
    publication_status <> 'published' or (
      approved_at is not null
      and last_verified_at is not null
      and (project_type in ('lab', 'internal') or client_permission_status = 'approved')
    )
  )
);

create table if not exists fanni.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_slug text not null references fanni.public_projects(slug) on delete cascade,
  update_status text not null check (update_status in ('planned', 'active', 'blocked', 'review', 'complete')),
  title_en text not null,
  title_es text not null,
  body_en text not null,
  body_es text not null,
  blocker_en text,
  blocker_es text,
  next_en text not null,
  next_es text not null,
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs) = 'array'),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  published_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_update_requires_approval check (
    publication_status <> 'published' or (approved_at is not null and published_at is not null and last_verified_at is not null)
  )
);

create table if not exists fanni.public_case_studies (
  slug text primary key,
  project_slug text not null unique references fanni.public_projects(slug) on delete restrict,
  headline_en text not null,
  headline_es text not null,
  narrative_en text not null,
  narrative_es text not null,
  outcome_summary_en text not null,
  outcome_summary_es text not null,
  methodology jsonb not null default '{}'::jsonb check (jsonb_typeof(methodology) = 'object'),
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs) = 'array'),
  visibility text not null default 'private' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  client_permission_status text not null default 'pending' check (client_permission_status in ('pending', 'approved', 'denied')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_case_study_requires_permission check (
    publication_status <> 'published' or (
      visibility in ('public', 'anonymized')
      and client_permission_status = 'approved'
      and approved_at is not null
      and last_verified_at is not null
      and jsonb_array_length(evidence_refs) > 0
    )
  )
);

create table if not exists fanni.public_case_study_metrics (
  id bigint generated always as identity primary key,
  case_study_slug text not null references fanni.public_case_studies(slug) on delete cascade,
  metric_key text not null,
  metric_label_en text not null,
  metric_label_es text not null,
  metric_value numeric,
  metric_unit text,
  measurement_type text not null check (measurement_type in ('measured', 'estimated', 'unknown')),
  methodology text,
  evidence_ref text,
  measured_at timestamptz,
  created_at timestamptz not null default now(),
  unique (case_study_slug, metric_key)
);

create table if not exists fanni.signal_lab_entries (
  slug text primary key,
  status text not null check (status in ('research', 'testing', 'validated', 'retired')),
  theme_en text not null,
  theme_es text not null,
  title_en text not null,
  title_es text not null,
  evidence_en text not null,
  evidence_es text not null,
  offer_en text not null,
  offer_es text not null,
  source_class text not null,
  coverage_limit_en text not null,
  coverage_limit_es text not null,
  evidence_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence_refs) = 'array'),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_signal_requires_coverage check (
    publication_status <> 'published' or (
      approved_at is not null
      and last_verified_at is not null
      and length(coverage_limit_en) > 0
      and length(coverage_limit_es) > 0
    )
  )
);

create table if not exists fanni.public_evidence (
  id uuid primary key default gen_random_uuid(),
  object_type text not null check (object_type in ('program', 'project', 'project_update', 'case_study', 'signal', 'offer')),
  object_slug text not null,
  evidence_type text not null check (evidence_type in ('repository', 'deployment', 'test', 'document', 'public_source', 'measurement', 'approval')),
  label text not null,
  source_ref text not null,
  source_hash text,
  summary_redacted text,
  measurement_type text check (measurement_type is null or measurement_type in ('measured', 'estimated', 'unknown')),
  verified boolean not null default false,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'anonymized')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_evidence_requires_verification check (
    publication_status <> 'published' or (verified = true and verified_at is not null)
  )
);

create table if not exists fanni.commercial_offers (
  slug text primary key,
  product_key text not null unique,
  name_en text not null,
  name_es text not null,
  promise_en text not null,
  promise_es text not null,
  price_display text not null,
  cadence_en text not null,
  cadence_es text not null,
  includes_en jsonb not null default '[]'::jsonb check (jsonb_typeof(includes_en) = 'array'),
  includes_es jsonb not null default '[]'::jsonb check (jsonb_typeof(includes_es) = 'array'),
  billing_mode text not null check (billing_mode in ('payment', 'subscription', 'consultation')),
  active boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'review', 'published', 'archived')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_offer_requires_approval check (
    publication_status <> 'published' or (approved_at is not null and last_verified_at is not null)
  )
);

create table if not exists fanni.lead_diagnostics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references fanni.organizations(id) on delete set null,
  workspace_id uuid references fanni.workspaces(id) on delete set null,
  source text not null default 'public_site',
  language text not null default 'es' check (language in ('en', 'es')),
  contact_ref_hash text,
  business_name text,
  problem_summary_redacted text not null,
  selected_program text,
  status text not null default 'new' check (status in ('new', 'qualified', 'scheduled', 'paid', 'closed', 'discarded')),
  consent_record jsonb not null default '{}'::jsonb check (jsonb_typeof(consent_record) = 'object'),
  metadata_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata_redacted) = 'object'),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fanni.billing_checkout_requests (
  request_id uuid primary key,
  provider text not null check (provider in ('stripe', 'creem')),
  provider_checkout_id text not null,
  product_key text not null,
  mode text not null check (mode in ('payment', 'subscription')),
  language text not null default 'es' check (language in ('en', 'es')),
  status text not null default 'created' check (status in ('created', 'completed', 'expired', 'cancelled', 'failed')),
  customer_ref text,
  organization_id uuid references fanni.organizations(id) on delete set null,
  workspace_id uuid references fanni.workspaces(id) on delete set null,
  metadata_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata_redacted) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_checkout_id)
);

create table if not exists fanni.billing_events (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('stripe', 'creem')),
  event_id text not null,
  event_type text not null,
  request_id uuid references fanni.billing_checkout_requests(request_id) on delete set null,
  product_key text,
  customer_ref text,
  signature_valid boolean not null default false,
  processing_status text not null default 'accepted' check (processing_status in ('accepted', 'processed', 'ignored', 'failed')),
  payload_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(payload_redacted) = 'object'),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(error_redacted) = 'object'),
  unique (provider, event_id)
);

create table if not exists fanni.billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'creem')),
  customer_ref text not null,
  product_key text not null,
  provider_subscription_id text,
  organization_id uuid references fanni.organizations(id) on delete set null,
  workspace_id uuid references fanni.workspaces(id) on delete set null,
  status text not null check (status in ('active', 'past_due', 'inactive')),
  source_event_id text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  metadata_redacted jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata_redacted) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, customer_ref, product_key)
);

create index if not exists public_projects_publication_idx on fanni.public_projects (publication_status, visibility, status, updated_at desc);
create index if not exists project_updates_publication_idx on fanni.project_updates (project_slug, publication_status, published_at desc);
create index if not exists signal_lab_publication_idx on fanni.signal_lab_entries (publication_status, visibility, status, updated_at desc);
create index if not exists public_evidence_object_idx on fanni.public_evidence (object_type, object_slug, publication_status);
create index if not exists billing_events_customer_idx on fanni.billing_events (provider, customer_ref, received_at desc);
create index if not exists billing_entitlements_status_idx on fanni.billing_entitlements (status, product_key, updated_at desc);
create index if not exists lead_diagnostics_status_idx on fanni.lead_diagnostics (status, created_at desc);

drop trigger if exists set_public_programs_updated_at on fanni.public_programs;
create trigger set_public_programs_updated_at before update on fanni.public_programs for each row execute function fanni.set_updated_at();
drop trigger if exists set_public_projects_updated_at on fanni.public_projects;
create trigger set_public_projects_updated_at before update on fanni.public_projects for each row execute function fanni.set_updated_at();
drop trigger if exists set_project_updates_updated_at on fanni.project_updates;
create trigger set_project_updates_updated_at before update on fanni.project_updates for each row execute function fanni.set_updated_at();
drop trigger if exists set_public_case_studies_updated_at on fanni.public_case_studies;
create trigger set_public_case_studies_updated_at before update on fanni.public_case_studies for each row execute function fanni.set_updated_at();
drop trigger if exists set_signal_lab_entries_updated_at on fanni.signal_lab_entries;
create trigger set_signal_lab_entries_updated_at before update on fanni.signal_lab_entries for each row execute function fanni.set_updated_at();
drop trigger if exists set_public_evidence_updated_at on fanni.public_evidence;
create trigger set_public_evidence_updated_at before update on fanni.public_evidence for each row execute function fanni.set_updated_at();
drop trigger if exists set_commercial_offers_updated_at on fanni.commercial_offers;
create trigger set_commercial_offers_updated_at before update on fanni.commercial_offers for each row execute function fanni.set_updated_at();
drop trigger if exists set_lead_diagnostics_updated_at on fanni.lead_diagnostics;
create trigger set_lead_diagnostics_updated_at before update on fanni.lead_diagnostics for each row execute function fanni.set_updated_at();
drop trigger if exists set_billing_checkout_requests_updated_at on fanni.billing_checkout_requests;
create trigger set_billing_checkout_requests_updated_at before update on fanni.billing_checkout_requests for each row execute function fanni.set_updated_at();
drop trigger if exists set_billing_entitlements_updated_at on fanni.billing_entitlements;
create trigger set_billing_entitlements_updated_at before update on fanni.billing_entitlements for each row execute function fanni.set_updated_at();

alter table fanni.public_programs enable row level security;
alter table fanni.public_projects enable row level security;
alter table fanni.project_updates enable row level security;
alter table fanni.public_case_studies enable row level security;
alter table fanni.public_case_study_metrics enable row level security;
alter table fanni.signal_lab_entries enable row level security;
alter table fanni.public_evidence enable row level security;
alter table fanni.commercial_offers enable row level security;
alter table fanni.lead_diagnostics enable row level security;
alter table fanni.billing_checkout_requests enable row level security;
alter table fanni.billing_events enable row level security;
alter table fanni.billing_entitlements enable row level security;

revoke all on fanni.lead_diagnostics from anon, authenticated;
revoke all on fanni.billing_checkout_requests from anon, authenticated;
revoke all on fanni.billing_events from anon, authenticated;
revoke all on fanni.billing_entitlements from anon, authenticated;

grant select on fanni.public_programs to anon, authenticated;
grant select on fanni.public_projects to anon, authenticated;
grant select on fanni.project_updates to anon, authenticated;
grant select on fanni.public_case_studies to anon, authenticated;
grant select on fanni.public_case_study_metrics to anon, authenticated;
grant select on fanni.signal_lab_entries to anon, authenticated;
grant select on fanni.public_evidence to anon, authenticated;
grant select on fanni.commercial_offers to anon, authenticated;

drop policy if exists public_read_published_programs on fanni.public_programs;
create policy public_read_published_programs on fanni.public_programs for select to anon, authenticated using (publication_status = 'published' and visibility = 'public');
drop policy if exists public_read_published_projects on fanni.public_projects;
create policy public_read_published_projects on fanni.public_projects for select to anon, authenticated using (publication_status = 'published' and visibility in ('public', 'anonymized'));
drop policy if exists public_read_published_updates on fanni.project_updates;
create policy public_read_published_updates on fanni.project_updates for select to anon, authenticated using (publication_status = 'published' and visibility in ('public', 'anonymized'));
drop policy if exists public_read_published_case_studies on fanni.public_case_studies;
create policy public_read_published_case_studies on fanni.public_case_studies for select to anon, authenticated using (publication_status = 'published' and visibility in ('public', 'anonymized') and client_permission_status = 'approved');
drop policy if exists public_read_case_study_metrics on fanni.public_case_study_metrics;
create policy public_read_case_study_metrics on fanni.public_case_study_metrics for select to anon, authenticated using (
  exists (
    select 1 from fanni.public_case_studies c
    where c.slug = case_study_slug
      and c.publication_status = 'published'
      and c.visibility in ('public', 'anonymized')
      and c.client_permission_status = 'approved'
  )
);
drop policy if exists public_read_published_signals on fanni.signal_lab_entries;
create policy public_read_published_signals on fanni.signal_lab_entries for select to anon, authenticated using (publication_status = 'published' and visibility = 'public');
drop policy if exists public_read_published_evidence on fanni.public_evidence;
create policy public_read_published_evidence on fanni.public_evidence for select to anon, authenticated using (publication_status = 'published' and visibility in ('public', 'anonymized') and verified = true);
drop policy if exists public_read_published_offers on fanni.commercial_offers;
create policy public_read_published_offers on fanni.commercial_offers for select to anon, authenticated using (publication_status = 'published' and visibility = 'public' and active = true);

insert into fanni.public_programs (
  slug, position, name_en, name_es, promise_en, promise_es, pain_en, pain_es,
  outcomes_en, outcomes_es, accent, offer_slug, visibility, publication_status,
  approved_at, last_verified_at
) values
  ('demand', 1, 'Fanni Demand', 'Fanni Demanda',
   'Find the problems people are already trying to pay someone to solve.',
   'Encuentra los problemas que la gente ya está intentando pagar para resolver.',
   'Businesses publish content and buy tools without knowing which customer problem deserves attention.',
   'Los negocios publican contenido y compran herramientas sin saber qué problema del cliente merece atención.',
   '["Repeated customer problems","Offer opportunities","Local demand alerts","Evidence-backed content briefs"]'::jsonb,
   '["Problemas repetidos del cliente","Oportunidades de oferta","Alertas de demanda local","Briefs de contenido con evidencia"]'::jsonb,
   'chartreuse', 'problem-scan', 'public', 'published', now(), now()),
  ('reputation', 2, 'Fanni Reputation', 'Fanni Reputación',
   'Know what is changing before a weak signal becomes an expensive problem.',
   'Entiende qué está cambiando antes de que una señal débil se convierta en un problema costoso.',
   'Teams see mentions, complaints, incidents, and news in separate systems and react too late.',
   'Los equipos ven menciones, quejas, incidentes y noticias en sistemas separados y reaccionan tarde.',
   '["Verified narratives","Regional impact","Crisis routing","Approved response drafts"]'::jsonb,
   '["Narrativas verificadas","Impacto regional","Enrutamiento de crisis","Borradores de respuesta aprobables"]'::jsonb,
   'rose', 'business-operator', 'public', 'published', now(), now()),
  ('operations', 3, 'Fanni Operations', 'Fanni Operaciones',
   'Remove the recurring work that keeps owners trapped inside the business.',
   'Elimina el trabajo repetitivo que mantiene a los dueños atrapados dentro del negocio.',
   'Too many messages, approvals, reports, clients, and applications compete for one person''s attention.',
   'Demasiados mensajes, aprobaciones, reportes, clientes y aplicaciones compiten por la atención de una sola persona.',
   '["WhatsApp intake","Approval workflows","Client follow-up","Measured owner relief"]'::jsonb,
   '["Recepción por WhatsApp","Flujos de aprobación","Seguimiento a clientes","Alivio medido para el dueño"]'::jsonb,
   'orchid', 'owner-relief', 'public', 'published', now(), now())
on conflict (slug) do update set
  position = excluded.position,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  promise_en = excluded.promise_en,
  promise_es = excluded.promise_es,
  pain_en = excluded.pain_en,
  pain_es = excluded.pain_es,
  outcomes_en = excluded.outcomes_en,
  outcomes_es = excluded.outcomes_es,
  accent = excluded.accent,
  offer_slug = excluded.offer_slug,
  visibility = excluded.visibility,
  publication_status = excluded.publication_status,
  approved_at = excluded.approved_at,
  last_verified_at = excluded.last_verified_at;

insert into fanni.public_projects (
  slug, status, project_type, client_label, title, location,
  transformation_en, transformation_es, problem_en, problem_es,
  assignment_en, assignment_es, result_en, result_es, evidence,
  stage, next_en, next_es, accent, visibility, publication_status,
  client_permission_status, approved_at, last_verified_at
) values
  ('fanni-pulso', 'active', 'internal', 'Kupuri Media', 'Fanni Pulso', 'Mexico · LATAM',
   'Turning Fanni into a WhatsApp-first signal operating system for business and community decisions.',
   'Convirtiendo a Fanni en un sistema operativo de señales por WhatsApp para decisiones empresariales y comunitarias.',
   'Social listening tools stop at dashboards while business context, approvals, and action live somewhere else.',
   'Las herramientas de escucha social terminan en tableros, mientras el contexto, las aprobaciones y la acción viven en otros lugares.',
   'Build one governed intelligence that listens, verifies, recommends, acts, measures, and learns.',
   'Construir una inteligencia gobernada que escuche, verifique, recomiende, actúe, mida y aprenda.',
   'Architecture and proof demos are merged; live-source and WhatsApp credentials remain the next implementation boundary.',
   'La arquitectura y las demostraciones están integradas; las fuentes en vivo y credenciales de WhatsApp son el siguiente límite.',
   '["39 automated tests passing","World Monitor licensing boundary","3 deterministic proof demos"]'::jsonb,
   'Orchestration foundation',
   'Connect the first live public-signal adapter and publish a coverage ledger.',
   'Conectar el primer adaptador de señales públicas y publicar un registro de cobertura.',
   'merlot', 'public', 'published', 'not_required', now(), now()),
  ('puerto-vallarta-tourism-pulse', 'active', 'lab', 'Public proof lab', 'Puerto Vallarta Tourism Pulse', 'Puerto Vallarta · Bahía de Banderas',
   'From scattered traveler questions to one verified bilingual guest advisory.',
   'De preguntas dispersas de viajeros a un aviso bilingüe verificado para huéspedes.',
   'Hotels and tour operators discover traveler concerns only after support volume rises or bookings are affected.',
   'Hoteles y operadores descubren preocupaciones de viajeros después de que aumentan las consultas o se afectan las reservas.',
   'Correlate public travel signals with authorized guest questions and recommend one useful response.',
   'Correlacionar señales públicas de viaje con preguntas autorizadas de huéspedes y recomendar una respuesta útil.',
   'The proof demo produces an evidence-aware advisory without claiming unavailable platform coverage.',
   'La demostración produce un aviso con evidencia sin afirmar cobertura de plataformas no disponibles.',
   '["Synthetic airport-transfer signal set","Coverage blind spots disclosed","Approval required before send"]'::jsonb,
   'Live-source adapter',
   'Connect weather, airport, local news, and one authorized tourism workspace.',
   'Conectar clima, aeropuerto, noticias locales y un espacio turístico autorizado.',
   'chartreuse', 'public', 'published', 'not_required', now(), now()),
  ('enterprise-reputation-nerve-center', 'active', 'lab', 'Private enterprise pattern', 'Mexican Enterprise Reputation Nerve Center', 'Mexico City · National',
   'From noisy mentions to a verified regional incident and the correct internal owner.',
   'De menciones ruidosas a un incidente regional verificado y el responsable interno correcto.',
   'A repeated story can look like a national crisis even when the underlying event is regional or unverified.',
   'Una historia repetida puede parecer una crisis nacional aunque el evento sea regional o no verificado.',
   'Deduplicate narratives, separate allegation from fact, map affected regions, and prepare an approval-ready response.',
   'Deduplicar narrativas, separar alegatos de hechos, mapear regiones afectadas y preparar una respuesta aprobable.',
   'The proof demo blocks publication until evidence and approval requirements are satisfied.',
   'La demostración bloquea la publicación hasta cumplir evidencia y aprobación.',
   '["Regional degradation distinguished","Nationwide claim rejected","Communications routing prepared"]'::jsonb,
   'Enterprise source contract',
   'Define the first licensed media provider and enterprise escalation map.',
   'Definir el primer proveedor de medios licenciado y el mapa de escalamiento empresarial.',
   'rose', 'public', 'published', 'not_required', now(), now()),
  ('barrio-shield', 'active', 'lab', 'Community proof lab', 'Barrio Shield · Escudo Comunitario', 'Jalisco',
   'From community rumor to a verified public-service instruction with uncertainty kept visible.',
   'De rumor comunitario a una instrucción de servicio público verificada, manteniendo visible la incertidumbre.',
   'Families receive urgent claims through WhatsApp without knowing what is confirmed, local, outdated, or false.',
   'Las familias reciben alertas urgentes por WhatsApp sin saber qué está confirmado, localizado, desactualizado o falso.',
   'Verify service interruptions, separate rumors, route resources, and require approval before mass communication.',
   'Verificar interrupciones, separar rumores, dirigir recursos y requerir aprobación antes de comunicación masiva.',
   'The proof demo prevents a one-source road claim from becoming the leading verified alert.',
   'La demostración evita que un reporte vial de una sola fuente se convierta en la alerta verificada principal.',
   '["Water interruption corroborated","One-source road closure suppressed","Human approval preserved"]'::jsonb,
   'Community source governance',
   'Define consent, emergency-source, and municipal partner requirements.',
   'Definir requisitos de consentimiento, fuentes de emergencia y socios municipales.',
   'orchid', 'public', 'published', 'not_required', now(), now()),
  ('kupuri-social-operations', 'active', 'internal', 'Kupuri Media', 'Kupuri Social Operations', 'Puerto Vallarta · Mexico City · Seattle corridor',
   'From scattered social tasks to a client-isolated workflow with approvals, publishing, reconciliation, and measurement.',
   'De tareas sociales dispersas a un flujo aislado por cliente con aprobaciones, publicación, conciliación y medición.',
   'Multi-client agencies risk account confusion, generic content, and unverified completion claims.',
   'Las agencias con múltiples clientes arriesgan confusión de cuentas, contenido genérico y afirmaciones no verificadas.',
   'Operate one isolated social profile per workspace through Zernio, with checkpoints before every consequential write.',
   'Operar un perfil social aislado por espacio mediante Zernio, con puntos de retorno antes de cada acción importante.',
   'The governed workflow is merged; real Zernio credentials and client accounts are not yet configured.',
   'El flujo gobernado está integrado; las credenciales reales de Zernio y cuentas de clientes aún no están configuradas.',
   '["Workspace isolation tests","Approval and checkpoint gates","Publish reconciliation contract"]'::jsonb,
   'Credentialed pilot',
   'Authorize the first internal profile and verify one scheduled post end to end.',
   'Autorizar el primer perfil interno y verificar una publicación programada de extremo a extremo.',
   'paper', 'public', 'published', 'not_required', now(), now()),
  ('whatsapp-continuity-guardian', 'research', 'pilot', 'Opportunity research', 'WhatsApp Continuity Guardian', 'Mexico · LATAM',
   'From one fragile communication channel to a governed continuity plan with approved fallback routes.',
   'De un canal frágil a un plan de continuidad gobernado con rutas alternativas aprobadas.',
   'For many small businesses, a WhatsApp restriction or outage can stop sales, support, and coordination at once.',
   'Para muchos negocios, una restricción o falla de WhatsApp puede detener ventas, soporte y coordinación al mismo tiempo.',
   'Monitor channel health, preserve consent and template discipline, and prepare alternate business routes.',
   'Monitorear la salud del canal, preservar consentimiento y disciplina de plantillas, y preparar rutas alternas.',
   'Research has defined the paid problem; no production monitoring claim is made yet.',
   'La investigación definió el problema pagado; aún no se afirma monitoreo de producción.',
   '["Recurring public owner complaints","Continuity risk documented","Fallback policy required"]'::jsonb,
   'Offer validation',
   'Interview five WhatsApp-dependent businesses and price the continuity diagnostic.',
   'Entrevistar cinco negocios dependientes de WhatsApp y poner precio al diagnóstico de continuidad.',
   'warning', 'public', 'published', 'approved', now(), now())
on conflict (slug) do update set
  status = excluded.status,
  project_type = excluded.project_type,
  client_label = excluded.client_label,
  title = excluded.title,
  location = excluded.location,
  transformation_en = excluded.transformation_en,
  transformation_es = excluded.transformation_es,
  problem_en = excluded.problem_en,
  problem_es = excluded.problem_es,
  assignment_en = excluded.assignment_en,
  assignment_es = excluded.assignment_es,
  result_en = excluded.result_en,
  result_es = excluded.result_es,
  evidence = excluded.evidence,
  stage = excluded.stage,
  next_en = excluded.next_en,
  next_es = excluded.next_es,
  accent = excluded.accent,
  visibility = excluded.visibility,
  publication_status = excluded.publication_status,
  client_permission_status = excluded.client_permission_status,
  approved_at = excluded.approved_at,
  last_verified_at = excluded.last_verified_at;

insert into fanni.signal_lab_entries (
  slug, status, theme_en, theme_es, title_en, title_es, evidence_en, evidence_es,
  offer_en, offer_es, source_class, coverage_limit_en, coverage_limit_es,
  visibility, publication_status, approved_at, last_verified_at
) values
  ('social-content-without-customer-truth', 'research', 'Marketing overload', 'Sobrecarga de marketing',
   'Small businesses do not need more generic posts. They need a system that turns real work into demand.',
   'Los pequeños negocios no necesitan más publicaciones genéricas. Necesitan convertir trabajo real en demanda.',
   'Public small-business discussions repeatedly describe social-media overwhelm, generic outsourced content, and unclear business results.',
   'Conversaciones públicas de pequeños negocios describen repetidamente saturación, contenido externo genérico y resultados poco claros.',
   'Document, Don''t Perform', 'Documenta, no actúes', 'Public Reddit research',
   'Qualitative public discussions only; no platform-wide prevalence or market-size claim.',
   'Solo conversaciones públicas cualitativas; no se afirma prevalencia en toda la plataforma ni tamaño de mercado.',
   'public', 'published', now(), now()),
  ('whatsapp-single-point-of-failure', 'research', 'Business continuity', 'Continuidad del negocio',
   'WhatsApp is an operating system for many businesses—and a dangerous single point of failure.',
   'WhatsApp es el sistema operativo de muchos negocios y también un punto único de falla peligroso.',
   'Public business-owner reports describe restrictions, support delays, and revenue exposure when the channel becomes unavailable.',
   'Reportes públicos de dueños describen restricciones, soporte tardío y exposición de ingresos cuando el canal no está disponible.',
   'WhatsApp Continuity Guardian', 'Guardián de Continuidad de WhatsApp', 'Public Reddit research',
   'Qualitative public reports; exact incidence and revenue impact remain unknown.',
   'Reportes públicos cualitativos; la incidencia exacta y el impacto en ingresos siguen siendo desconocidos.',
   'public', 'published', now(), now()),
  ('owner-attention-collapse', 'research', 'Owner capacity', 'Capacidad del dueño',
   'The owner is not the workflow. The business needs a visible system for what only the owner should decide.',
   'El dueño no es el flujo de trabajo. El negocio necesita un sistema visible para decidir qué solo debe resolver el dueño.',
   'Owners repeatedly describe too many projects, messages, approvals, and responsibilities competing for one person.',
   'Los dueños describen repetidamente demasiados proyectos, mensajes, aprobaciones y responsabilidades para una sola persona.',
   'Owner Relief System', 'Sistema de Alivio para el Dueño', 'Public Reddit research',
   'Qualitative public discussions; no claim that all owners experience the same pattern.',
   'Conversaciones públicas cualitativas; no se afirma que todos los dueños experimenten el mismo patrón.',
   'public', 'published', now(), now())
on conflict (slug) do update set
  status = excluded.status,
  theme_en = excluded.theme_en,
  theme_es = excluded.theme_es,
  title_en = excluded.title_en,
  title_es = excluded.title_es,
  evidence_en = excluded.evidence_en,
  evidence_es = excluded.evidence_es,
  offer_en = excluded.offer_en,
  offer_es = excluded.offer_es,
  source_class = excluded.source_class,
  coverage_limit_en = excluded.coverage_limit_en,
  coverage_limit_es = excluded.coverage_limit_es,
  visibility = excluded.visibility,
  publication_status = excluded.publication_status,
  approved_at = excluded.approved_at,
  last_verified_at = excluded.last_verified_at;

insert into fanni.commercial_offers (
  slug, product_key, name_en, name_es, promise_en, promise_es,
  price_display, cadence_en, cadence_es, includes_en, includes_es,
  billing_mode, active, visibility, publication_status, approved_at, last_verified_at
) values
  ('problem-scan', 'problem_scan', 'Fanni Problem Scan', 'Diagnóstico de Problema Fanni',
   'One business. One painful problem. One evidence-backed opportunity brief and 30-day action plan.',
   'Un negocio. Un problema doloroso. Un brief con evidencia y un plan de acción de 30 días.',
   'MXN 1,490', 'one-time', 'una sola vez',
   '["Customer and market signal scan","Problem and urgency ranking","One offer or workflow recommendation","Evidence and blind spots"]'::jsonb,
   '["Escaneo de señales de clientes y mercado","Clasificación de problema y urgencia","Una recomendación de oferta o flujo","Evidencia y puntos ciegos"]'::jsonb,
   'payment', true, 'public', 'published', now(), now()),
  ('demand-operator', 'demand_operator', 'Fanni Demand Operator', 'Operadora de Demanda Fanni',
   'Continuous customer-problem monitoring, opportunity alerts, offer recommendations, and evidence-backed content direction.',
   'Monitoreo continuo de problemas del cliente, alertas de oportunidad, recomendaciones de oferta y dirección de contenido con evidencia.',
   'MXN 4,900 / month · MXN 7,500 setup', 'monthly', 'mensual',
   '["Watchlist","Monthly opportunity brief","Content and offer recommendations","One connected business channel"]'::jsonb,
   '["Lista de monitoreo","Brief mensual de oportunidades","Recomendaciones de contenido y oferta","Un canal empresarial conectado"]'::jsonb,
   'subscription', true, 'public', 'published', now(), now()),
  ('owner-relief', 'business_operator', 'Fanni Business Operator', 'Operadora Empresarial Fanni',
   'WhatsApp intake, approvals, follow-up, social operations, reporting, and a measured owner-relief ledger.',
   'Recepción por WhatsApp, aprobaciones, seguimiento, operaciones sociales, reportes y medición del alivio del dueño.',
   'MXN 12,500 / month · MXN 18,000 setup', 'monthly', 'mensual',
   '["WhatsApp-first requests","Approval and return-point system","Connected application workflows","Monthly value report"]'::jsonb,
   '["Solicitudes por WhatsApp","Sistema de aprobación y retorno","Flujos con aplicaciones conectadas","Reporte mensual de valor"]'::jsonb,
   'subscription', true, 'public', 'published', now(), now()),
  ('enterprise', 'enterprise_consultation', 'Enterprise Nerve Center', 'Centro Nervioso Empresarial',
   'Private, multi-team signal intelligence with governed escalation, local/cloud deployment, auditability, and custom sources.',
   'Inteligencia privada multi-equipo con escalamiento gobernado, operación local/nube, auditoría y fuentes personalizadas.',
   'Custom', 'annual or pilot', 'anual o piloto',
   '["Regional reputation intelligence","Private deployment options","Custom connectors and policies","Service-level agreement"]'::jsonb,
   '["Inteligencia regional de reputación","Opciones de despliegue privado","Conectores y políticas personalizadas","Acuerdo de nivel de servicio"]'::jsonb,
   'consultation', true, 'public', 'published', now(), now())
on conflict (slug) do update set
  product_key = excluded.product_key,
  name_en = excluded.name_en,
  name_es = excluded.name_es,
  promise_en = excluded.promise_en,
  promise_es = excluded.promise_es,
  price_display = excluded.price_display,
  cadence_en = excluded.cadence_en,
  cadence_es = excluded.cadence_es,
  includes_en = excluded.includes_en,
  includes_es = excluded.includes_es,
  billing_mode = excluded.billing_mode,
  active = excluded.active,
  visibility = excluded.visibility,
  publication_status = excluded.publication_status,
  approved_at = excluded.approved_at,
  last_verified_at = excluded.last_verified_at;

commit;
