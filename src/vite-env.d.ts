/// <reference types="vite/client" />

interface Window {
  __fanniSupabase?: import('@supabase/supabase-js').SupabaseClient;
}
