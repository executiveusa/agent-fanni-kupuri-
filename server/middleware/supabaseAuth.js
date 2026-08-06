import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createServiceClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

const serviceClient = createServiceClient();

export async function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader?.startsWith('Bearer ')) {
    if (process.env.SINGLE_USER_APP === 'true' || process.env.VITE_DEMO_MODE === 'true' || !serviceClient) {
      req.user = { id: 'dev-user-0000', email: 'admin@kupurimedia.com' };
      req.supabase = serviceClient;
      return next();
    }
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const jwt = authHeader.slice(7);

  if (!serviceClient) {
    req.user = { id: 'dev-user-0000', email: 'admin@kupurimedia.com' };
    req.supabase = null;
    return next();
  }

  const { data, error } = await serviceClient.auth.getUser(jwt);
  if (error || !data?.user) {
    if (process.env.SINGLE_USER_APP === 'true') {
      req.user = { id: 'dev-user-0000', email: 'admin@kupurimedia.com' };
      req.supabase = serviceClient;
      return next();
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  req.supabase = serviceClient;
  next();
}

export async function resolveWorkspace(req, res, next) {
  const workspaceSlug = req.headers['x-fanni-workspace'] || process.env.VITE_FANNI_WORKSPACE_SLUG || 'agent-fanni-demo';

  const defaultWorkspace = {
    id: 'demo-ws-id',
    organization_id: 'demo-org-id',
    slug: workspaceSlug,
    data_class: 'synthetic',
    external_writes_enabled: false
  };
  const defaultMembership = { role: 'owner' };

  if (!req.supabase) {
    req.workspace = defaultWorkspace;
    req.membership = defaultMembership;
    return next();
  }

  try {
    const { data: workspace, error } = await req.supabase
      .schema('fanni')
      .from('workspaces')
      .select('id, organization_id, slug, data_class, external_writes_enabled')
      .eq('slug', workspaceSlug)
      .maybeSingle();

    if (error || !workspace) {
      req.workspace = defaultWorkspace;
      req.membership = defaultMembership;
      return next();
    }

    const { data: membership } = await req.supabase
      .schema('fanni')
      .from('memberships')
      .select('role')
      .eq('organization_id', workspace.organization_id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    req.workspace = workspace;
    req.membership = membership || defaultMembership;
    next();

  } catch {
    req.workspace = defaultWorkspace;
    req.membership = defaultMembership;
    next();
  }
}
