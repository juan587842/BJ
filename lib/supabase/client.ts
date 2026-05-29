import { createBrowserClient, parse, serialize } from '@supabase/ssr';
import type { Database } from '@/types';

export function createClient() {
  return createBrowserClient<Database, 'public'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof window === 'undefined') return [];
          const cookies = parse(document.cookie);
          return Object.entries(cookies).map(([name, value]) => ({ name, value: value ?? '' }));
        },
        setAll(cookiesToSet) {
          if (typeof window === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serialize(name, value, {
              ...options,
              path: '/',
            });
          });
        },
      },
    }
  );
}
