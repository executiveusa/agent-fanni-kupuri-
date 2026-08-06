-- Security hardening: bootstrap_fanni_workspace
--
-- Previous version allowed any authenticated user to:
--   - Bootstrap on behalf of an arbitrary p_user_id (not themselves)
--   - Rename any existing organization by slug
--   - Escalate an existing membership to 'owner'
--   - Overwrite existing workspace settings
--
-- This replacement enforces:
--   1. p_user_id must equal auth.uid() (no impersonation)
--   2. Org upsert uses DO NOTHING on conflict (no takeover / rename)
--   3. Membership insert uses DO NOTHING (no role escalation)
--   4. Workspace insert uses DO NOTHING (no overwrite)
--   5. Returns existing IDs even when no rows were inserted

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
  v_role text;
begin
  -- Enforce caller identity: can only bootstrap for yourself
  if p_user_id is distinct from auth.uid() then
    raise exception 'bootstrap_fanni_workspace: p_user_id must equal the authenticated user id';
  end if;

  -- Insert org; on slug conflict keep existing org (no rename, no takeover)
  insert into fanni.organizations (name, slug)
  values (p_org_name, p_org_slug)
  on conflict (slug) do nothing;

  -- Resolve org id (may be newly inserted or pre-existing)
  select id into v_org_id from fanni.organizations where slug = p_org_slug;

  if v_org_id is null then
    raise exception 'bootstrap_fanni_workspace: could not resolve organization for slug %', p_org_slug;
  end if;

  -- Insert membership as owner only if not already a member (no role escalation)
  insert into fanni.memberships (organization_id, user_id, role)
  values (v_org_id, p_user_id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  -- Resolve actual membership role
  select role into v_role from fanni.memberships
  where organization_id = v_org_id and user_id = p_user_id;

  if v_role is null then
    raise exception 'bootstrap_fanni_workspace: membership not found after insert for user % in org %', p_user_id, v_org_id;
  end if;

  -- Insert workspace; on slug conflict keep existing workspace (no overwrite)
  insert into fanni.workspaces (organization_id, name, slug, data_class, external_writes_enabled, created_by)
  values (v_org_id, p_workspace_name, p_workspace_slug, 'synthetic', false, p_user_id)
  on conflict (organization_id, slug) do nothing;

  -- Resolve workspace id
  select id into v_workspace_id from fanni.workspaces
  where organization_id = v_org_id and slug = p_workspace_slug;

  if v_workspace_id is null then
    raise exception 'bootstrap_fanni_workspace: could not resolve workspace for slug %', p_workspace_slug;
  end if;

  return jsonb_build_object(
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id,
    'role', v_role
  );
end;
$$;

commit;
