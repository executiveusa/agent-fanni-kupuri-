begin;

create table if not exists fanni.provider_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  run_id uuid references fanni.workflow_runs(id) on delete cascade,
  route_key text not null,
  provider text not null,
  model text,
  attempt integer not null check (attempt > 0),
  status text not null check (status in ('started','succeeded','failed','timed_out','rate_limited')),
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric(12,6),
  error_code text,
  error_message_redacted text,
  created_at timestamptz not null default now()
);

create index if not exists provider_attempts_workspace_created_idx
  on fanni.provider_attempts(workspace_id, created_at desc);
create index if not exists provider_attempts_run_idx
  on fanni.provider_attempts(run_id);

create table if not exists fanni.memory_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  scope text not null check (scope in ('workspace','workflow','persona')),
  collection_key text not null,
  source_type text not null,
  source_hash text,
  content_redacted text not null,
  metadata jsonb not null default '{}'::jsonb,
  similarity numeric(5,4),
  injection_signals jsonb not null default '[]'::jsonb,
  safe_for_prompt boolean not null default false,
  approved boolean not null default false,
  approved_by uuid references auth.users(id),
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists memory_entries_workspace_collection_idx
  on fanni.memory_entries(workspace_id, collection_key, created_at desc);
create index if not exists memory_entries_expiry_idx
  on fanni.memory_entries(expires_at) where expires_at is not null;

create table if not exists fanni.evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  workflow_key text not null,
  suite_key text not null,
  status text not null check (status in ('queued','running','passed','failed','blocked')),
  score numeric(7,4),
  metrics jsonb not null default '{}'::jsonb,
  failures jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  commit_sha text,
  started_by uuid references auth.users(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table fanni.provider_attempts enable row level security;
alter table fanni.memory_entries enable row level security;
alter table fanni.evaluation_runs enable row level security;

create policy provider_attempts_select on fanni.provider_attempts
  for select using (fanni.is_member(organization_id));
create policy provider_attempts_insert on fanni.provider_attempts
  for insert with check (fanni.has_role(organization_id, array['owner','admin','operator']));

create policy memory_entries_select on fanni.memory_entries
  for select using (fanni.is_member(organization_id));
create policy memory_entries_write on fanni.memory_entries
  for all using (fanni.has_role(organization_id, array['owner','admin','operator']))
  with check (fanni.has_role(organization_id, array['owner','admin','operator']));

create policy evaluation_runs_select on fanni.evaluation_runs
  for select using (fanni.is_member(organization_id));
create policy evaluation_runs_write on fanni.evaluation_runs
  for all using (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']))
  with check (fanni.has_role(organization_id, array['owner','admin','operator','reviewer']));

grant select, insert on fanni.provider_attempts to authenticated;
grant select, insert, update, delete on fanni.memory_entries to authenticated;
grant select, insert, update on fanni.evaluation_runs to authenticated;

commit;
