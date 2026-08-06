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
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const jwt = authHeader.slice(7);

  if (!serviceClient) {
    return res.status(503).json({ error: 'Supabase service not configured' });
  }

  const { data, error } = await serviceClient.auth.getUser(jwt);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  req.supabase = serviceClient;
  next();
}

export async function resolveWorkspace(req, res, next) {
  const workspaceSlug = req.headers['x-fanni-workspace'] || process.env.VITE_FANNI_WORKSPACE_SLUG || 'agent-fanni-demo';

  const { data: workspace, error } = await req.supabase
    .schema('fanni')
    .from('workspaces')
    .select('id, organization_id, slug, data_class, external_writes_enabled')
    .eq('slug', workspaceSlug)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Workspace resolution failed' });
  if (!workspace) return res.status(403).json({ error: `Workspace '${workspaceSlug}' not accessible` });

  const { data: membership } = await req.supabase
    .schema('fanni')
    .from('memberships')
    .select('role')
    .eq('organization_id', workspace.organization_id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!membership) return res.status(403).json({ error: 'Workspace membership not found' });

  req.workspace = workspace;
  req.membership = membership;
  next();
}
