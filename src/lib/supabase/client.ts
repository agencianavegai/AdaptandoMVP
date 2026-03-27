import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prerender safe: if env var is missing or invalid, fallback to placeholder
  const validUrl = url && url.startsWith('http') ? url : 'https://placeholder.supabase.co';

  return createBrowserClient(
    validUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );
}
