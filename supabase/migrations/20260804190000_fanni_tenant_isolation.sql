begin;

create schema if not exists fanni;

create table if not exists fanni.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists fanni.memberships (
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','operator','reviewer','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists fanni.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  data_class text not null default 'synthetic' check (data_class in ('synthetic','internal','confidential','regulated')),
  external_writes_enabled boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists fanni.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
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

create table if not exists fanni.signals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  run_id uuid references fanni.workflow_runs(id) on delete set null,
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

create table if not exists fanni.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  run_id uuid not null references fanni.workflow_runs(id) on delete cascade,
  action_key text not null,
  decision text not null check (decision in ('approved','rejected','changes_requested')),
  decided_by uuid not null references auth.users(id),
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists fanni.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid references fanni.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('human','agent','system')),
  event_type text not null,
  object_type text not null,
  object_id text,
  payload_redacted jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function fanni.is_member(org_id uuid)
returns boolean language sql stable security definer set search_path = fanni, public
as $$ select exists (select 1 from fanni.memberships m where m.organization_id = org_id and m.user_id = auth.uid()) $$;

create or replace function fanni.has_role(org_id uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = fanni, public
as $$ select exists (select 1 from fanni.memberships m where m.organization_id = org_id and m.user_id = auth.uid() and m.role = any(allowed_roles)) $$;

alter table fanni.organizations enable row level security;
alter table fanni.memberships enable row level security;
alter table fanni.workspaces enable row level security;
alter table fanni.workflow_runs enable row level security;
alter table fanni.signals enable row level security;
alter table fanni.approvals enable row level security;
alter table fanni.audit_events enable row level security;

create policy org_select on fanni.organizations for select using (fanni.is_member(id));
create policy membership_select on fanni.memberships for select using (fanni.is_member(organization_id));
create policy workspace_select on fanni.workspaces for select using (fanni.is_member(organization_id));
create policy workspace_write on fanni.workspaces for all using (fanni.has_role(organization_id, array['owner','admin'])) with check (fanni.has_role(organization_id, array['owner','admin']));
create policy runs_select on fanni.workflow_runs for select using (fanni.is_member(organization_id));
create policy runs_insert on fanni.workflow_runs for insert with check (fanni.has_role(organization_id, array['owner','admin','operator']));
create policy runs_update on fanni.workflow_runs for update using (fanni.has_role(organization_id, array['owner','admin','operator','reviewer'])) with check (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']));
create policy signals_select on fanni.signals for select using (fanni.is_member(organization_id));
create policy signals_write on fanni.signals for all using (fanni.has_role(organization_id, array['owner','admin','operator'])) with check (fanni.has_role(organization_id, array['owner','admin','operator']));
create policy approvals_select on fanni.approvals for select using (fanni.is_member(organization_id));
create policy approvals_insert on fanni.approvals for insert with check (fanni.has_role(organization_id, array['owner','admin','reviewer']));
create policy audit_select on fanni.audit_events for select using (fanni.has_role(organization_id, array['owner','admin','reviewer']));
create policy audit_insert on fanni.audit_events for insert with check (fanni.is_member(organization_id));

revoke all on schema fanni from public;
grant usage on schema fanni to authenticated;
grant select, insert, update on all tables in schema fanni to authenticated;
grant usage, select on all sequences in schema fanni to authenticated;

commit;
