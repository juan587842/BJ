import { createBrowserClient, parse, serialize } from '@supabase/ssr';
import type { Database } from '@/types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          if (typeof window === 'undefined') return undefined;
          const cookie = parse(document.cookie);
          return cookie[name];
        },
        set(name, value, options) {
          if (typeof window === 'undefined') return;
          document.cookie = serialize(name, value, {
            ...options,
            path: '/',
          });
        },
        remove(name, options) {
          if (typeof window === 'undefined') return;
          document.cookie = serialize(name, '', {
            ...options,
            path: '/',
            maxAge: 0,
          });
        },
      },
    }
  );
}
