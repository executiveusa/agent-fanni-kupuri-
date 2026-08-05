begin;

create table if not exists fanni.heartbeat_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  heartbeat_id text not null,
  system_status text not null check (system_status in ('healthy','degraded','blocked','critical')),
  active_runs integer not null default 0,
  stalled_runs integer not null default 0,
  failed_runs integer not null default 0,
  external_writes_enabled boolean not null default false,
  real_client_data_enabled boolean not null default false,
  facts jsonb not null default '[]'::jsonb,
  inferences jsonb not null default '[]'::jsonb,
  unknowns jsonb not null default '[]'::jsonb,
  actions_taken jsonb not null default '[]'::jsonb,
  proof jsonb not null default '[]'::jsonb,
  commercial_impact jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  next_action text,
  human_attention_required boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, heartbeat_id)
);

create index if not exists heartbeat_events_workspace_created_idx
  on fanni.heartbeat_events (workspace_id, created_at desc);

alter table fanni.heartbeat_events enable row level security;

create policy heartbeat_select on fanni.heartbeat_events
  for select using (fanni.is_member(organization_id));

create policy heartbeat_insert on fanni.heartbeat_events
  for insert with check (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']));

grant select, insert on fanni.heartbeat_events to authenticated;

commit;
