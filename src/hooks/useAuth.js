import { useState, useEffect, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const AuthContext = createContext({ user: null, session: null, loading: true, configured: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, configured: Boolean(supabase) };
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithMagicLink(email) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function bootstrapWorkspace(userId) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.rpc('bootstrap_fanni_workspace', { p_user_id: userId });
  if (error) throw error;
  return data;
}
