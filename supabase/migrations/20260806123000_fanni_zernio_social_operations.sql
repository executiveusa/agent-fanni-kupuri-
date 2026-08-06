begin;

create table if not exists fanni.social_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  provider text not null check (provider in ('zernio')),
  external_profile_id text not null,
  external_profile_name text,
  status text not null default 'pending_accounts' check (status in ('pending_accounts','active','degraded','disabled','offboarded')),
  configuration_redacted jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider),
  unique (provider, external_profile_id)
);

create table if not exists fanni.social_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  integration_id uuid not null references fanni.social_integrations(id) on delete cascade,
  external_account_id text not null,
  platform text not null,
  username text,
  display_name text,
  status text not null default 'active' check (status in ('active','expired','degraded','disconnected')),
  metadata_redacted jsonb not null default '{}'::jsonb,
  last_health_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, external_account_id)
);

create table if not exists fanni.social_jobs (
  id uuid primary key,
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  integration_id uuid references fanni.social_integrations(id) on delete set null,
  workflow_run_id uuid references fanni.workflow_runs(id) on delete set null,
  work_item_id uuid references fanni.work_items(id) on delete set null,
  external_profile_id text not null,
  external_post_id text,
  brief jsonb not null default '{}'::jsonb,
  content text,
  media_items jsonb not null default '[]'::jsonb,
  platforms jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  scheduled_for timestamptz,
  timezone text not null default 'UTC',
  publish_now boolean not null default false,
  idempotency_key text not null unique,
  status text not null default 'draft' check (status in ('draft','awaiting_approval','approved','scheduled','publishing','published','partial_failure','failed','cancelled','rolled_back')),
  requires_approval boolean not null default true,
  checkpoint_id uuid references fanni.checkpoints(id) on delete set null,
  provider_response_redacted jsonb not null default '{}'::jsonb,
  error_redacted jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists fanni.social_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  social_job_id uuid references fanni.social_jobs(id) on delete set null,
  action_type text not null check (action_type in ('reply_comment','reply_dm','like_comment','hide_comment','delete_comment','moderate_comment','pause_post','delete_post')),
  payload_redacted jsonb not null default '{}'::jsonb,
  status text not null default 'awaiting_approval' check (status in ('draft','awaiting_approval','approved','executing','complete','rejected','failed')),
  requires_approval boolean not null default true,
  approval_id uuid references fanni.approvals(id) on delete set null,
  provider_response_redacted jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists fanni.social_webhook_events (
  id text primary key,
  provider text not null default 'zernio',
  event_type text not null,
  organization_id uuid references fanni.organizations(id) on delete cascade,
  workspace_id uuid references fanni.workspaces(id) on delete cascade,
  external_profile_id text,
  external_account_id text,
  payload_redacted jsonb not null default '{}'::jsonb,
  signature_valid boolean not null,
  processing_status text not null default 'accepted' check (processing_status in ('accepted','processing','processed','ignored','failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_redacted jsonb not null default '{}'::jsonb
);

create table if not exists fanni.social_metrics (
  id bigint generated always as identity primary key,
  organization_id uuid not null references fanni.organizations(id) on delete cascade,
  workspace_id uuid not null references fanni.workspaces(id) on delete cascade,
  social_job_id uuid references fanni.social_jobs(id) on delete cascade,
  external_account_id text,
  platform text not null,
  metric_date date not null,
  metrics jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  synced_at timestamptz not null default now(),
  unique (workspace_id, social_job_id, external_account_id, platform, metric_date)
);

alter table fanni.social_integrations enable row level security;
alter table fanni.social_accounts enable row level security;
alter table fanni.social_jobs enable row level security;
alter table fanni.social_actions enable row level security;
alter table fanni.social_webhook_events enable row level security;
alter table fanni.social_metrics enable row level security;

create policy social_integrations_member_access on fanni.social_integrations
for all using (fanni.is_member(organization_id))
with check (fanni.is_member(organization_id));

create policy social_accounts_member_access on fanni.social_accounts
for all using (fanni.is_member(organization_id))
with check (fanni.is_member(organization_id));

create policy social_jobs_member_access on fanni.social_jobs
for all using (fanni.is_member(organization_id))
with check (fanni.is_member(organization_id));

create policy social_actions_member_access on fanni.social_actions
for all using (fanni.is_member(organization_id))
with check (fanni.is_member(organization_id));

create policy social_webhooks_member_read on fanni.social_webhook_events
for select using (organization_id is not null and fanni.is_member(organization_id));

create policy social_metrics_member_access on fanni.social_metrics
for all using (fanni.is_member(organization_id))
with check (fanni.is_member(organization_id));

create index if not exists social_jobs_workspace_status_idx on fanni.social_jobs(workspace_id, status, scheduled_for);
create index if not exists social_actions_workspace_status_idx on fanni.social_actions(workspace_id, status, created_at desc);
create index if not exists social_accounts_workspace_platform_idx on fanni.social_accounts(workspace_id, platform, status);
create index if not exists social_webhook_events_profile_idx on fanni.social_webhook_events(external_profile_id, received_at desc);
create index if not exists social_metrics_workspace_date_idx on fanni.social_metrics(workspace_id, metric_date desc);

commit;
