begin;

-- Durable context manifests (replaces in-memory icmRuntime)
create table if not exists fanni.context_manifests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  run_id uuid references fanni.workflow_runs(id) on delete cascade,
  manifest_version text not null default '1.0',
  workflow_key text not null,
  stage_key text not null,
  identity_files jsonb not null default '[]'::jsonb,
  references jsonb not null default '[]'::jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  authorized_tools jsonb not null default '[]'::jsonb,
  excluded_context jsonb not null default '[]'::jsonb,
  valid boolean not null default false,
  validation_errors jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists context_manifests_workspace_run_idx
  on fanni.context_manifests(workspace_id, run_id, created_at desc);

-- Durable work items (Beads ledger — replaces localStorage beadsLedger)
create table if not exists fanni.work_items (
  id text primary key,  -- bd-<timestamp>-<random> for backwards compat
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  title text not null,
  type text not null check (type in ('task','project','milestone','deliverable')) default 'task',
  status text not null check (status in ('ready','active','blocked','awaiting_review','complete','rolled_back')) default 'ready',
  workflow_key text,
  stage_key text,
  owner text not null default 'agent-fanni',
  depends_on jsonb not null default '[]'::jsonb,
  blocks jsonb not null default '[]'::jsonb,
  context_manifest_ref jsonb,
  checkpoint_before text,
  checkpoint_after text,
  artifacts jsonb not null default '[]'::jsonb,
  proof jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  rollback_ref text,
  next_action text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_items_workspace_status_idx
  on fanni.work_items(workspace_id, status, created_at desc);
create index if not exists work_items_workflow_key_idx
  on fanni.work_items(workspace_id, workflow_key);

-- Durable checkpoints (replaces localStorage checkpoints)
create table if not exists fanni.checkpoints (
  id text primary key,  -- cp-<timestamp>-<random> for backwards compat
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  workflow_key text not null,
  stage_key text not null,
  reason text not null default 'stage boundary',
  state jsonb not null default '{}'::jsonb,
  verified boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists checkpoints_workspace_workflow_idx
  on fanni.checkpoints(workspace_id, workflow_key, created_at desc);

-- Rollback events
create table if not exists fanni.rollback_events (
  id text primary key,  -- rollback-<timestamp>
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  from_checkpoint_id text not null,
  to_checkpoint_id text not null,
  safety_checkpoint_id text,
  authorized_by uuid not null references auth.users(id),
  rationale text,
  integrity_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists rollback_events_workspace_idx
  on fanni.rollback_events(workspace_id, created_at desc);

-- Persona versions
create table if not exists fanni.persona_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  persona_id text not null,
  version integer not null,
  name text not null,
  heart_sha text,
  persona_sha text,
  heartbeat_sha text,
  agents_sha text,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default false,
  activated_by uuid references auth.users(id),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, persona_id, version)
);

create index if not exists persona_versions_active_idx
  on fanni.persona_versions(workspace_id, persona_id, active)
  where active = true;

-- Enable RLS
alter table fanni.context_manifests enable row level security;
alter table fanni.work_items enable row level security;
alter table fanni.checkpoints enable row level security;
alter table fanni.rollback_events enable row level security;
alter table fanni.persona_versions enable row level security;

-- RLS policies: context_manifests
create policy context_manifests_select on fanni.context_manifests
  for select using (fanni.is_member(organization_id));
create policy context_manifests_insert on fanni.context_manifests
  for insert with check (fanni.has_role(organization_id, array['owner','admin','operator']));

-- RLS policies: work_items
create policy work_items_select on fanni.work_items
  for select using (fanni.is_member(organization_id));
create policy work_items_insert on fanni.work_items
  for insert with check (fanni.has_role(organization_id, array['owner','admin','operator']));
create policy work_items_update on fanni.work_items
  for update using (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']))
  with check (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']));

-- RLS policies: checkpoints
create policy checkpoints_select on fanni.checkpoints
  for select using (fanni.is_member(organization_id));
create policy checkpoints_insert on fanni.checkpoints
  for insert with check (fanni.has_role(organization_id, array['owner','admin','operator']));

-- RLS policies: rollback_events
create policy rollback_events_select on fanni.rollback_events
  for select using (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']));
create policy rollback_events_insert on fanni.rollback_events
  for insert with check (fanni.has_role(organization_id, array['owner','admin']));

-- RLS policies: persona_versions
create policy persona_versions_select on fanni.persona_versions
  for select using (fanni.is_member(organization_id));
create policy persona_versions_write on fanni.persona_versions
  for all using (fanni.has_role(organization_id, array['owner','admin']))
  with check (fanni.has_role(organization_id, array['owner','admin']));

-- Grants
grant select, insert, update on fanni.context_manifests to authenticated;
grant select, insert, update on fanni.work_items to authenticated;
grant select, insert on fanni.checkpoints to authenticated;
grant select, insert on fanni.rollback_events to authenticated;
grant select, insert, update on fanni.persona_versions to authenticated;

-- Bootstrap function: creates Kupuri Media org + Fanni demo workspace for user
create or replace function fanni.bootstrap_fanni_workspace(
  p_user_id uuid,
  p_org_name text default 'Kupuri Media',
  p_org_slug text default 'kupuri-media',
  p_workspace_name text default 'Agent Fanni Demo',
  p_workspace_slug text default 'agent-fanni-demo'
)
returns jsonb
language plpgsql
security definer
set search_path = fanni, public
as $$
declare
  v_org_id uuid;
  v_workspace_id uuid;
begin
  -- Upsert organization
  insert into fanni.organizations (name, slug)
  values (p_org_name, p_org_slug)
  on conflict (slug) do update set name = excluded.name
  returning id into v_org_id;

  -- Upsert membership as owner
  insert into fanni.memberships (organization_id, user_id, role)
  values (v_org_id, p_user_id, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';

  -- Upsert workspace
  insert into fanni.workspaces (organization_id, name, slug, data_class, external_writes_enabled, created_by)
  values (v_org_id, p_workspace_name, p_workspace_slug, 'synthetic', false, p_user_id)
  on conflict (organization_id, slug) do update set name = excluded.name
  returning id into v_workspace_id;

  return jsonb_build_object(
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id,
    'role', 'owner'
  );
end;
$$;

commit;
