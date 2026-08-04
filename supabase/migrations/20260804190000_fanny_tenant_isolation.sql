begin;

create schema if not exists fanny;

create table if not exists fanny.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists fanny.memberships (
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','reviewer','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists fanny.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  data_class text not null default 'synthetic' check (data_class in ('synthetic','internal','confidential','regulated')),
  external_writes_enabled boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists fanny.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  workspace_id uuid not null references fanny.workspaces(id) on delete cascade,
  workflow_key text not null,
  stage_key text not null,
  status text not null check (status in ('queued','running','awaiting_review','approved','failed','rolled_back','complete')),
  input_manifest jsonb not null default '{}'::jsonb,
  output_manifest jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  started_by uuid not null references auth.users(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists fanny.signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  workspace_id uuid not null references fanny.workspaces(id) on delete cascade,
  run_id uuid references fanny.workflow_runs(id) on delete set null,
  source_type text not null,
  source_ref_hash text,
  title text,
  body_redacted text,
  language text not null default 'es',
  topic text,
  dimension text,
  sentiment text,
  risk text,
  confidence numeric(5,2),
  requires_review boolean not null default true,
  classification_evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists fanny.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  workspace_id uuid not null references fanny.workspaces(id) on delete cascade,
  run_id uuid not null references fanny.workflow_runs(id) on delete cascade,
  action_key text not null,
  decision text not null check (decision in ('approved','rejected','changes_requested')),
  decided_by uuid not null references auth.users(id),
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists fanny.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references fanny.organizations(id) on delete cascade,
  workspace_id uuid references fanny.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('human','agent','system')),
  event_type text not null,
  object_type text not null,
  object_id text,
  payload_redacted jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function fanny.is_member(org_id uuid)
returns boolean language sql stable security definer set search_path = fanny, public
as $$ select exists (select 1 from fanny.memberships m where m.organization_id = org_id and m.user_id = auth.uid()) $$;

create or replace function fanny.has_role(org_id uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = fanny, public
as $$ select exists (select 1 from fanny.memberships m where m.organization_id = org_id and m.user_id = auth.uid() and m.role = any(allowed_roles)) $$;

alter table fanny.organizations enable row level security;
alter table fanny.memberships enable row level security;
alter table fanny.workspaces enable row level security;
alter table fanny.workflow_runs enable row level security;
alter table fanny.signals enable row level security;
alter table fanny.approvals enable row level security;
alter table fanny.audit_events enable row level security;

create policy org_select on fanny.organizations for select using (fanny.is_member(id));
create policy membership_select on fanny.memberships for select using (fanny.is_member(organization_id));
create policy workspace_select on fanny.workspaces for select using (fanny.is_member(organization_id));
create policy workspace_write on fanny.workspaces for all using (fanny.has_role(organization_id, array['owner','admin'])) with check (fanny.has_role(organization_id, array['owner','admin']));
create policy runs_select on fanny.workflow_runs for select using (fanny.is_member(organization_id));
create policy runs_insert on fanny.workflow_runs for insert with check (fanny.has_role(organization_id, array['owner','admin','operator']));
create policy runs_update on fanny.workflow_runs for update using (fanny.has_role(organization_id, array['owner','admin','operator','reviewer'])) with check (fanny.has_role(organization_id, array['owner','admin','operator','reviewer']));
create policy signals_select on fanny.signals for select using (fanny.is_member(organization_id));
create policy signals_write on fanny.signals for all using (fanny.has_role(organization_id, array['owner','admin','operator'])) with check (fanny.has_role(organization_id, array['owner','admin','operator']));
create policy approvals_select on fanny.approvals for select using (fanny.is_member(organization_id));
create policy approvals_insert on fanny.approvals for insert with check (fanny.has_role(organization_id, array['owner','admin','reviewer']));
create policy audit_select on fanny.audit_events for select using (fanny.has_role(organization_id, array['owner','admin','reviewer']));
create policy audit_insert on fanny.audit_events for insert with check (fanny.is_member(organization_id));

revoke all on schema fanny from public;
grant usage on schema fanny to authenticated;
grant select, insert, update on all tables in schema fanny to authenticated;
grant usage, select on all sequences in schema fanny to authenticated;

commit;
